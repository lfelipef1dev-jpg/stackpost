import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const supabase = getSupabase();

  try {
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', user.teamId)
      .gte('created_at', firstOfMonth.toISOString());
    if (postsError) throw postsError;

    const { data: teamPosts, error: teamPostsError } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId);
    if (teamPostsError) throw teamPostsError;

    const postIds = (teamPosts || []).map((p: any) => p.id);
    let commentsCount = 0;
    if (postIds.length > 0) {
      const { count, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
        .gte('created_at', firstOfMonth.toISOString());
      if (commentsError) throw commentsError;
      commentsCount = count || 0;
    }

    const { count: uploadsCount, error: uploadsError } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', user.teamId)
      .gte('created_at', firstOfMonth.toISOString());
    if (uploadsError) throw uploadsError;

    return NextResponse.json({
      month: firstOfMonth.toISOString().split('T')[0],
      posts: {
        used: postsCount || 0,
        limit: 10000,
        remaining: 10000 - (postsCount || 0),
      },
      comments: {
        used: commentsCount,
        limit: 5000,
        remaining: 5000 - commentsCount,
      },
      uploads: {
        used: uploadsCount || 0,
        limit: 100000,
        remaining: 100000 - (uploadsCount || 0),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
