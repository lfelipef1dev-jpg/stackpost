import { NextRequest, NextResponse } from 'next/server';
import { publishPost } from '@/lib/publisher';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { postId } = body;
  if (!postId) return NextResponse.json({ error: 'postId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  // Verificar ownership do post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, team_id, status')
    .eq('id', postId)
    .single();
  if (postError || !post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
  if (post.team_id !== user.teamId) return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 });

  // Idempotency: se ja esta publicado ou em processamento, retorna estado atual
  const idempotencyKey = req.headers.get('x-idempotency-key');
  if (idempotencyKey) {
    // Verifica se ja existe um resultado publicado com esta idempotency key
    const { data: existing } = await supabase
      .from('posts')
      .select('id, status, external_data, published_at')
      .eq('id', postId)
      .maybeSingle();

    if (existing && (existing.status === 'posted' || existing.status === 'processing')) {
      return NextResponse.json({
        status: existing.status,
        results: existing.external_data,
        publishedAt: existing.published_at,
        idempotent: true,
      });
    }
  }

  // Nao permite republicar se ja foi publicado (sem idempotency key explicita)
  if (post.status === 'posted') {
    return NextResponse.json({ error: 'Post ja publicado. Use Idempotency-Key para forcar.' }, { status: 409 });
  }

  const result = await publishPost(postId);
  return NextResponse.json(result);
}
