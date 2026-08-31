import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('stackpost_processed_payments')
    .select('id, payment_id, order_id, team_id, plano, processado_em')
    .order('processado_em', { ascending: false })
    .limit(1000);

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar pagamentos' }, { status: 500 });
  }

  const payments = data || [];
  const teamIds = [...new Set(payments.map((p: any) => p.team_id).filter(Boolean))];
  const orderIds = [...new Set(payments.map((p: any) => p.order_id).filter(Boolean))];

  const [{ data: teams }, { data: orders }] = await Promise.all([
    teamIds.length ? supabase.from('teams').select('id, name, organization_id').in('id', teamIds) : { data: [] },
    orderIds.length ? supabase.from('stackpost_orders').select('order_id, status, total, atualizado_em').in('order_id', orderIds) : { data: [] },
  ]);

  const orgIds = [...new Set((teams || []).map((t: any) => t.organization_id).filter(Boolean))];
  const { data: orgs } = orgIds.length
    ? await supabase.from('organizations').select('id, name, slug').in('id', orgIds)
    : { data: [] };

  const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));
  const orgMap = new Map((orgs || []).map((o: any) => [o.id, o]));
  const orderMap = new Map((orders || []).map((o: any) => [o.order_id, o]));

  const enriched = payments.map((p: any) => {
    const team = teamMap.get(p.team_id);
    const org = team ? orgMap.get(team.organization_id) : null;
    const order = orderMap.get(p.order_id) || null;
    return {
      id: p.id,
      payment_id: p.payment_id,
      order_id: p.order_id,
      plano: p.plano,
      status: order?.status || 'unknown',
      amount_cents: order ? Math.round(Number(order.total || 0) * 100) : 0,
      amount: Number(order?.total || 0),
      currency: 'BRL',
      processed_at: p.processado_em,
      organization: org || { id: team?.organization_id, name: '-', slug: null },
      team: team || { id: p.team_id, name: '-' },
    };
  });

  return NextResponse.json(enriched);
}
