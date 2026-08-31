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
    return NextResponse.json({ error: 'Erro ao listar faturas' }, { status: 500 });
  }

  const payments = data || [];
  const orderIds = [...new Set(payments.map((p: any) => p.order_id).filter(Boolean))];

  const { data: orders } = orderIds.length
    ? await supabase.from('stackpost_orders').select('order_id, status, total, team_id').in('order_id', orderIds)
    : { data: [] };

  const teamIds = [...new Set(payments.map((p: any) => p.team_id).filter(Boolean))];
  const { data: teams } = teamIds.length
    ? await supabase.from('teams').select('id, name, organization_id').in('id', teamIds)
    : { data: [] };

  const orgIds = [...new Set((teams || []).map((t: any) => t.organization_id).filter(Boolean))];
  const { data: orgs } = orgIds.length
    ? await supabase.from('organizations').select('id, name, slug').in('id', orgIds)
    : { data: [] };

  const orderMap = new Map((orders || []).map((o: any) => [o.order_id, o]));
  const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));
  const orgMap = new Map((orgs || []).map((o: any) => [o.id, o]));

  const invoices = payments.map((p: any, index: number) => {
    const order = orderMap.get(p.order_id) || null;
    const team = teamMap.get(p.team_id);
    const org = team ? orgMap.get(team.organization_id) : null;
    const status = order?.status || 'paid';
    const amount = Number(order?.total || 0);

    return {
      invoice_id: `INV-${p.payment_id || p.id}-${index + 1}`.slice(0, 64),
      organization: org || { id: team?.organization_id, name: '-', slug: null },
      amount,
      status,
      date: p.processado_em,
      pdf_url: null,
    };
  });

  return NextResponse.json(invoices);
}
