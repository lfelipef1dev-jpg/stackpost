import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req, 'plans.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { count } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_id', id);
  const { data, error: dbError } = await supabase
    .from('subscriptions')
    .select('organization_id, status, current_period_start, current_period_end, organization:organizations(name)')
    .eq('plan_id', id)
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    plan_id: id,
    subscribers: count || 0,
    organizations: (data || []).map((s: any) => ({
      id: s.organization_id,
      name: s.organization?.name,
      status: s.status,
      current_period_start: s.current_period_start,
      current_period_end: s.current_period_end,
    })),
  });
}
