import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/usage/posts — contagem de posts do mes atual
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    const { count, error } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', user.teamId)
      .gte('created_at', startOfMonth);

    if (error) throw error;
    return NextResponse.json({ posts: count || 0, period: 'current_month', since: startOfMonth });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
