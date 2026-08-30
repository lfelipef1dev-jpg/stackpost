import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { consultarPreapproval } from '@/lib/mercadopago';

/**
 * Cron: Renovação de assinaturas.
 * Busca subscriptions ativas com current_period_end < now() e verifica cobrança no MP.
 * Valida CRON_SECRET no header Authorization.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  try {
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('id, organization_id, plan_slug, provider_subscription_id, current_period_start, current_period_end')
      .eq('status', 'active')
      .lt('current_period_end', now)
      .not('provider_subscription_id', 'is', null);

    if (error) throw error;

    let renewed = 0;
    let pastDue = 0;

    for (const sub of subs || []) {
      try {
        if (!sub.provider_subscription_id) continue;
        const preapproval = await consultarPreapproval(sub.provider_subscription_id);

        // Verifica se houve cobrança aprovada consultando pagamentos processados recentes
        const { data: recentPayment } = await supabase
          .from('stackpost_processed_payments')
          .select('payment_id, amount_cents, processado_em')
          .eq('order_id', sub.provider_subscription_id)
          .eq('status', 'approved')
          .order('processado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentPayment && preapproval.status === 'authorized') {
          // Cobrança aprovada — avança período
          const newStart = new Date(sub.current_period_end || now);
          const newEnd = new Date(newStart);
          newEnd.setMonth(newEnd.getMonth() + 1);

          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: newStart.toISOString(),
              current_period_end: newEnd.toISOString(),
              updated_at: now,
            })
            .eq('id', sub.id);

          // Gera invoice do novo período
          const invoiceNumber = `SP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
          await supabase.from('invoices').insert({
            organization_id: sub.organization_id,
            subscription_id: sub.id,
            invoice_number: invoiceNumber,
            status: 'paid',
            period_start: newStart.toISOString(),
            period_end: newEnd.toISOString(),
            subtotal_cents: recentPayment.amount_cents || 0,
            total_cents: recentPayment.amount_cents || 0,
            amount_due_cents: recentPayment.amount_cents || 0,
            paid_at: now,
            line_items: [
              {
                description: `Assinatura StackPost - Plano ${sub.plan_slug}`,
                quantity: 1,
                unit_cost_cents: recentPayment.amount_cents || 0,
                total_cents: recentPayment.amount_cents || 0,
              },
            ],
          });
          renewed++;
        } else {
          // Cobrança não confirmada — marca como past_due (dunning no cron dedicado)
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: now })
            .eq('id', sub.id);
          pastDue++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error(`[cron/billing-renewal] Erro sub ${sub.id}:`, msg);
      }
    }

    return NextResponse.json({
      ok: true,
      cron: 'billing-renewal',
      renewed,
      past_due: pastDue,
      total: (subs || []).length,
      timestamp: now,
    });
  } catch (err: any) {
    logger.error('Cron billing-renewal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
