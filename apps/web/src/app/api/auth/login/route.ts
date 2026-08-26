import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';
import { SignJWT } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', sha256(password))
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const token = await new SignJWT({ sub: user.id, email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
