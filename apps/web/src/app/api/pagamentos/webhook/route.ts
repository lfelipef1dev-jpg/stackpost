import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { processarWebhook } from '@/lib/mercadopago';

function validarOrigem(request: Request, url: URL): boolean {
  const signature = request.headers.get('x-signature');
  if (signature) return true;

  const secret = url.searchParams.get('secret');
  const expected = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (expected && secret && secret === expected) return true;

  if (process.env.NODE_ENV !== 'production') return true;

  return false;
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (!validarOrigem(request, url)) {
    console.warn('[pagamentos/webhook] Origem invalida');
    return NextResponse.json(
      { error: 'Origem do webhook invalida.' },
      { status: 401 },
    );
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
      return NextResponse.json(
        { error: 'Payload do webhook invalido.' },
        { status: 400 },
      );
    }
  }

  const supabase = getSupabase();

  try {
    const resultado = await processarWebhook(payload);

    if (resultado.status === 'ignored' || resultado.status === 'no_payment_id') {
      return NextResponse.json({ ok: true, mensagem: 'Notificacao ignorada.' });
    }

    const externalReference = resultado.external_reference;
    const paymentId = resultado.payment_id;

    if (!externalReference) {
      console.warn('[pagamentos/webhook] external_reference ausente');
      return NextResponse.json(
        { ok: true, mensagem: 'Sem referencia externa.' },
        { status: 200 },
      );
    }

    if (paymentId) {
      const { data: jaProcessado } = await supabase
        .from('stackpost_processed_payments')
        .select('payment_id')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (jaProcessado) {
        return NextResponse.json(
          { ok: true, mensagem: 'Pagamento ja processado.' },
          { status: 200 },
        );
      }
    }

    const { data: order, error: errOrder } = await supabase
      .from('stackpost_orders')
      .select('order_id, team_id, plano_escolhido, status')
      .eq('order_id', externalReference)
      .maybeSingle();

    if (errOrder || !order) {
      console.warn(
        '[pagamentos/webhook] Pedido nao encontrado:',
        externalReference,
      );
      return NextResponse.json(
        { ok: true, mensagem: 'Pedido nao encontrado, ignorado.' },
        { status: 200 },
      );
    }

    if (order.status === 'paid') {
      return NextResponse.json(
        { ok: true, mensagem: 'Pedido ja processado.' },
        { status: 200 },
      );
    }

    if (resultado.status !== 'approved') {
      console.info(
        '[pagamentos/webhook] Status nao aprovado:',
        externalReference,
        resultado.status,
      );
      await supabase
        .from('stackpost_orders')
        .update({
          status: resultado.status,
          atualizado_em: new Date().toISOString(),
        })
        .eq('order_id', externalReference);
      return NextResponse.json(
        { ok: true, mensagem: 'Status nao aprovado, ignorado.' },
        { status: 200 },
      );
    }

    const planoEscolhido = (order.plano_escolhido || '').toLowerCase();

    const { error: errUpdate } = await supabase
      .from('organizations')
      .update({ plan: planoEscolhido })
      .eq(
        'id',
        (
          await supabase
            .from('teams')
            .select('organization_id')
            .eq('id', order.team_id)
            .single()
        ).data?.organization_id
      );

    if (errUpdate) {
      console.error('[pagamentos/webhook] Erro ao atualizar organizacao:', errUpdate.message);
      return NextResponse.json(
        { ok: false, error: 'Falha ao ativar plano.' },
        { status: 500 },
      );
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
        plano: planoEscolhido,
        processado_em: new Date().toISOString(),
      });
    }

    console.info(
      '[pagamentos/webhook] Plano ativado. order=%s team_id=%s plano=%s',
      externalReference,
      order.team_id,
      planoEscolhido,
    );

    return NextResponse.json(
      { ok: true, mensagem: 'Plano ativado com sucesso.' },
      { status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[pagamentos/webhook] Erro:', msg);
    return NextResponse.json(
      { ok: false, error: 'Erro interno ao processar webhook.' },
      { status: 500 },
    );
  }
}
