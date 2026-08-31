import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';
import { SignJWT } from 'jose';
import { compare } from 'bcryptjs';
import { requireEnv } from '@/lib/env';
import { setTokenCookie } from '@/lib/cookies';

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export async function POST(req: NextRequest) {
  const bodyRaw1 = await req.json();
  const parsed = loginSchema.safeParse(bodyRaw1);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, team_id, email, name, role, password_hash')
      .eq('email', email)
      .single();

    if (error || !user || !(await compare(password, user.password_hash))) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;

    const token = await new SignJWT({ sub: user.id, email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const res = NextResponse.json({ user: safeUser });
    setTokenCookie(req, res, token);
    return res;
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
