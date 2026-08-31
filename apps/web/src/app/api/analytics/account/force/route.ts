import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { analytics_account_forceBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/analytics/account/force — forca refresh de analytics de todos os posts de uma conta
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = analytics_account_forceBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { accountId } = bodyRaw1;
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

    // Buscar todos os posts publicados desta plataforma
    const { data: posts } = await supabase
      .from('posts')
      .select('id, platforms')
      .eq('team_id', user.teamId)
      .contains('platforms', [account.platform])
      .eq('status', 'posted');

    const postIds = (posts || []).map((p) => p.id);
    if (postIds.length === 0) return NextResponse.json({ refreshed: 0 });

    // Buscar post_platforms com external_id
    const { data: ppRows } = await supabase
      .from('post_platforms')
      .select('post_id, platform, external_id')
      .in('post_id', postIds)
      .eq('platform', account.platform)
      .eq('status', 'posted')
      .not('external_id', 'is', null);

    let refreshed = 0;
    let failed = 0;

    for (const pp of ppRows || []) {
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
        } else if (pp.platform === 'youtube') {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${pp.external_id}`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          const data = await res.json();
          const stats = data.items?.[0]?.statistics || {};
          metrics.views = parseInt(stats.viewCount || '0');
          metrics.likes = parseInt(stats.likeCount || '0');
          metrics.comments = parseInt(stats.commentCount || '0');
          metrics.raw = data;
        }

        await supabase.from('analytics_snapshots').insert({
          post_id: pp.post_id,
          platform: pp.platform,
          impressions: metrics.impressions,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          saves: metrics.saves,
          raw: metrics.raw,
        });
        refreshed++;
      } catch (err) {
        logger.warn(`Force refresh ${pp.platform} post ${pp.post_id} error:`, err);
        failed++;
      }
    }

    return NextResponse.json({ accountId, refreshed, failed, total: (ppRows || []).length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
