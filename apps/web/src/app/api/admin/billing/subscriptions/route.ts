import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const plan = url.searchParams.get('plan');
  const period = url.searchParams.get('period');

  const supabase = getSupabase();
  let query = supabase
    .from('subscriptions')
    .select('id, organization_id, plan_id, plan_slug, status, payment_provider, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (plan && plan !== 'all') {
    query = query.or(`plan_slug.eq.${plan},plan_id.eq.${plan}`);
  }
  if (period) {
    const now = new Date().toISOString();
    if (period === 'current') {
      query = query.lte('current_period_start', now).gte('current_period_end', now);
    } else if (period === 'expired') {
      query = query.lt('current_period_end', now);
    } else if (period === 'future') {
      query = query.gt('current_period_start', now);
    }
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar assinaturas' }, { status: 500 });
  }

  const subs = data || [];
  const orgIds = [...new Set(subs.map((s: any) => s.organization_id).filter(Boolean))];
  const planIds = [...new Set(subs.map((s: any) => s.plan_id).filter(Boolean))];

  const { data: orgs } = orgIds.length
    ? await supabase.from('organizations').select('id, name, slug').in('id', orgIds)
    : { data: [] };
  const { data: plans } = planIds.length
    ? await supabase.from('plans').select('id, slug, name, price_cents, currency, interval').in('id', planIds)
    : { data: [] };

  const ownerMap = new Map<string, any>();
  if (orgIds.length) {
    const { data: teams } = await supabase.from('teams').select('id, organization_id, owner_id').in('organization_id', orgIds);
    const userIds = [...new Set((teams || []).map((t: any) => t.owner_id).filter(Boolean))];
    const teamByOrg = new Map<string, any[]>();
    for (const t of teams || []) {
      const arr = teamByOrg.get(t.organization_id) || [];
      arr.push(t);
      teamByOrg.set(t.organization_id, arr);
    }
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
      for (const u of users || []) ownerMap.set(u.id, u);
    }
    for (const [orgId, teamsList] of teamByOrg.entries()) {
      const firstOwner = teamsList.find((t) => t.owner_id);
      const org = (orgs || []).find((o: any) => o.id === orgId);
      if (org && firstOwner) {
        (org as any).__owner = ownerMap.get(firstOwner.owner_id) || null;
      }
    }
  }

  const orgMap = new Map((orgs || []).map((o: any) => [o.id, { ...o, owner: (o as any).__owner || null }]));
  const planMap = new Map((plans || []).map((p: any) => [p.id, p]));

  const enriched = subs.map((s: any) => ({
    id: s.id,
    organization: orgMap.get(s.organization_id) || { id: s.organization_id, name: '-', slug: null, owner: null },
    plan: planMap.get(s.plan_id) || { id: s.plan_id, slug: s.plan_slug, name: s.plan_slug || '-', price_cents: 0, currency: 'BRL', interval: 'month' },
    status: s.status,
    current_period_start: s.current_period_start,
    current_period_end: s.current_period_end,
    payment_provider: s.payment_provider,
    provider_subscription_id: s.provider_subscription_id,
    created_at: s.created_at,
  }));

  return NextResponse.json(enriched);
}
