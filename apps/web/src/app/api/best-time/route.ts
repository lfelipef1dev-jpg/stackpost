import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

interface HourScore {
  hour: number;
  score: number;
  postsCount: number;
  avgEngagement: number;
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');

  const supabase = getSupabase();

  try {
    const { data: teamPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, published_at')
      .eq('team_id', user!.teamId)
      .not('published_at', 'is', null);
    if (postsError) throw postsError;

    const postIds = (teamPosts || []).map((p: any) => p.id);
    const postHourMap = new Map<string, number>();
    for (const p of teamPosts || []) {
      const hour = new Date(p.published_at).getUTCHours();
      postHourMap.set(p.id, hour);
    }

    let snapshots: any[] = [];
    if (postIds.length > 0) {
      let query = supabase
        .from('analytics_snapshots')
        .select('post_id, platform, impressions, views, likes, comments, shares')
        .in('post_id', postIds);
      if (platform) {
        query = query.eq('platform', platform);
      }
      const { data, error: snapshotsError } = await query;
      if (snapshotsError) throw snapshotsError;
      snapshots = data || [];
    }

    const hourAggMap = new Map<number, { post_count: number; engagement_sum: number }>();
    for (const s of snapshots) {
      const hour = postHourMap.get(s.post_id);
      if (hour === undefined) continue;
      if (!hourAggMap.has(hour)) {
        hourAggMap.set(hour, { post_count: 0, engagement_sum: 0 });
      }
      const entry = hourAggMap.get(hour)!;
      entry.post_count++;
      entry.engagement_sum += (s.likes || 0) + (s.comments || 0) + (s.shares || 0) + (s.impressions || 0) / 100;
    }

    const rows: any[] = [];
    for (const [hour, entry] of hourAggMap) {
      rows.push({
        hour,
        post_count: entry.post_count,
        avg_engagement: entry.post_count > 0 ? entry.engagement_sum / entry.post_count : 0,
      });
    }
    rows.sort((a, b) => a.hour - b.hour);

    const hourScores: HourScore[] = [];
    const dbHours = new Map<number, HourScore>();

    for (const row of rows) {
      const hour = parseInt(row.hour);
      const score = parseFloat(row.avg_engagement) * Math.log(parseInt(row.post_count) + 1);
      const hs: HourScore = {
        hour,
        score,
        postsCount: parseInt(row.post_count),
        avgEngagement: parseFloat(row.avg_engagement),
      };
      dbHours.set(hour, hs);
      hourScores.push(hs);
    }

    for (let h = 0; h < 24; h++) {
      if (!dbHours.has(h)) {
        const fallbackScore = getFallbackScore(h, platform || 'default');
        hourScores.push({
          hour: h,
          score: fallbackScore,
          postsCount: 0,
          avgEngagement: 0,
        });
      }
    }

    hourScores.sort((a, b) => b.score - a.score);

    const topTimes = hourScores.slice(0, 5).map((hs) => ({
      hour: hs.hour,
      label: `${String(hs.hour).padStart(2, '0')}:00`,
      score: Math.round(hs.score * 100) / 100,
      confidence: hs.postsCount > 10 ? 'high' : hs.postsCount > 3 ? 'medium' : 'low',
      recommendation: hs.postsCount > 3
        ? `Baseado em ${hs.postsCount} posts com engajamento medio de ${Math.round(hs.avgEngagement)}`
        : `Recomendacao baseada em padrao da industria para ${platform || 'todas as plataformas'}`,
    }));

    return NextResponse.json({
      platform: platform || 'all',
      topTimes,
      allHours: hourScores.sort((a, b) => a.hour - b.hour),
      timezone: 'America/Sao_Paulo',
      basedOn: rows.length > 0 ? `${rows.length} horas com dados historicos` : 'Padroes da industria',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

function getFallbackScore(hour: number, platform: string): number {
  const industryPatterns: Record<string, number[]> = {
    instagram: [1, 1, 0.5, 0.5, 0.5, 1, 2, 3, 4, 5, 4, 3, 4, 3, 3, 4, 5, 7, 8, 9, 8, 6, 4, 2],
    facebook: [1, 1, 0.5, 0.5, 0.5, 1, 2, 3, 5, 7, 8, 6, 5, 4, 4, 5, 6, 7, 8, 7, 5, 4, 3, 2],
    linkedin: [0.5, 0.5, 0.5, 0.5, 0.5, 1, 2, 4, 7, 9, 8, 6, 5, 7, 6, 4, 3, 2, 1, 0.5, 0.5, 0.5, 0.5, 0.5],
    twitter: [1, 1, 0.5, 0.5, 0.5, 1, 2, 4, 6, 8, 7, 6, 7, 6, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2],
    default: [1, 1, 0.5, 0.5, 0.5, 1, 2, 3, 5, 7, 7, 6, 6, 5, 5, 5, 6, 7, 8, 7, 5, 4, 3, 2],
  };

  const pattern = industryPatterns[platform] || industryPatterns.default;
  return pattern[hour] || 1;
}
