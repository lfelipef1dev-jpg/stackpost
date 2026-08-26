import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('link_in_bio')
      .select('*')
      .eq('team_id', user.teamId)
      .order('position', { ascending: true });
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
  const { title, url } = body;

  if (!title || !url) return NextResponse.json({ error: 'title e url obrigatorios' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: maxData, error: maxError } = await supabase
      .from('link_in_bio')
      .select('position')
      .eq('team_id', user.teamId)
      .order('position', { ascending: false })
      .limit(1);
    if (maxError) throw maxError;
    const position = (maxData?.[0]?.position || 0) + 1;

    const { data, error } = await supabase
      .from('link_in_bio')
      .insert({ team_id: user.teamId, title, url, position })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { id, direction } = body;

  if (!id || !direction) return NextResponse.json({ error: 'id e direction obrigatorios' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: allLinks, error: linksError } = await supabase
      .from('link_in_bio')
      .select('id, position')
      .eq('team_id', user.teamId)
      .order('position', { ascending: true });
    if (linksError) throw linksError;
    const links = allLinks || [];
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Link nao encontrado' }, { status: 404 });

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= links.length) return NextResponse.json({ error: 'Movimento invalido' }, { status: 400 });

    const a = links[idx];
    const b = links[swapIdx];

    const { error: updateAError } = await supabase
      .from('link_in_bio')
      .update({ position: b.position })
      .eq('id', a.id);
    if (updateAError) throw updateAError;

    const { error: updateBError } = await supabase
      .from('link_in_bio')
      .update({ position: a.position })
      .eq('id', b.id);
    if (updateBError) throw updateBError;

    return NextResponse.json({ success: true });
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
      .from('link_in_bio')
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
