import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { getUsageEstimate } from '@/lib/billing-metering';

/**
 * GET /api/billing/usage
 * Retorna uso atual do mês da organização do usuário logado.
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

  try {
    const estimate = await getUsageEstimate(team.id);

    // Agrega por event_type
    const byType = estimate.by_type.map((t) => ({
      type: t.event_type,
      units: t.units,
      cost_cents: t.total_cost_cents,
    }));

    return NextResponse.json({
      total_cost_cents: estimate.total_cost_cents,
      by_type: byType,
      period_start: estimate.period_start,
      period_end: estimate.period_end,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[billing/usage] Erro:', msg);
    return NextResponse.json({ error: 'Erro ao buscar uso.' }, { status: 500 });
  }
}
