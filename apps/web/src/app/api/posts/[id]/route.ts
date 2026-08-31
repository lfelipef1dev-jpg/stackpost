import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { posts_idBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/posts/[id] — buscar post
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, post_platforms(*)')
    .eq('id', id)
    .eq('team_id', user.teamId)
    .maybeSingle();
  if (error || !post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
  return NextResponse.json(post);
}

// PATCH /api/posts/[id] — editar post
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = posts_idBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const supabase = getSupabase();

  const updates: any = {};
  if (body.content !== undefined) updates.content = body.content;
  if (body.platforms !== undefined) updates.platforms = body.platforms;
  if (body.uploadIds !== undefined) updates.upload_ids = body.uploadIds;
  if (body.scheduledAt !== undefined) updates.scheduled_at = body.scheduledAt;
  if (body.firstComment !== undefined) updates.first_comment = body.firstComment;
  if (body.derivatives !== undefined) updates.derivatives = body.derivatives;
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .eq('team_id', user.teamId)
    .select()
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Post nao encontrado ou erro ao atualizar' }, { status: 404 });
  return NextResponse.json(data);
}

// DELETE /api/posts/[id] — deletar post (e tentar deletar nas plataformas)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  // Buscar post_platforms com external_id
  const { data: ppRows } = await supabase
    .from('post_platforms')
    .select('platform, external_id')
    .eq('post_id', id)
    .eq('status', 'posted')
    .not('external_id', 'is', null);

  // Buscar contas ativas
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('team_id', user.teamId)
    .eq('status', 'active');

  // Tentar deletar em cada plataforma
  for (const pp of ppRows || []) {
    const account = (accounts || []).find((a) => a.platform === pp.platform);
    if (!account?.access_token || !pp.external_id) continue;

    try {
      if (pp.platform === 'instagram' || pp.platform === 'facebook') {
        await fetch(`https://graph.facebook.com/v26.0/${pp.external_id}?access_token=${account.access_token}`, {
          method: 'DELETE',
        });
      } else if (pp.platform === 'linkedin') {
        await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(pp.external_id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${account.access_token}` },
        });
      } else if (pp.platform === 'x') {
        await fetch(`https://api.twitter.com/2/tweets/${pp.external_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${account.access_token}` },
        });
      } else if (pp.platform === 'youtube') {
        await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${pp.external_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${account.access_token}` },
        });
      }
    } catch (err) {
      logger.warn(`Delete on ${pp.platform} error:`, err);
    }
  }

  // Deletar do banco
  await supabase.from('post_platforms').delete().eq('post_id', id);
  const { error } = await supabase.from('posts').delete().eq('id', id).eq('team_id', user.teamId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
