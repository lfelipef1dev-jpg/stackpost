import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/comments/import/comments — listar comentarios importados
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');
  const platform = searchParams.get('platform');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

  const supabase = getSupabase();

  try {
    const { data: teamPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId);
    const postIds = (teamPosts || []).map((p) => p.id);
    if (postIds.length === 0) return NextResponse.json([]);

    let query = supabase
      .from('comments')
      .select('*')
      .in('post_id', postIds)
      .eq('status', 'imported')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (postId) query = query.eq('post_id', postId);
    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
