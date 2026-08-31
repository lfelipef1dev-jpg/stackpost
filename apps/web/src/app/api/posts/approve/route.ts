import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { posts_approveBodySchema, posts_approveQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['review', 'scheduled'],
  review: ['approved', 'draft'],
  approved: ['scheduled', 'processing'],
  scheduled: ['processing', 'draft'],
  processing: ['posted', 'error'],
  posted: [],
  error: ['draft', 'scheduled'],
};

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = posts_approveBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { postId, action } = body;

  if (!postId || !action) {
    return NextResponse.json({ error: 'postId e action obrigatorios' }, { status: 400 });
  }

  const actions: Record<string, string> = {
    submit_for_review: 'review',
    approve: 'approved',
    reject: 'draft',
    schedule: 'scheduled',
    publish: 'processing',
  };

  const newStatus = actions[action];
  if (!newStatus) {
    return NextResponse.json({ error: 'Acao invalida' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('team_id', user!.teamId)
      .single();
    if (postError || !post) {
      return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
    }

    const currentStatus = post.status;

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({
        error: `Transicao invalida: ${currentStatus} -> ${newStatus}`,
        allowedTransitions: allowed,
      }, { status: 400 });
    }

    if (action === 'approve') {
      const { error: approvalError } = await requireRole(req, PERMISSIONS.MANAGE);
      if (approvalError) {
        return NextResponse.json({ error: 'Apenas admins podem aprovar posts' }, { status: 403 });
      }
    }

    const { data, error: updateError } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        approved_by: action === 'approve' ? user!.id : null,
      })
      .eq('id', postId)
      .select()
      .single();
    if (updateError) throw updateError;

    return NextResponse.json(data);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = posts_approveQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const status = searchParams.get('status') || 'review';

  try {
    const supabase = getSupabase();
    const { data, error: queryError } = await supabase
      .from('posts')
      .select('*')
      .eq('team_id', user!.teamId)
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (queryError) throw queryError;
    return NextResponse.json(data || []);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
