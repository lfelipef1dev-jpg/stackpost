import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { cancelarPreapproval, criarPreapproval } from '@/lib/mercadopago';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['cancel', 'change_plan']),
  plan_id: z.string().optional(),
}).strict();

/**
 * GET /api/billing/subscription
 * Retorna a assinatura atual do usuário + plano.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, organization_id')
    .eq('id', user.teamId)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: 'Time nao encontrado.' }, { status: 404 });
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, plan, plan_status')
    .eq('id', team.organization_id)
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: 'Organizacao nao encontrada.' }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, plan_slug, status, payment_provider, provider_subscription_id, current_period_start, current_period_end, canceled_at')
    .eq('organization_id', org.id)
    .maybeSingle();

  const { data: plan } = await supabase
    .from('plans')
    .select('id, slug, name, price_cents, interval')
    .eq('slug', org.plan)
    .maybeSingle();

  return NextResponse.json({
    organization: org,
    subscription: subscription || null,
    plan: plan || null,
  });
}

/**
 * POST /api/billing/subscription
 * Body: { action: 'cancel' } ou { action: 'change_plan', plan_id: 'growth' }
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo invalido.' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: team } = await supabase
    .from('teams')
    .select('id, organization_id')
    .eq('id', user.teamId)
    .single();
  if (!team) {
    return NextResponse.json({ error: 'Time nao encontrado.' }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, plan_slug, status, provider_subscription_id, current_period_start, current_period_end')
    .eq('organization_id', team.organization_id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada.' }, { status: 404 });
  }

  if (parsed.data.action === 'cancel') {
    // Cancela no MP (preapproval) + no banco
    if (subscription.provider_subscription_id) {
      try {
        await cancelarPreapproval(subscription.provider_subscription_id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error('[billing/subscription] Erro ao cancelar no MP:', msg);
        return NextResponse.json({ error: 'Falha ao cancelar no gateway.' }, { status: 502 });
      }
    }

    const now = new Date().toISOString();
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: now, updated_at: now })
      .eq('id', subscription.id);

    await supabase
      .from('organizations')
      .update({ plan: 'free', updated_at: now })
      .eq('id', team.organization_id);

    return NextResponse.json({ success: true, status: 'canceled' });
  }

  // change_plan com pró-rata
  const newPlanSlug = parsed.data.plan_id;
  if (!newPlanSlug) {
    return NextResponse.json({ error: 'plan_id e obrigatorio para change_plan.' }, { status: 400 });
  }

  const { data: newPlan } = await supabase
    .from('plans')
    .select('id, slug, name, price_cents, interval')
    .eq('slug', newPlanSlug)
    .maybeSingle();

  if (!newPlan) {
    return NextResponse.json({ error: 'Plano invalido.' }, { status: 400 });
  }

  // Cálculo pró-rata simples: diferença de valor proporcional ao período restante
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end || now.toISOString());
  const periodStart = new Date(subscription.current_period_start || now.toISOString());
  const totalPeriod = periodEnd.getTime() - periodStart.getTime();
  const remaining = Math.max(0, periodEnd.getTime() - now.getTime());
  const remainingFraction = totalPeriod > 0 ? remaining / totalPeriod : 0;

  const { data: currentPlan } = await supabase
    .from('plans')
    .select('price_cents')
    .eq('slug', subscription.plan_slug)
    .maybeSingle();

  const currentPriceCents = currentPlan?.price_cents || 0;
  const prorataCents = Math.max(0, Math.round((newPlan.price_cents - currentPriceCents) * remainingFraction));

  // Cancela preapproval antigo e cria novo no MP
  if (subscription.provider_subscription_id) {
    try {
      await cancelarPreapproval(subscription.provider_subscription_id);
    } catch (e) {
      logger.error('[billing/subscription] Erro ao cancelar preapproval antigo:', e instanceof Error ? e.message : String(e));
    }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single();
  const email = userData?.email || `${user.id}@stackpost.local`;

  const newExternalRef = `stackpost_${team.organization_id}_${newPlanSlug}_${Date.now()}`;
  const frequency = newPlan.interval === 'year' ? 12 : 1;

  try {
    const preapproval = await criarPreapproval({
      planId: newPlanSlug,
      amount: newPlan.price_cents / 100,
      frequency,
      frequencyType: 'months',
      payerEmail: email,
      externalReference: newExternalRef,
    });

    const newPeriodEnd = new Date(now);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + frequency);

    await supabase
      .from('subscriptions')
      .update({
        plan_slug: newPlanSlug,
        plan_id: newPlan.id,
        status: 'active',
        provider_subscription_id: preapproval.id,
        current_period_start: now.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        canceled_at: null,
        updated_at: now.toISOString(),
      })
      .eq('id', subscription.id);

    await supabase
      .from('organizations')
      .update({ plan: newPlanSlug, updated_at: now.toISOString() })
      .eq('id', team.organization_id);

    return NextResponse.json({
      success: true,
      plan_slug: newPlanSlug,
      preapproval_id: preapproval.id,
      init_point: preapproval.init_point,
      prorata_cents: prorataCents,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[billing/subscription] Erro ao criar novo preapproval:', msg);
    return NextResponse.json({ error: 'Falha ao criar nova assinatura no gateway.' }, { status: 502 });
  }
}
