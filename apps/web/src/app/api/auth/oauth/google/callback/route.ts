import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { SignJWT } from 'jose';
import { setTokenCookie } from '@/lib/cookies';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

function decodeState(state: string): { redirect: string; nonce: string } | null {
  try {
    const json = Buffer.from(state, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json);
    if (typeof parsed.redirect === 'string' && typeof parsed.nonce === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', BASE_URL));
  }
  if (!stateParam) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', BASE_URL));
  }

  const stateData = decodeState(stateParam);
  if (!stateData) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', BASE_URL));
  }

  const safeRedirect = stateData.redirect.startsWith('/') ? stateData.redirect : '/dashboard';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  if (!clientId || !clientSecret) {
    logger.error('Google OAuth: credenciais nao configuradas');
    return NextResponse.redirect(new URL('/login?error=oauth_config', BASE_URL));
  }
  if (!jwtSecret) {
    logger.error('Google OAuth: JWT_SECRET nao configurado');
    return NextResponse.redirect(new URL('/login?error=oauth_config', BASE_URL));
  }

  const redirectUri = `${BASE_URL}/api/auth/oauth/google/callback`;

  try {
    // 1. Trocar code por token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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
      logger.error('Google token exchange failed:', JSON.stringify(tokenData));
      return NextResponse.redirect(new URL(`/login?error=oauth_failed&reason=${encodeURIComponent(tokenData.error || 'token_exchange')}`, BASE_URL));
    }

    // 2. Pegar dados do usuario
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json();
    if (!userRes.ok || !userInfo.email) {
      logger.error('Google userinfo failed:', JSON.stringify(userInfo));
      return NextResponse.redirect(new URL('/login?error=oauth_failed&reason=no_email', BASE_URL));
    }

    const email = userInfo.email;
    const name = userInfo.name || userInfo.given_name || email.split('@')[0];
    const avatar = userInfo.picture || null;

    // 3. Buscar ou criar usuario
    const supabase = getSupabase();

    let { data: user } = await supabase
      .from('users')
      .select('id, team_id, email, name, role')
      .eq('email', email)
      .single();

    if (!user) {
      const { data: orgRow, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: `${name} Org`, plan: 'free' })
        .select('id')
        .single();
      if (orgError || !orgRow) {
        logger.error('Erro ao criar organizacao:', orgError?.message);
        return NextResponse.redirect(new URL('/login?error=oauth_failed&reason=org_create', BASE_URL));
      }

      const { data: teamRow, error: teamError } = await supabase
        .from('teams')
        .insert({ organization_id: orgRow.id, name: 'Default' })
        .select('id')
        .single();
      if (teamError || !teamRow) {
        logger.error('Erro ao criar team:', teamError?.message);
        return NextResponse.redirect(new URL('/login?error=oauth_failed&reason=team_create', BASE_URL));
      }

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          team_id: teamRow.id,
          email,
          name,
          role: 'admin',
          status: 'active',
          provider: 'google',
          avatar_url: avatar,
        })
        .select('id, team_id, email, name, role')
        .single();
      if (userError || !newUser) {
        logger.error('Erro ao criar usuario:', userError?.message);
        return NextResponse.redirect(new URL('/login?error=oauth_failed&reason=user_create', BASE_URL));
      }

      user = newUser;

      await supabase
        .from('team_members')
        .insert({ team_id: teamRow.id, user_id: user.id, role: 'admin' });
    } else if (avatar) {
      await supabase.from('users').update({ avatar_url: avatar }).eq('id', user.id);
    }

    // 4. Emitir JWT
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.team_id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(jwtSecret));

    // 5. Setar cookie e redirecionar
    const res = NextResponse.redirect(new URL(safeRedirect, BASE_URL));
    setTokenCookie(req, res, token);
    return res;
  } catch (err: any) {
    const errMsg = err?.message || 'unknown';
    logger.error('Google OAuth callback error:', errMsg);
    return NextResponse.redirect(new URL(`/login?error=oauth_failed&reason=${encodeURIComponent(errMsg)}`, BASE_URL));
  }
}
