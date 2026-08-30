import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { recordBillingEvent } from '@/lib/billing-metering';

/**
 * Cron: Dunning de assinaturas em past_due.
 * Tenta nova cobrança via MP (até 3 tentativas com backoff de 1, 3, 7 dias).
 * Após 3 falhas: downgrade para plano free e subscription canceled.
 * Valida CRON_SECRET.
 */
const DUNNING_SCHEDULE_DAYS = [1, 3, 7];
const MAX_ATTEMPTS = 3;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date();

  try {
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('id, organization_id, team_id, plan_slug, provider_subscription_id, current_period_end, updated_at')
      .eq('status', 'past_due');

    if (error) throw error;

    let retried = 0;
    let canceled = 0;

    for (const sub of subs || []) {
      // Conta tentativas de dunning registradas em billing_events
      const { data: attempts } = await supabase
        .from('billing_events')
        .select('id, created_at, metadata')
        .eq('organization_id', sub.organization_id)
        .eq('event_type', 'dunning_attempt')
        .order('created_at', { ascending: false })
        .limit(MAX_ATTEMPTS);

      const attemptCount = attempts?.length || 0;

      if (attemptCount >= MAX_ATTEMPTS) {
        // Downgrade para free e cancela subscription
        await supabase
          .from('organizations')
          .update({ plan: 'free', updated_at: now.toISOString() })
          .eq('id', sub.organization_id);

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: now.toISOString(), updated_at: now.toISOString() })
          .eq('id', sub.id);

        await recordBillingEvent({
          teamId: sub.team_id || sub.organization_id,
          orgId: sub.organization_id,
          eventType: 'dunning_exhausted',
          units: 1,
          unitCostCents: 0,
          idempotencyKey: `dunning_exhausted_${sub.id}_${now.getTime()}`,
          metadata: { subscription_id: sub.id, plan_slug: sub.plan_slug },
        });
        canceled++;
        continue;
      }

      // Verifica backoff: última tentativa deve ter passado o intervalo
      const lastAttempt = attempts?.[0];
      if (lastAttempt) {
        const lastDate = new Date(lastAttempt.created_at);
        const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const requiredDays = DUNNING_SCHEDULE_DAYS[attemptCount - 1] ?? 7;
        if (daysSince < requiredDays) {
          continue; // ainda dentro do backoff
        }
      }

      // Registra tentativa de dunning
      const teamId = sub.team_id || sub.organization_id;
      await recordBillingEvent({
        teamId,
        orgId: sub.organization_id,
        eventType: 'dunning_attempt',
        units: 1,
        unitCostCents: 0,
        idempotencyKey: `dunning_attempt_${sub.id}_${attemptCount + 1}_${now.getTime()}`,
        metadata: {
          subscription_id: sub.id,
          attempt: attemptCount + 1,
          provider_subscription_id: sub.provider_subscription_id,
        },
      });
      retried++;
    }

    return NextResponse.json({
      ok: true,
      cron: 'dunning',
      retried,
      canceled,
      total: (subs || []).length,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    logger.error('Cron dunning error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
