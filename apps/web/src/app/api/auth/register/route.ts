import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { registerSchema } from '@/lib/schemas';
import { SignJWT } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
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

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ team_id: teamId, email, name, password_hash: sha256(password), role: 'admin' })
      .select('*')
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    const token = await new SignJWT({ sub: user.id, email, name, role: user.role, teamId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
