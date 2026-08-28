import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/analytics/post/force — forca refresh de analytics de um post
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { postId } = await req.json().catch(() => ({}));
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

    const { data: ppRows } = await supabase
      .from('post_platforms')
      .select('platform, external_id')
      .eq('post_id', postId)
      .eq('status', 'posted')
      .not('external_id', 'is', null);

    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('team_id', user.teamId)
      .in('platform', post.platforms)
      .eq('status', 'active');

    const refreshed: any[] = [];
    for (const pp of ppRows || []) {
      const account = (accounts || []).find((a) => a.platform === pp.platform);
      if (!account || !pp.external_id) continue;

      try {
        let metrics: any = { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, raw: {} };

        if (pp.platform === 'instagram' || pp.platform === 'facebook') {
          const apiBase = pp.platform === 'instagram'
            ? `https://graph.facebook.com/v26.0/${account.external_id}`
            : `https://graph.facebook.com/v26.0/${pp.external_id}`;
          const fields = pp.platform === 'instagram'
            ? 'insights.metric(impressions,reach,likes,comments,saves)'
            : 'insights.metric(post_impressions,post_reactions_like_total,post_comments,post_shares)';
          const res = await fetch(`${apiBase}?fields=${fields}&access_token=${account.access_token}`);
          const data = await res.json();
          if (data.insights?.data) {
            for (const m of data.insights.data) {
              const val = m.values?.[0]?.value || 0;
              if (m.name === 'impressions' || m.name === 'post_impressions') metrics.impressions = val;
              if (m.name === 'reach') metrics.views = val;
              if (m.name === 'likes' || m.name === 'post_reactions_like_total') metrics.likes = val;
              if (m.name === 'comments' || m.name === 'post_comments') metrics.comments = val;
              if (m.name === 'saves') metrics.saves = val;
              if (m.name === 'post_shares') metrics.shares = val;
            }
            metrics.raw = data;
          }
        } else if (pp.platform === 'linkedin') {
          const res = await fetch(
            `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(pp.external_id)}`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          const data = await res.json();
          metrics.likes = data.numLikes || 0;
          metrics.comments = data.numComments || 0;
          metrics.raw = data;
        } else if (pp.platform === 'x') {
          const res = await fetch(
            `https://api.twitter.com/2/tweets/${pp.external_id}?tweet.fields=public_metrics`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          const data = await res.json();
          const m = data.data?.public_metrics || {};
          metrics.impressions = m.impression_count || 0;
          metrics.likes = m.like_count || 0;
          metrics.comments = m.reply_count || 0;
          metrics.shares = m.retweet_count || 0;
          metrics.raw = data;
        }

        await supabase.from('analytics_snapshots').insert({
          post_id: postId,
          platform: pp.platform,
          impressions: metrics.impressions,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          saves: metrics.saves,
          raw: metrics.raw,
        });

        refreshed.push({ platform: pp.platform, ...metrics });
      } catch (err: any) {
        refreshed.push({ platform: pp.platform, error: err.message });
      }
    }

    return NextResponse.json({ postId, refreshed });
  } catch (error: any) {
    console.error('analytics/post/force error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
