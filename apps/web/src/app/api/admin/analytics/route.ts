import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'analytics.read');
  if (error) return error;

  const supabase = getSupabase();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  const [
    { count: totalPosts },
    { count: postsToday },
    { count: postsError },
    { count: scheduledToday },
    { count: totalAccounts },
    { count: totalOrgs },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', start).lte('published_at', end),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'error'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).in('status', ['scheduled', 'processing']).gte('scheduled_at', start).lte('scheduled_at', end),
    supabase.from('accounts').select('*', { count: 'exact', head: true }),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  const { data: postsByDay } = await supabase
    .from('posts')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    .order('created_at', { ascending: false });

  const byDay = new Map<string, number>();
  for (const p of postsByDay || []) {
    const d = p.created_at.slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + 1);
  }

  return NextResponse.json({
    total_posts: totalPosts || 0,
    posts_today: postsToday || 0,
    posts_error: postsError || 0,
    scheduled_today: scheduledToday || 0,
    total_accounts: totalAccounts || 0,
    total_organizations: totalOrgs || 0,
    total_users: totalUsers || 0,
    posts_by_day: Object.fromEntries(byDay),
  });
}
