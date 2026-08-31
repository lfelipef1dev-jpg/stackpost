import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'audit_logs.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('audit_logs')
    .select('action, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const rows = data || [];
  const byDay = new Map<string, number>();
  const byAction = new Map<string, number>();
  const byUser = new Map<string, number>();

  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
    byAction.set(r.action, (byAction.get(r.action) || 0) + 1);
    byUser.set(r.user_id, (byUser.get(r.user_id) || 0) + 1);
  }

  return NextResponse.json({
    total: rows.length,
    by_day: Object.fromEntries(byDay),
    by_action: Object.fromEntries(byAction),
    top_users: Array.from(byUser.entries())
      .map(([user_id, count]) => ({ user_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  });
}
