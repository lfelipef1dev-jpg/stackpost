import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/analytics/account?accountId=xxx — analytics agregado por conta
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    const { data: posts } = await supabase
      .from('posts')
      .select('id, platforms, published_at')
      .eq('team_id', user.teamId)
      .contains('platforms', [account.platform])
      .eq('status', 'posted');

    const postIds = (posts || []).map((p) => p.id);
    let totals = { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
    let perPost: any[] = [];

    if (postIds.length > 0) {
      const { data: snapshots } = await supabase
        .from('analytics_snapshots')
        .select('post_id, platform, impressions, views, likes, comments, shares, saves, created_at')
        .in('post_id', postIds)
        .eq('platform', account.platform)
        .order('created_at', { ascending: false });

      const latestPerPost: Record<string, any> = {};
      for (const s of snapshots || []) {
        if (!latestPerPost[s.post_id]) {
          latestPerPost[s.post_id] = s;
          totals.impressions += s.impressions || 0;
          totals.views += s.views || 0;
          totals.likes += s.likes || 0;
          totals.comments += s.comments || 0;
          totals.shares += s.shares || 0;
          totals.saves += s.saves || 0;
        }
      }
      perPost = Object.values(latestPerPost);
    }

    return NextResponse.json({
      accountId,
      platform: account.platform,
      username: account.username,
      totalPosts: postIds.length,
      totals,
      perPost,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
