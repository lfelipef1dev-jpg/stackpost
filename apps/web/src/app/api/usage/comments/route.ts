import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/usage/comments — contagem de comentarios do mes atual
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    const { data: teamPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId);
    const postIds = (teamPosts || []).map((p) => p.id);
    if (postIds.length === 0) return NextResponse.json({ comments: 0, period: 'current_month' });

    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .in('post_id', postIds)
      .gte('created_at', startOfMonth);

    if (error) throw error;
    return NextResponse.json({ comments: count || 0, period: 'current_month', since: startOfMonth });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
