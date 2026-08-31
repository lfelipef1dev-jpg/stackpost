import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { commentsBodySchema, uuidSchema, commentsQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { normalizeError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = commentsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const postId = searchParams.get('postId');

  const supabase = getSupabase();

  try {
    if (postId) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('team_id')
        .eq('id', postId)
        .maybeSingle();
      if (postError) throw postError;

      if (!post || post.team_id !== user.teamId) {
        return NextResponse.json([]);
      }

      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (commentsError) throw commentsError;

      const rows = (comments || []).map((c: any) => ({ ...c, team_id: user.teamId }));
      return NextResponse.json(rows);
    }

    const { data: teamPosts, error: teamPostsError } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId);
    if (teamPostsError) throw teamPostsError;

    const postIds = (teamPosts || []).map((p: any) => p.id);
    if (postIds.length === 0) return NextResponse.json([]);

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: false })
      .limit(100);
    if (commentsError) throw commentsError;

    const rows = (comments || []).map((c: any) => ({ ...c, team_id: user.teamId }));
    return NextResponse.json(rows);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = commentsBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { postId, platform, text, scheduledAt } = body;

  if (!postId || !platform || !text) {
    return NextResponse.json({ error: 'postId, platform e text obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('team_id')
      .eq('id', postId)
      .maybeSingle();
    if (postError) throw postError;

    if (!post || post.team_id !== user.teamId) {
      return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
    }

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({ post_id: postId, platform, text, status: scheduledAt ? 'scheduled' : 'pending', scheduled_at: scheduledAt || null })
      .select()
      .single();
    if (insertError) throw insertError;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error, platform);
    return NextResponse.json({ error: normalized }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = commentsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const idRaw = searchParams.get('id');
  const idParsed1 = uuidSchema.safeParse(idRaw);
  if (!idParsed1.success) return NextResponse.json({ error: 'id inválido ou ausente' }, { status: 400 });
  const id = idParsed1.data;
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: teamPosts, error: teamPostsError } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId);
    if (teamPostsError) throw teamPostsError;

    const postIds = (teamPosts || []).map((p: any) => p.id);
    if (postIds.length === 0) return NextResponse.json({ success: true });

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .in('post_id', postIds);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
