import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { registerSchema } from '@/lib/schemas';
import { SignJWT } from 'jose';
import { hash } from 'bcryptjs';
import { requireEnv } from '@/lib/env';
import { setTokenCookie } from '@/lib/cookies';

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export async function POST(req: NextRequest) {
  const bodyRaw1 = await req.json();
  const parsed = registerSchema.safeParse(bodyRaw1);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  try {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Usuario ja existe' }, { status: 409 });
    }

    const { data: orgRow, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: `${name} Org`, plan: 'free' })
      .select('id')
      .single();
    if (orgError || !orgRow) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
    const orgId = orgRow.id;

    const { data: teamRow, error: teamError } = await supabase
      .from('teams')
      .insert({ organization_id: orgId, name: 'Default' })
      .select('id')
      .single();
    if (teamError || !teamRow) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
    const teamId = teamRow.id;

    const passwordHash = await hash(password, 12);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ team_id: teamId, email, name, password_hash: passwordHash, role: 'admin' })
      .select('id, team_id, email, name, role')
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: user.id, role: 'admin' });

    const token = await new SignJWT({ sub: user.id, email, name, role: user.role, teamId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const res = NextResponse.json({ user });
    setTokenCookie(req, res, token);
    return res;
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
