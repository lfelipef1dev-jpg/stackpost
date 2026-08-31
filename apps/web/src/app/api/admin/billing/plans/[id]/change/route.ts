import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const changeSchema = z.object({
  subscription_id: z.string().uuid(),
}).strict();

const INTERVAL_DAYS: Record<string, number> = {
  month: 30,
  year: 365,
  lifetime: 36500,
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'billing.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = changeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: newPlan } = await supabase.from('plans').select('id, slug, name, price_cents, currency, interval').eq('id', id).single();
  if (!newPlan) {
    return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, organization_id, plan_id, plan_slug, status, current_period_start, current_period_end, created_at')
    .eq('id', parsed.data.subscription_id)
    .single();
  if (!subscription) {
    return NextResponse.json({ error: 'Assinatura nao encontrada' }, { status: 404 });
  }

  const { data: oldPlan } = subscription.plan_id
    ? await supabase.from('plans').select('id, slug, name, price_cents, interval').eq('id', subscription.plan_id).single()
    : { data: { id: null, slug: null, name: null, price_cents: 0, interval: 'month' } };

  const oldPrice = oldPlan?.price_cents || 0;
  const newPrice = newPlan.price_cents || 0;
  const now = new Date().toISOString();
  const currentEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : new Date();
  const currentStart = subscription.current_period_start ? new Date(subscription.current_period_start) : new Date(subscription.created_at);
  const totalDays = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.round((currentEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const unusedCreditCents = Math.round((oldPrice / totalDays) * remainingDays);
  const newPeriodCostCents = newPrice;
  const proratedCents = unusedCreditCents - newPeriodCostCents;

  const interval = newPlan.interval || 'month';
  const days = INTERVAL_DAYS[interval] || 30;
  const newEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('subscriptions')
    .update({
      plan_id: newPlan.id,
      plan_slug: newPlan.slug,
      current_period_start: now,
      current_period_end: newEnd,
      updated_at: now,
    })
    .eq('id', subscription.id)
    .select('id, organization_id, plan_id, plan_slug, status, current_period_start, current_period_end, created_at, updated_at')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase
    .from('organizations')
    .update({ plan: newPlan.slug, plan_status: 'active', updated_at: now })
    .eq('id', subscription.organization_id);

  if (proratedCents !== 0) {
    const { data: team } = await supabase.from('teams').select('id').eq('organization_id', subscription.organization_id).limit(1).single();
    if (team) {
      await supabase.from('credit_transactions').insert({
        team_id: team.id,
        platform: 'mercadopago',
        amount: proratedCents,
        type: 'manual_adjustment',
        description: `Ajuste pro-rata na mudanca de plano: ${oldPlan?.name || '-'} -> ${newPlan.name}`,
        reference_id: subscription.id,
        created_by: admin.id,
        created_at: now,
      });
    }
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.subscription.change_plan',
    resource: 'subscriptions',
    resourceId: subscription.id,
    metadata: {
      before: { plan_id: subscription.plan_id, plan_slug: subscription.plan_slug, current_period_start: subscription.current_period_start, current_period_end: subscription.current_period_end },
      after: updated,
      new_plan: newPlan,
      old_plan: oldPlan,
      prorated_cents: proratedCents,
    },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({
    subscription: updated,
    prorated_cents: proratedCents,
    new_plan: newPlan,
    old_plan: oldPlan,
  });
}
