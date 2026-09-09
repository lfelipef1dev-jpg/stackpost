import { logger } from '@/lib/logger';
import { pagamentos_webhookQuerySchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { processarWebhook, consultarPreapproval } from '@/lib/mercadopago';
import { createHmac } from 'crypto';
import { requireEnv } from '@/lib/env';

async function validarAssinatura(request: Request): Promise<boolean> {
  const signature = request.headers.get('x-signature');
  const secret = requireEnv('MERCADOPAGO_WEBHOOK_SECRET');

  if (!signature || !secret) return false;

  const rawBody = await request.clone().text();
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  try {
    return signature.length === expected.length
      && Buffer.compare(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex')) === 0;
  } catch {
    return false;
  }
}

/**
 * Gera próximo número de invoice sequencial (SP-AAAA-NNNNNN).
 */
async function gerarInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const supabase = getSupabase();
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .like('invoice_number', `SP-${year}-%`);
  const seq = (count || 0) + 1;
  return `SP-${year}-${String(seq).padStart(6, '0')}`;
}

/**
 * Cria uma invoice para o período da assinatura.
 */
async function gerarInvoice(params: {
  organizationId: string;
  teamId: string | null;
  subscriptionId: string | null;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  description: string;
}): Promise<void> {
  const supabase = getSupabase();
  const invoiceNumber = await gerarInvoiceNumber();
  await supabase.from('invoices').insert({
    organization_id: params.organizationId,
    team_id: params.teamId,
    subscription_id: params.subscriptionId,
    invoice_number: invoiceNumber,
    status: 'paid',
    period_start: params.periodStart,
    period_end: params.periodEnd,
    subtotal_cents: params.totalCents,
    total_cents: params.totalCents,
    amount_due_cents: params.totalCents,
    paid_at: new Date().toISOString(),
    line_items: [
      {
        description: params.description,
        quantity: 1,
        unit_cost_cents: params.totalCents,
        total_cents: params.totalCents,
      },
    ],
  });
}

/**
 * Processa notificação de preapproval (assinatura recorrente).
 */
async function handlePreapproval(preapprovalId: string): Promise<Response> {
  const supabase = getSupabase();
  try {
    const preapproval = await consultarPreapproval(preapprovalId);
    const externalRef = preapproval.external_reference || '';

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, organization_id, plan_slug')
      .eq('provider_subscription_id', preapprovalId)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ ok: true, mensagem: 'Subscription não encontrada para preapproval.' });
    }

    const statusMap: Record<string, string> = {
      authorized: 'active',
      active: 'active',
      paused: 'paused',
      cancelled: 'canceled',
      pending: 'past_due',
    };
    const newStatus = statusMap[preapproval.status] || preapproval.status;

    await supabase
      .from('subscriptions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    return NextResponse.json({ ok: true, mensagem: `Preapproval atualizado: ${newStatus}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[webhook/preapproval] Erro:', msg);
    return NextResponse.json({ ok: false, error: 'Erro ao processar preapproval.' }, { status: 500 });
  }
}

/**
 * Processa notificação de subscription_authorized_payment (cobrança de assinatura).
 */
async function handleSubscriptionAuthorizedPayment(paymentId: string): Promise<Response> {
  const supabase = getSupabase();
  try {
    // Idempotência
    const { data: jaProcessado } = await supabase
      .from('stackpost_processed_payments')
      .select('payment_id')
      .eq('payment_id', paymentId)
      .maybeSingle();
    if (jaProcessado) {
      return NextResponse.json({ ok: true, mensagem: 'Pagamento de assinatura já processado.' });
    }

    // Busca detalhes do pagamento no MP
    const resultado = await processarWebhook({ type: 'payment', data: { id: paymentId } });
    if (resultado.status !== 'approved') {
      return NextResponse.json({ ok: true, mensagem: 'Cobrança de assinatura não aprovada.' });
    }

    const externalRef = resultado.external_reference || '';
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, organization_id, plan_slug, current_period_start, current_period_end')
      .eq('provider_subscription_id', externalRef)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ ok: true, mensagem: 'Subscription não encontrada para cobrança.' });
    }

    // Avança o período da assinatura
    const now = new Date();
    const newStart = new Date(sub.current_period_end || now.toISOString());
    const newEnd = new Date(newStart);
    newEnd.setMonth(newEnd.getMonth() + 1);

    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: newStart.toISOString(),
        current_period_end: newEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', sub.id);

    // Registra pagamento processado
    const amountCents = Math.round((resultado.raw as any)?.transaction_amount * 100) || 0;
    await supabase.from('stackpost_processed_payments').insert({
      payment_id: paymentId,
      order_id: externalRef,
      team_id: null,
      plano: sub.plan_slug,
      amount_cents: amountCents,
      currency: 'BRL',
      status: 'approved',
      gateway_raw: resultado.raw,
      processado_em: now.toISOString(),
    });

    // Gera invoice do período
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('organization_id', sub.organization_id)
      .limit(1)
      .maybeSingle();

    await gerarInvoice({
      organizationId: sub.organization_id,
      teamId: team?.id || null,
      subscriptionId: sub.id,
      periodStart: newStart.toISOString(),
      periodEnd: newEnd.toISOString(),
      totalCents: amountCents,
      description: `Assinatura StackPost - Plano ${sub.plan_slug}`,
    });

    return NextResponse.json({ ok: true, mensagem: 'Cobrança de assinatura processada.' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[webhook/subscription_authorized_payment] Erro:', msg);
    return NextResponse.json({ ok: false, error: 'Erro ao processar cobrança de assinatura.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await validarAssinatura(request)) {
    return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  const expectedParam = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isDev && expectedParam && secretParam !== expectedParam) {
    return NextResponse.json({ error: 'Segredo de query inválido.' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    const dataId = url.searchParams.get('data.id');
    const type = url.searchParams.get('type');
    if (dataId) {
      payload = { type: type || 'payment', data: { id: dataId } };
    } else {
      return NextResponse.json({ error: 'Payload do webhook inválido.' }, { status: 400 });
    }
  }

  const supabase = getSupabase();

  try {
    // Dispatch de topics de assinatura (preapproval / subscription_authorized_payment)
    const topic = payload?.type || payload?.topic;
    if (topic === 'preapproval' && payload?.data?.id) {
      return await handlePreapproval(String(payload.data.id));
    }
    if (topic === 'subscription_authorized_payment' && payload?.data?.id) {
      return await handleSubscriptionAuthorizedPayment(String(payload.data.id));
    }

    const resultado = await processarWebhook(payload);

    if (resultado.status === 'ignored' || resultado.status === 'no_payment_id') {
      return NextResponse.json({ ok: true, mensagem: 'Notificação ignorada.' });
    }

    const externalReference = resultado.external_reference;
    const paymentId = resultado.payment_id;

    if (!externalReference) {
      return NextResponse.json({ ok: true, mensagem: 'Sem referência externa.' }, { status: 200 });
    }

    if (paymentId) {
      const { data: jaProcessado } = await supabase
        .from('stackpost_processed_payments')
        .select('payment_id')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (jaProcessado) {
        return NextResponse.json({ ok: true, mensagem: 'Pagamento já processado.' }, { status: 200 });
      }
    }

    const { data: order, error: errOrder } = await supabase
      .from('stackpost_orders')
      .select('order_id, team_id, plano_escolhido, status, total, interval')
      .eq('order_id', externalReference)
      .maybeSingle();

    if (errOrder || !order) {
      return NextResponse.json({ ok: true, mensagem: 'Pedido não encontrado, ignorado.' }, { status: 200 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ ok: true, mensagem: 'Pedido já processado.' }, { status: 200 });
    }

    if (resultado.status !== 'approved') {
      await supabase
        .from('stackpost_orders')
        .update({
          status: resultado.status,
          atualizado_em: new Date().toISOString(),
        })
        .eq('order_id', externalReference);
      return NextResponse.json({ ok: true, mensagem: 'Status não aprovado, ignorado.' }, { status: 200 });
    }

    const planoEscolhido = (order.plano_escolhido || '').toLowerCase();
    const isAnnual = (order.interval || 'monthly') === 'yearly';

    if (externalReference.startsWith('stackpost_creditos_') || planoEscolhido === 'creditos-x') {
      const valor = Math.max(0, Number(order.total || 0));
      const { data: balanceData, error: errBalance } = await supabase
        .from('x_credit_balances')
        .select('balance')
        .eq('team_id', order.team_id)
        .maybeSingle();

      const currentBalance = balanceData?.balance || 0;
      const newBalance = currentBalance + valor;

      const { error: errUpsert } = await supabase
        .from('x_credit_balances')
        .upsert({
          team_id: order.team_id,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'team_id' });

      if (errUpsert) {
        return NextResponse.json({ ok: false, error: 'Falha ao adicionar créditos.' }, { status: 500 });
      }

      await supabase
        .from('stackpost_orders')
        .update({
          status: 'paid',
          mp_payment_id: paymentId || null,
          atualizado_em: new Date().toISOString(),
        })
        .eq('order_id', externalReference);

      if (paymentId) {
        await supabase.from('stackpost_processed_payments').insert({
          payment_id: paymentId,
          order_id: externalReference,
          team_id: order.team_id,
          plano: 'creditos-x',
          processado_em: new Date().toISOString(),
        });
      }

      return NextResponse.json({ ok: true, mensagem: 'Créditos adicionados com sucesso.' }, { status: 200 });
    }

    // Busca organization_id do time
    const { data: teamData, error: errTeam } = await supabase
      .from('teams')
      .select('organization_id')
      .eq('id', order.team_id)
      .single();

    if (errTeam || !teamData) {
      return NextResponse.json({ ok: false, error: 'Time não encontrado.' }, { status: 404 });
    }

    const orgId = teamData.organization_id;
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

    const { error: errUpdate } = await supabase
      .from('organizations')
      .update({ plan: planoEscolhido })
      .eq('id', orgId);

    if (errUpdate) {
      return NextResponse.json({ ok: false, error: 'Falha ao ativar plano.' }, { status: 500 });
    }

    // Cria ou atualiza assinatura com o período correto (mensal ou anual)
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('organization_id', orgId)
      .maybeSingle();

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_slug: planoEscolhido,
          interval: isAnnual ? 'yearly' : 'monthly',
          current_period_start: periodStart,
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          organization_id: orgId,
          plan_slug: planoEscolhido,
          interval: isAnnual ? 'yearly' : 'monthly',
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
    }

    // Gera invoice do período
    const amountCents = Math.round(Number(order.total || 0) * 100);
    await gerarInvoice({
      organizationId: orgId,
      teamId: order.team_id,
      subscriptionId: existingSub?.id || null,
      periodStart,
      periodEnd: periodEnd.toISOString(),
      totalCents: amountCents,
      description: `Assinatura StackPost - Plano ${planoEscolhido} (${isAnnual ? 'Anual' : 'Mensal'})`,
    });

    await supabase
      .from('stackpost_orders')
      .update({
        status: 'paid',
        mp_payment_id: paymentId || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq('order_id', externalReference);

    if (paymentId) {
      await supabase.from('stackpost_processed_payments').insert({
        payment_id: paymentId,
        order_id: externalReference,
        team_id: order.team_id,
        plano: planoEscolhido,
        processado_em: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, mensagem: 'Plano ativado com sucesso.' }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[pagamentos/webhook] Erro:', msg);
    return NextResponse.json({ ok: false, error: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
