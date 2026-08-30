/**
 * lib/billing-metering.ts
 * Metering de uso baseado em billing_events (append-only).
 * Compatível com Cloudflare Workers (fetch nativo via Supabase HTTP/REST).
 */
import { getSupabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface RecordBillingEventInput {
  teamId: string;
  orgId: string;
  eventType: string; // 'post', 'api_call', 'ai_caption', 'x_post_link', 'upload_gb'
  platform?: string;
  units?: number;
  unitCostCents: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface BillingEventResult {
  id: string;
  duplicated: boolean;
}

/**
 * Registra um evento de billing com idempotência.
 * Se já existir evento com a mesma idempotency_key, retorna duplicated=true sem inserir.
 */
export async function recordBillingEvent(
  input: RecordBillingEventInput,
): Promise<BillingEventResult | null> {
  const supabase = getSupabase();
  const units = input.units ?? 1;
  const totalCostCents = Math.round(units * input.unitCostCents);
  const idempotencyKey = input.idempotencyKey?.startsWith('stackpost_')
    ? input.idempotencyKey
    : `stackpost_${input.idempotencyKey}`;

  // Verifica idempotência
  const { data: existing } = await supabase
    .from('billing_events')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, duplicated: true };
  }

  const { data, error } = await supabase
    .from('billing_events')
    .insert({
      team_id: input.teamId,
      organization_id: input.orgId,
      event_type: input.eventType,
      platform: input.platform || null,
      units,
      unit_cost_cents: input.unitCostCents,
      total_cost_cents: totalCostCents,
      idempotency_key: idempotencyKey,
      metadata: input.metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    // Concorrência: pode ter sido inserido entre a checagem e o insert
    if (error.code === '23505') {
      const { data: retry } = await supabase
        .from('billing_events')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (retry) return { id: retry.id, duplicated: true };
    }
    logger.error('[billing-metering] Erro ao registrar evento:', error.message);
    return null;
  }

  return { id: data.id, duplicated: false };
}

export interface UsageAggregate {
  event_type: string;
  units: number;
  total_cost_cents: number;
}

/**
 * Agrega uso de um time por tipo de evento no período informado.
 */
export async function aggregateUsage(
  teamId: string,
  periodStart: string,
  periodEnd: string,
): Promise<UsageAggregate[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('billing_events')
    .select('event_type, units, total_cost_cents')
    .eq('team_id', teamId)
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);

  if (error) {
    logger.error('[billing-metering] Erro ao agregar uso:', error.message);
    return [];
  }

  const map = new Map<string, UsageAggregate>();
  for (const row of data || []) {
    const cur = map.get(row.event_type) || {
      event_type: row.event_type,
      units: 0,
      total_cost_cents: 0,
    };
    cur.units += Number(row.units) || 0;
    cur.total_cost_cents += Number(row.total_cost_cents) || 0;
    map.set(row.event_type, cur);
  }

  return Array.from(map.values());
}

export interface UsageEstimate {
  period_start: string;
  period_end: string;
  total_cost_cents: number;
  by_type: UsageAggregate[];
}

/**
 * Retorna uso estimado do mês corrente para um time.
 */
export async function getUsageEstimate(teamId: string): Promise<UsageEstimate> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const byType = await aggregateUsage(teamId, periodStart, periodEnd);
  const totalCostCents = byType.reduce((sum, t) => sum + t.total_cost_cents, 0);

  return {
    period_start: periodStart,
    period_end: periodEnd,
    total_cost_cents: totalCostCents,
    by_type: byType,
  };
}
