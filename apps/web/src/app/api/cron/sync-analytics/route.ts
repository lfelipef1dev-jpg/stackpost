import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Sincronizar analytics de posts publicados (a cada 6 horas)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: posts, error } = await supabase
      .from('post_platforms')
      .select('id, post_id, platform, external_id')
      .eq('status', 'posted')
      .gte('created_at', twoDaysAgo)
      .limit(100);

    if (error) throw error;

    let synced = 0;
    let failed = 0;

    for (const pp of posts || []) {
      try {
        // Buscar account da plataforma
        const { data: account } = await supabase
          .from('social_accounts')
          .select('access_token, platform_metadata')
          .eq('platform', pp.platform)
          .limit(1)
          .single();

        if (!account) { failed++; continue; }

        // Buscar analytics da plataforma
        let analyticsUrl = '';
        if (pp.platform === 'instagram' || pp.platform === 'facebook') {
          analyticsUrl = `https://graph.facebook.com/v26.0/${pp.external_id}/insights?metric=impressions,reach,likes,comments,shares&access_token=${account.access_token}`;
        } else if (pp.platform === 'linkedin') {
          analyticsUrl = `https://api.linkedin.com/rest/socialActions/${pp.external_id}`;
        } else if (pp.platform === 'youtube') {
          analyticsUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${pp.external_id}`;
        }

        if (!analyticsUrl) { failed++; continue; }

        const res = await fetch(analyticsUrl, {
          headers: pp.platform === 'linkedin' ? { Authorization: `Bearer ${account.access_token}`, 'X-Restli-Protocol-Version': '2.0.0' } : {},
        });

        if (!res.ok) { failed++; continue; }

        const raw = await res.json();
        // Salvar snapshot
        await supabase.from('analytics_snapshots').insert({
          post_id: pp.post_id,
          platform: pp.platform,
          raw,
          impressions: raw.data?.find((m: any) => m.name === 'impressions')?.values?.[0]?.value || 0,
          likes: raw.data?.find((m: any) => m.name === 'likes')?.values?.[0]?.value || 0,
          comments: raw.data?.find((m: any) => m.name === 'comments')?.values?.[0]?.value || 0,
          shares: raw.data?.find((m: any) => m.name === 'shares')?.values?.[0]?.value || 0,
        });
        synced++;
      } catch (err) {
        logger.error(`Failed to sync analytics for ${pp.platform}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'sync-analytics', synced, failed, total: (posts || []).length, timestamp: now });
  } catch (err: any) {
    logger.error('Cron sync-analytics error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
