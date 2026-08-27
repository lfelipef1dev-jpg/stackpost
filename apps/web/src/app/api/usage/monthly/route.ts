import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const now = new Date();
  const firstOfMonth = now.toISOString().slice(0, 7) + '-01T00:00:00.000Z';

  const supabase = getSupabase();

  try {
    // Single efficient query using team_id date filter
    const [{ count: postsCount, error: postsError }, { count: uploadsCount, error: uploadsError }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
      supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
    ]);
    if (postsError) throw postsError;
    if (uploadsError) throw uploadsError;

    return NextResponse.json({
      month: firstOfMonth.split('T')[0],
      posts: { used: postsCount || 0, limit: 10000, remaining: 10000 - (postsCount || 0) },
      comments: { used: 0, limit: 5000, remaining: 5000 },
      uploads: { used: uploadsCount || 0, limit: 100000, remaining: 100000 - (uploadsCount || 0) },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
