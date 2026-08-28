import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/analytics/post?postId=xxx — analytics normalizado por post
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');

  if (!postId) return NextResponse.json({ error: 'postId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, team_id, platforms')
      .eq('id', postId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (postError) throw postError;
    if (!post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });

    const { data: snapshots, error: snapError } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    if (snapError) throw snapError;

    const byPlatform: Record<string, any> = {};
    let totals = { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
    for (const s of snapshots || []) {
      if (!byPlatform[s.platform]) {
        byPlatform[s.platform] = { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, raw: s.raw_payload };
      }
      byPlatform[s.platform].impressions += s.impressions || 0;
      byPlatform[s.platform].views += s.views || 0;
      byPlatform[s.platform].likes += s.likes || 0;
      byPlatform[s.platform].comments += s.comments || 0;
      byPlatform[s.platform].shares += s.shares || 0;
      byPlatform[s.platform].saves += s.saves || 0;
      totals.impressions += s.impressions || 0;
      totals.views += s.views || 0;
      totals.likes += s.likes || 0;
      totals.comments += s.comments || 0;
      totals.shares += s.shares || 0;
      totals.saves += s.saves || 0;
    }

    return NextResponse.json({ postId, totals, byPlatform, snapshots: snapshots || [] });
  } catch (error: any) {
    console.error('analytics/post error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
