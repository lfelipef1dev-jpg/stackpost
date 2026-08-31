import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const supabase = getSupabase();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, plan_id, status, current_period_end, created_at');
  const { data: plans } = await supabase.from('plans').select('id, slug, name, price_cents, currency, interval');
  const planMap = new Map((plans || []).map((p: any) => [p.id, p]));

  const now = new Date().toISOString();

  let mrr = 0;
  let active = 0;
  let trialing = 0;
  let pastDue = 0;
  let canceled = 0;
  let totalRevenue = 0;
  const byPlan: Record<string, { name: string; count: number; revenue: number }> = {};

  for (const s of subs || []) {
    const plan = planMap.get(s.plan_id) || { price_cents: 0 };
    const price = (plan.price_cents || 0) / 100;
    if (s.status === 'active' || s.status === 'trialing') {
      mrr += price;
      active++;
    }
    if (s.status === 'trialing') trialing++;
    if (s.status === 'past_due') pastDue++;
    if (s.status === 'canceled') canceled++;
    totalRevenue += price;
    const slug = plan.slug || s.plan_id;
    if (!byPlan[slug]) byPlan[slug] = { name: plan.name || slug, count: 0, revenue: 0 };
    byPlan[slug].count++;
    byPlan[slug].revenue += price;
  }

  const { data: payments } = await supabase.from('stackpost_processed_payments').select('valor_processado, processado_em');
  const revenueThisMonth = (payments || []).reduce((acc: number, p: any) => {
    if (p.processado_em?.startsWith(now.slice(0, 7))) return acc + (Number(p.valor_processado) || 0);
    return acc;
  }, 0);

  return NextResponse.json({
    mrr: Math.round(mrr * 100),
    total_revenue: Math.round(totalRevenue * 100),
    revenue_this_month: Math.round(revenueThisMonth * 100),
    active_subscriptions: active,
    trialing: trialing,
    past_due: pastDue,
    canceled: canceled,
    total_subscriptions: (subs || []).length,
    by_plan: byPlan,
  });
}
