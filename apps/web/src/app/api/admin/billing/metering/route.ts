import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);

  const eventType = searchParams.get('event_type') || 'all';
  const platform = searchParams.get('platform') || 'all';
  const teamSearch = searchParams.get('team') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

  let query = supabase
    .from('billing_events')
    .select('id, team_id, organization_id, event_type, platform, units, unit_cost_cents, total_cost_cents, idempotency_key, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (eventType && eventType !== 'all') {
    query = query.eq('event_type', eventType);
  }
  if (platform && platform !== 'all') {
    query = query.eq('platform', platform);
  }

  const { data: events, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao buscar eventos de billing' }, { status: 500 });
  }

  let enrichedEvents = events || [];

  // Se tem busca por team, buscar teams e filtrar
  if (teamSearch && enrichedEvents.length > 0) {
    const teamIds = [...new Set(enrichedEvents.map((e: any) => e.team_id).filter(Boolean))];
    const { data: teams } = teamIds.length
      ? await supabase.from('teams').select('id, name, organization_id').in('id', teamIds)
      : { data: [] };

    const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));
    enrichedEvents = enrichedEvents
      .map((e: any) => ({ ...e, team: teamMap.get(e.team_id) || null }))
      .filter((e: any) => e.team?.name?.toLowerCase().includes(teamSearch.toLowerCase()));
  }

  // Agregar por tipo para o grafico (ultimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: chartData } = await supabase
    .from('billing_events')
    .select('event_type, units, total_cost_cents, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Agrupar por dia + tipo
  const byDay: Record<string, Record<string, { units: number; cost: number }>> = {};
  for (const e of chartData || []) {
    const day = (e as any).created_at?.slice(0, 10);
    if (!day) continue;
    if (!byDay[day]) byDay[day] = {};
    const type = (e as any).event_type || 'unknown';
    if (!byDay[day][type]) byDay[day][type] = { units: 0, cost: 0 };
    byDay[day][type].units += (e as any).units || 0;
    byDay[day][type].cost += (e as any).total_cost_cents || 0;
  }

  // Totais por tipo
  const totalsByType: Record<string, { units: number; cost_cents: number }> = {};
  for (const e of chartData || []) {
    const type = (e as any).event_type || 'unknown';
    if (!totalsByType[type]) totalsByType[type] = { units: 0, cost_cents: 0 };
    totalsByType[type].units += (e as any).units || 0;
    totalsByType[type].cost_cents += (e as any).total_cost_cents || 0;
  }

  return NextResponse.json({
    events: enrichedEvents,
    chart: byDay,
    totals_by_type: totalsByType,
    total_events: enrichedEvents.length,
  });
}
