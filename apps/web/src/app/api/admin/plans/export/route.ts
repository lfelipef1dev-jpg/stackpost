import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

function escapeCsv(value: unknown) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'plans.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('plans')
    .select('*, limits:plan_limits(*), features:plan_features(*)')
    .order('sort_order', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }

  const rows = data || [];
  const headers = ['id', 'slug', 'name', 'price_cents', 'currency', 'interval', 'trial_days', 'is_active', 'is_public', 'limits', 'features'];
  const lines = [headers.join(','), ...rows.map((r: any) => {
    const limits = (r.limits || []).map((l: any) => `${l.key}=${l.value}`).join(';');
    const features = (r.features || []).map((f: any) => `${f.key}=${f.value}`).join(';');
    return [r.id, r.slug, r.name, r.price_cents, r.currency, r.interval, r.trial_days, r.is_active, r.is_public, limits, features]
      .map(escapeCsv)
      .join(',');
  })];
  const csv = lines.join('\n');

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set('Content-Type', 'text/csv; charset=utf-8');
  res.headers.set('Content-Disposition', 'attachment; filename="plans.csv"');
  return res;
}
