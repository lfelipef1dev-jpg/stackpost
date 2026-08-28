import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/comments/[id]/retry — retry publicar comment que falhou
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabase();

  try {
    const { data: comment, error: cError } = await supabase
      .from('comments')
      .select('*, posts!inner(team_id, id)')
      .eq('id', id)
      .single();
    if (cError || !comment) return NextResponse.json({ error: 'Comment nao encontrado' }, { status: 404 });
    if (comment.posts?.team_id !== user.teamId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Reset status e chamar publish
    await supabase.from('comments').update({ status: 'pending' }).eq('id', id);

    // Re-dispatch para a rota de publish
    const publishRes = await fetch(new URL('/api/comments/publish', req.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
      body: JSON.stringify({ commentId: id }),
    });

    const data = await publishRes.json();
    return NextResponse.json(data, { status: publishRes.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
