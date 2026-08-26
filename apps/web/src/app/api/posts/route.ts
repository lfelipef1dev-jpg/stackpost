import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { postSchema } from '@/lib/schemas';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    const supabase = getSupabase();
    let query = supabase.from('posts').select('*').eq('team_id', user!.teamId);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    query = query.order('created_at', { ascending: false }).limit(limit + 1);

    const { data, error: queryError } = await query;
    if (queryError) throw queryError;

    const rows = data || [];
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const supabase = getSupabase();
  const idempotencyKey = req.headers.get('x-idempotency-key');
  if (idempotencyKey) {
    const { data: existing, error: idemError } = await supabase
      .from('posts')
      .select('*')
      .eq('team_id', user!.teamId)
      .eq('idempotency_key', idempotencyKey);
    if (idemError) throw idemError;
    if (existing && existing.length > 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { content, platforms, uploadIds, scheduledAt, firstComment, postType } = parsed.data as any;
  const status = scheduledAt ? 'scheduled' : 'draft';

  try {
    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        team_id: user!.teamId,
        content,
        platforms,
        upload_ids: uploadIds || null,
        scheduled_at: scheduledAt || null,
        status,
        idempotency_key: idempotencyKey || null,
        post_type: postType || 'POST',
        first_comment: firstComment || null,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    for (const platform of platforms) {
      const { error: ppError } = await supabase
        .from('post_platforms')
        .insert({
          post_id: post.id,
          platform,
          status: 'pending',
        });
      if (ppError) throw ppError;
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const body = await req.json();
  const { id, scheduledAt, status } = body;

  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  const allowedStatuses = ['draft', 'review', 'approved', 'scheduled', 'processing', 'posted', 'error'];
  const newStatus = status || (scheduledAt ? 'scheduled' : 'draft');

  if (!allowedStatuses.includes(newStatus)) {
    return NextResponse.json({ error: 'Status invalido' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error: updateError } = await supabase
      .from('posts')
      .update({
        scheduled_at: scheduledAt,
        status: newStatus,
      })
      .eq('id', id)
      .eq('team_id', user!.teamId)
      .select()
      .single();
    if (updateError) throw updateError;
    if (!data) {
      return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    const { error: ppError } = await supabase.from('post_platforms').delete().eq('post_id', id);
    if (ppError) throw ppError;
    const { error: postError } = await supabase.from('posts').delete().eq('id', id).eq('team_id', user!.teamId);
    if (postError) throw postError;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
