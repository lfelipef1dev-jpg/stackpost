import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, status, platforms, created_at, published_at, content')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (postsError) throw postsError;

    const total = (posts || []).length;
    const posted = (posts || []).filter((p: any) => p.status === 'posted').length;
    const errors = (posts || []).filter((p: any) => p.status === 'error').length;
    const scheduled = (posts || []).filter((p: any) => p.status === 'scheduled').length;
    const drafts = (posts || []).filter((p: any) => p.status === 'draft').length;
    const processing = (posts || []).filter((p: any) => p.status === 'processing').length;

    const byPlatform: Record<string, number> = {};
    (posts || []).forEach((p: any) => {
      p.platforms?.forEach((plat: string) => {
        byPlatform[plat] = (byPlatform[plat] || 0) + 1;
      });
    });

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const byDay = last30Days.map((day) => {
      const count = (posts || []).filter((p: any) => {
        const pdate = (p.published_at || p.created_at)?.toISOString?.()?.split('T')[0] || p.published_at || p.created_at;
        return pdate?.startsWith(day);
      }).length;
      return { date: day, count };
    });

    const successRate = total > 0 ? Math.round((posted / total) * 100) : 0;

    const postIds = (posts || []).map((p: any) => p.id);
    let metrics: any[] = [];
    if (postIds.length > 0) {
      const { data: snapshots, error: snapshotsError } = await supabase
        .from('analytics_snapshots')
        .select('platform, impressions, views, likes, comments, shares, saves')
        .in('post_id', postIds);
      if (snapshotsError) throw snapshotsError;

      const byPlatformMap: Record<string, any> = {};
      for (const s of snapshots || []) {
        if (!byPlatformMap[s.platform]) {
          byPlatformMap[s.platform] = {
            platform: s.platform,
            impressions: 0,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
          };
        }
        byPlatformMap[s.platform].impressions += s.impressions || 0;
        byPlatformMap[s.platform].views += s.views || 0;
        byPlatformMap[s.platform].likes += s.likes || 0;
        byPlatformMap[s.platform].comments += s.comments || 0;
        byPlatformMap[s.platform].shares += s.shares || 0;
        byPlatformMap[s.platform].saves += s.saves || 0;
      }
      metrics = Object.values(byPlatformMap);
    }

    return NextResponse.json({
      summary: {
        total,
        posted,
        errors,
        scheduled,
        drafts,
        processing,
        successRate,
      },
      byPlatform,
      byDay,
      metrics,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
