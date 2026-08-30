import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { criarPreferencia, criarPreapproval } from '@/lib/mercadopago';
import { getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const checkoutSchema = z.object({
  plano: z.string().min(1),
  interval: z.enum(['monthly', 'yearly']).optional(),
}).strict();

const PLANOS: Record<string, { valor: number; id_plano: number }> = {
  starter: { valor: 39.0, id_plano: 1 },
  growth: { valor: 89.0, id_plano: 2 },
  scale: { valor: 197.0, id_plano: 3 },
  business: { valor: 497.0, id_plano: 4 },
};

const ORDEM_PLANOS: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  scale: 3,
  business: 4,
};

export async function POST(request: Request) {
  const user = await getUserFromToken(request as any);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  let body: { plano?: string; interval?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido.' },
      { status: 400 },
    );
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const plano = (parsed.data.plano || '').toLowerCase().trim();
  const interval = (parsed.data.interval || 'monthly').toLowerCase();
  if (!plano) {
    return NextResponse.json(
      { error: 'Plano nao informado.' },
      { status: 400 },
    );
  }

  if (plano === 'free') {
    return NextResponse.json(
      { error: 'O plano Free nao precisa de pagamento.' },
      { status: 400 },
    );
  }

  const planoInfo = PLANOS[plano];
  if (!planoInfo) {
    return NextResponse.json(
      { error: 'Plano invalido. Escolha entre starter, growth, scale ou business.' },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  const { data: team, error: errTeam } = await supabase
    .from('teams')
    .select('id, organization_id')
    .eq('id', user.teamId)
    .single();

  if (errTeam || !team) {
    return NextResponse.json(
      { error: 'Time nao encontrado.' },
      { status: 404 },
    );
  }

  const { data: org, error: errOrg } = await supabase
    .from('organizations')
    .select('id, plan')
    .eq('id', team.organization_id)
    .single();

  if (errOrg || !org) {
    return NextResponse.json(
      { error: 'Organizacao nao encontrada.' },
      { status: 404 },
    );
  }

  const planoAtual = (org.plan || 'free').toLowerCase();
  if ((ORDEM_PLANOS[planoAtual] ?? 0) >= (ORDEM_PLANOS[plano] ?? 0)) {
    return NextResponse.json(
      { error: 'Voce ja possui este plano ou um superior.' },
      { status: 400 },
    );
  }

  const { data: userData, error: errUser } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', user.id)
    .single();

  const email = userData?.email || `${user.id}@stackpost.local`;

  const orderId = `stackpost_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

  const { error: errOrder } = await supabase.from('stackpost_orders').insert({
    order_id: orderId,
    team_id: user.teamId,
    plano_escolhido: plano,
    total: planoInfo.valor,
    status: 'pending',
    criado_em: new Date().toISOString(),
  });

  if (errOrder) {
    return NextResponse.json(
      { error: 'Nao conseguimos iniciar o pedido.' },
      { status: 500 },
    );
  }

  try {
    // Planos recorrentes (monthly/yearly) usam preapproval (assinatura)
    // Compra de créditos continua com preference única (PIX)
    const isRecurring = interval === 'monthly' || interval === 'yearly';

    if (isRecurring) {
      const frequency = interval === 'yearly' ? 12 : 1;
      const preapproval = await criarPreapproval({
        planId: plano,
        amount: planoInfo.valor,
        frequency,
        frequencyType: 'months',
        payerEmail: email,
        externalReference: orderId,
      });

      await supabase
        .from('stackpost_orders')
        .update({
          mp_preference_id: preapproval.id,
          atualizado_em: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      // Cria/atualiza subscription com provider_subscription_id
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('organization_id', team.organization_id)
        .maybeSingle();

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + frequency);

      if (existingSub) {
        await supabase
          .from('subscriptions')
          .update({
            plan_slug: plano,
            status: 'active',
            payment_provider: 'mercadopago',
            provider_subscription_id: preapproval.id,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        await supabase.from('subscriptions').insert({
          organization_id: team.organization_id,
          plan_slug: plano,
          status: 'active',
          payment_provider: 'mercadopago',
          provider_subscription_id: preapproval.id,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }

      return NextResponse.json({
        order_id: orderId,
        preapproval_id: preapproval.id,
        init_point: preapproval.init_point,
        total: planoInfo.valor,
        recurring: true,
      });
    }

    // Fluxo único (PIX) — mantém comportamento original
    const pref = await criarPreferencia({
      team_id: user.teamId,
      plano,
      valor: planoInfo.valor,
      email,
      external_reference: orderId,
    });

    await supabase
      .from('stackpost_orders')
      .update({
        mp_preference_id: pref.id,
        atualizado_em: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    return NextResponse.json({
      order_id: orderId,
      init_point: pref.init_point,
      qrcode: pref.qrcode,
      copia_cola: pref.copia_cola,
      total: planoInfo.valor,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[pagamentos/checkout] Erro:', msg);
    return NextResponse.json(
      { error: 'Nao conseguimos comunicar com o gateway de pagamento.' },
      { status: 502 },
    );
  }
}
