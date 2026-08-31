import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { posts_variantsBodySchema, posts_variantsQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = posts_variantsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const postId = searchParams.get('postId');

  try {
    const supabase = getSupabase();
    if (postId) {
      const { data: postIds, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('team_id', user!.teamId);
      if (postsError) throw postsError;
      const ids = (postIds || []).map((p) => p.id);
      if (ids.length === 0) {
        return NextResponse.json([]);
      }
      const { data, error: queryError } = await supabase
        .from('post_variants')
        .select('*')
        .eq('post_id', postId)
        .in('post_id', ids)
        .order('created_at', { ascending: true });
      if (queryError) throw queryError;
      return NextResponse.json(data || []);
    }

    const { data: postIds, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user!.teamId);
    if (postsError) throw postsError;
    const ids = (postIds || []).map((p) => p.id);
    if (ids.length === 0) {
      return NextResponse.json([]);
    }
    const { data, error: queryError } = await supabase
      .from('post_variants')
      .select('*, posts!inner(team_id)')
      .in('post_id', ids)
      .order('created_at', { ascending: false })
      .limit(100);
    if (queryError) throw queryError;
    return NextResponse.json(data || []);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = posts_variantsBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { postId, label, content, weight } = body;

  if (!postId || !content) {
    return NextResponse.json({ error: 'postId e content obrigatorios' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: postCheck, error: postError } = await supabase
      .from('posts')
      .select('team_id')
      .eq('id', postId)
      .single();
    if (postError || !postCheck || postCheck.team_id !== user!.teamId) {
      return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
    }

    const variantId = uuid();
    const { data, error: insertError } = await supabase
      .from('post_variants')
      .insert({
        id: variantId,
        post_id: postId,
        label: label || 'Variant A',
        content,
        weight: weight || 50,
        status: 'active',
      })
      .select()
      .single();
    if (insertError) throw insertError;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const bodyRaw2 = await req.json();
  const parsed2 = posts_variantsBodySchema.safeParse(bodyRaw2);
  if (!parsed2.success) return NextResponse.json(parsed2.error.issues, { status: 400 });
  const body = bodyRaw2;
  const { id, weight, status, metrics } = body;

  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    const updates: Record<string, any> = {};

    if (weight !== undefined) {
      updates.weight = weight;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (metrics !== undefined) {
      updates.metrics = metrics;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }

    const { data: postIds, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user!.teamId);
    if (postsError) throw postsError;
    const ids = (postIds || []).map((p) => p.id);
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Variante nao encontrada' }, { status: 404 });
    }

    const { data, error: updateError } = await supabase
      .from('post_variants')
      .update(updates)
      .eq('id', id)
      .in('post_id', ids)
      .select()
      .single();
    if (updateError) throw updateError;
    if (!data) {
      return NextResponse.json({ error: 'Variante nao encontrada' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
