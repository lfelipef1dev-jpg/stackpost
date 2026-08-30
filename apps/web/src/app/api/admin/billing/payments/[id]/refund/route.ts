import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { criarReembolso } from '@/lib/mercadopago';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const refundSchema = z.object({
  reason: z.string().min(1),
  amount_cents: z.number().int().min(1),
}).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'billing.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = refundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: payment, error: paymentError } = await supabase
    .from('stackpost_processed_payments')
    .select('id, payment_id, order_id, team_id, plano, processado_em, amount_cents')
    .eq('id', id)
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'Pagamento nao encontrado' }, { status: 404 });
  }

  if (!payment.team_id) {
    return NextResponse.json({ error: 'Pagamento sem team_id associado' }, { status: 400 });
  }

  if (!payment.payment_id) {
    return NextResponse.json({ error: 'Pagamento sem payment_id no gateway' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('stackpost_orders')
    .select('order_id, status, total')
    .eq('order_id', payment.order_id)
    .single();

  const reason = parsed.data.reason;
  const amountCents = parsed.data.amount_cents;

  // 1) Chamar reembolso no Mercado Pago ANTES de gravar no banco
  // amount em reais (MP usa valor decimal, não centavos)
  const refundAmountReais = amountCents / 100;
  try {
    const refundResult = await criarReembolso(payment.payment_id, refundAmountReais);

    // 2) Só grava no banco se o reembolso no MP for bem-sucedido
    const { error: creditError } = await supabase.from('credit_transactions').insert({
      team_id: payment.team_id,
      platform: 'mercadopago',
      amount: -amountCents,
      type: 'refund',
      description: reason,
      reference_id: payment.payment_id,
      created_by: admin.id,
      created_at: new Date().toISOString(),
    });

    if (creditError) {
      logger.error('[admin/refund] Erro ao registrar credit_transaction:', creditError.message);
      return NextResponse.json({ error: creditError.message }, { status: 500 });
    }

    // Atualiza stackpost_processed_payments com valor reembolsado
    await supabase
      .from('stackpost_processed_payments')
      .update({
        refund_amount_cents: amountCents,
        status: 'refunded',
        gateway_raw: refundResult.raw,
      })
      .eq('id', id);

    if (order) {
      await supabase
        .from('stackpost_orders')
        .update({ status: 'refunded', atualizado_em: new Date().toISOString() })
        .eq('order_id', payment.order_id);
    }

    await logAudit({
      userId: admin.id,
      action: 'admin.payment.refund',
      resource: 'stackpost_processed_payments',
      resourceId: id,
      metadata: { payment, order, reason, amount_cents: amountCents, mp_refund_id: refundResult.id },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      amount_cents: amountCents,
      reason,
      mp_refund_id: refundResult.id,
      mp_refund_status: refundResult.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[admin/refund] Erro no reembolso MP:', msg);
    return NextResponse.json(
      { error: 'Falha ao processar reembolso no gateway.', detail: msg },
      { status: 502 },
    );
  }
}
