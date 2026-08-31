import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price_cents: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  interval: z.enum(['month', 'year', 'lifetime']).optional(),
  trial_days: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  is_public: z.boolean().optional(),
  sort_order: z.number().int().optional(),
}).strict();

const DEFAULT_LIMITS = ['posts_per_day', 'posts_per_month', 'uploads_per_month', 'team_members', 'workspaces'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req, 'plans.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error: dbError } = await supabase
    .from('plans')
    .select('*, limits:plan_limits(*), features:plan_features(*)')
    .eq('id', id)
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 });
  }

  const { count } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_id', id);

  return NextResponse.json({ ...data, subscriber_count: count || 0 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'plans.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase.from('plans').select('*').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 });
  }

  const update = { ...parsed.data, updated_at: new Date().toISOString() };
  const { data, error: dbError } = await supabase
    .from('plans')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.plan.update',
    resource: 'plans',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'plans.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase.from('plans').select('id, name, is_active').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('plans')
    .update({ is_active: false, is_public: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.plan.archive',
    resource: 'plans',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
