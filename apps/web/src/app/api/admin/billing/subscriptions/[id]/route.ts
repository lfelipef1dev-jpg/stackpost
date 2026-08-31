import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  plan_id: z.string().uuid().optional(),
  plan_slug: z.string().optional(),
  status: z.enum(['active', 'past_due', 'canceled', 'trialing', 'paused']).optional(),
  current_period_start: z.string().datetime().optional(),
  current_period_end: z.string().datetime().optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error: dbError } = await supabase
    .from('subscriptions')
    .select('id, organization_id, plan_id, plan_slug, status, payment_provider, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at')
    .eq('id', id)
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: 'Assinatura nao encontrada' }, { status: 404 });
  }

  const [{ data: org }, { data: plan }] = await Promise.all([
    supabase.from('organizations').select('id, name, slug, plan, plan_status, owner_id').eq('id', data.organization_id).single(),
    data.plan_id ? supabase.from('plans').select('id, slug, name, price_cents, currency, interval').eq('id', data.plan_id).single() : { data: null },
  ]);

  let owner = null;
  if (org?.owner_id) {
    const { data: ownerRow } = await supabase.from('users').select('id, name, email').eq('id', org.owner_id).single();
    owner = ownerRow;
  }

  const { data: teams } = await supabase.from('teams').select('id').eq('organization_id', data.organization_id);
  const teamIds = (teams || []).map((t: any) => t.id);
  const { data: payments } = teamIds.length
    ? await supabase
        .from('stackpost_processed_payments')
        .select('id, payment_id, order_id, team_id, plano, processado_em')
        .in('team_id', teamIds)
        .order('processado_em', { ascending: false })
    : { data: [] };

  return NextResponse.json({
    ...data,
    organization: org ? { ...org, owner } : null,
    plan: plan || null,
    payment_history: payments || [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'billing.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase
    .from('subscriptions')
    .select('id, organization_id, plan_id, plan_slug, status, current_period_start, current_period_end')
    .eq('id', id)
    .single();
  if (!before) {
    return NextResponse.json({ error: 'Assinatura nao encontrada' }, { status: 404 });
  }

  const update = { ...parsed.data, updated_at: new Date().toISOString() };
  const { data, error: dbError } = await supabase
    .from('subscriptions')
    .update(update)
    .eq('id', id)
    .select('id, organization_id, plan_id, plan_slug, status, payment_provider, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at')
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.subscription.update',
    resource: 'subscriptions',
    resourceId: id,
    metadata: { before, after: data, changes: parsed.data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}
