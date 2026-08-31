import { NextRequest, NextResponse } from 'next/server';
import { getNexusSupabase } from '@/lib/supabase-nexus';
import { getSupabase } from '@/lib/supabase';
import { SignJWT } from 'jose';
import { requireEnv } from '@/lib/env';
import { setTokenCookie } from '@/lib/cookies';

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export async function POST(req: NextRequest) {
  const { access_token, refresh_token, redirect } = (await req.json()) as {
    access_token?: string;
    refresh_token?: string;
    redirect?: string;
  };

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Tokens ausentes' }, { status: 400 });
  }

  const nexus = getNexusSupabase();
  nexus.auth.setSession({ access_token, refresh_token });
  const { data, error } = await nexus.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
  }

  const nexusUser = data.user;
  const email = nexusUser.email || '';
  const name =
    nexusUser.user_metadata?.full_name ||
    nexusUser.user_metadata?.name ||
    email.split('@')[0];

  if (!email) {
    return NextResponse.json({ error: 'Email ausente' }, { status: 400 });
  }

  const supabase = getSupabase();

  let { data: user } = await supabase
    .from('users')
    .select('id, team_id, email, name, role')
    .eq('email', email)
    .single();

  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role: 'user',
        status: 'active',
        provider: 'oauth',
      })
      .select('id, team_id, email, name, role')
      .single();

    if (createError || !newUser) {
      return NextResponse.json({ error: 'Erro ao criar usuario' }, { status: 500 });
    }

    user = newUser;

    await supabase.from('teams').insert({
      owner_id: user.id,
      name: 'Meu workspace',
      slug: `workspace-${user.id.slice(0, 8)}`,
    });
  }

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const res = NextResponse.json({ redirect: redirect?.startsWith('/') ? redirect : '/dashboard' });
  setTokenCookie(req, res, token);
  return res;
}
