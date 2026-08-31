import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { SignJWT } from 'jose';
import { requireEnv } from '@/lib/env';
import { setTokenCookie } from '@/lib/cookies';

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_auth')?.value;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', BASE_URL));
  }
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', BASE_URL));
  }

  // Extrair redirect do state (formato: provider:redirect:random)
  const redirect = state.split(':')[1] || '/dashboard';
  const safeRedirect = redirect.startsWith('/') ? redirect : '/dashboard';

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    logger.error('DISCORD_CLIENT_ID ou DISCORD_CLIENT_SECRET nao configurado');
    return NextResponse.redirect(new URL('/login?error=oauth_config', BASE_URL));
  }

  const redirectUri = `${BASE_URL}/api/auth/oauth/discord/callback`;

  try {
    // 1. Trocar code por token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || 'Discord token exchange failed');
    }

    // 2. Pegar dados do usuario
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json();
    if (!userRes.ok || !userInfo.email) {
      throw new Error('Falha ao obter email do usuario Discord');
    }

    const email = userInfo.email;
    const name = userInfo.global_name || userInfo.username || email.split('@')[0];
    const avatar = userInfo.avatar
      ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`
      : null;

    // 3. Buscar ou criar usuario no StackPost
    const supabase = getSupabase();

    let { data: user } = await supabase
      .from('users')
      .select('id, team_id, email, name, role')
      .eq('email', email)
      .single();

    if (!user) {
      // Criar organizacao + team + usuario (mesmo padrao do register)
      const { data: orgRow, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: `${name} Org`, plan: 'free' })
        .select('id')
        .single();
      if (orgError || !orgRow) throw new Error('Erro ao criar organizacao');

      const { data: teamRow, error: teamError } = await supabase
        .from('teams')
        .insert({ organization_id: orgRow.id, name: 'Default' })
        .select('id')
        .single();
      if (teamError || !teamRow) throw new Error('Erro ao criar team');

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          team_id: teamRow.id,
          email,
          name,
          role: 'admin',
          status: 'active',
          provider: 'discord',
          avatar_url: avatar,
        })
        .select('id, team_id, email, name, role')
        .single();
      if (userError || !newUser) throw new Error('Erro ao criar usuario');

      user = newUser;

      await supabase
        .from('team_members')
        .insert({ team_id: teamRow.id, user_id: user.id, role: 'admin' });
    } else {
      // Atualizar avatar se tiver
      if (avatar) {
        await supabase.from('users').update({ avatar_url: avatar }).eq('id', user.id);
      }
    }

    // 4. Emitir JWT (mesmo padrao do login/register)
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.team_id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // 5. Setar cookie e redirecionar
    const res = NextResponse.redirect(new URL(safeRedirect, BASE_URL));
    setTokenCookie(req, res, token);
    // Limpar cookie de state
    res.cookies.delete('oauth_state_auth');
    return res;
  } catch (err: any) {
    logger.error('Discord OAuth callback error:', err);
    return NextResponse.redirect(new URL(`/login?error=oauth_failed`, BASE_URL));
  }
}
