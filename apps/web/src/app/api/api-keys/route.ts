import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { createHmac, randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_prefix, name, last_used_at, created_at')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const name = body.name || 'Default';

  const rawKey = `pk_live_${randomBytes(24).toString('hex')}`;
  const keyPrefix = rawKey.substring(0, 12);
  const keyHash = createHmac('sha256', process.env.JWT_SECRET || 'fallback').update(rawKey).digest('hex');

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .insert({ team_id: user.teamId, key_hash: keyHash, key_prefix: keyPrefix, name })
      .select('id, key_prefix, name, created_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ ...data, key: rawKey }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('team_id', user.teamId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
