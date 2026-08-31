import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'credits.read');
  if (error) return error;

  const teamId = req.nextUrl.searchParams.get('team_id');
  const supabase = getSupabase();

  let txQuery = supabase
    .from('credit_transactions')
    .select('type, platform, amount, created_at')
    .limit(10000);

  if (teamId) {
    txQuery = txQuery.eq('team_id', teamId);
  }

  const [{ data: transactions, error: txError }, { data: balances, error: balError }] = await Promise.all([
    txQuery,
    supabase.from('x_credit_balances').select('platform, balance'),
  ]);

  if (txError || balError) {
    return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 });
  }

  const typeMap = new Map<string, { count: number; total: number }>();
  const platformMap = new Map<string, { count: number; total: number }>();
  const dailyMap = new Map<string, number>();

  for (const t of transactions || []) {
    const amt = typeof t.amount === 'number' ? t.amount : 0;
    const prevType = typeMap.get(t.type) || { count: 0, total: 0 };
    prevType.count += 1;
    prevType.total += amt;
    typeMap.set(t.type, prevType);

    const plat = t.platform || 'unknown';
    const prevPlat = platformMap.get(plat) || { count: 0, total: 0 };
    prevPlat.count += 1;
    prevPlat.total += amt;
    platformMap.set(plat, prevPlat);

    if (t.created_at) {
      const day = t.created_at.split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + amt);
    }
  }

  const activeByPlatform: Record<string, number> = {};
  let activeTotal = 0;
  for (const b of balances || []) {
    activeByPlatform[b.platform] = (activeByPlatform[b.platform] || 0) + (b.balance || 0);
    activeTotal += b.balance || 0;
  }

  const byType = Array.from(typeMap.entries())
    .map(([type, value]) => ({ type, ...value }))
    .sort((a, b) => b.total - a.total);

  const byPlatform = Array.from(platformMap.entries())
    .map(([platform, value]) => ({ platform, ...value }))
    .sort((a, b) => b.total - a.total);

  const byDay = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({ day, total }));

  return NextResponse.json({
    active_total: activeTotal,
    active_by_platform: activeByPlatform,
    by_type: byType,
    by_platform: byPlatform,
    by_day: byDay,
  });
}
