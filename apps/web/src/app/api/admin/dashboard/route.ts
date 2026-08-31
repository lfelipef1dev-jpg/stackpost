import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

export async function GET(request: Request) {
  const { admin, error } = await requireAdmin(request as any, 'analytics.read');
  if (error) return error;

  const supabase = getSupabase();
  const today = startOfDay(new Date());

  const [
    { count: users },
    { count: organizations },
    { count: posts },
    { count: payments },
    { count: scheduled },
    { count: errors },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('stackpost_processed_payments').select('*', { count: 'exact', head: true }).gte('processed_at', today),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'error'),
  ]);

  return NextResponse.json({
    users: users || 0,
    organizations: organizations || 0,
    posts: posts || 0,
    payments: payments || 0,
    scheduled: scheduled || 0,
    errors: errors || 0,
  });
}
