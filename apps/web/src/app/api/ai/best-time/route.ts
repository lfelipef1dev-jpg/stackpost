import { NextRequest, NextResponse } from 'next/server';
import { ai_best_timeBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_best_timeBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { platform } = bodyRaw1;

  const bestTimes: Record<string, string> = {
    instagram: '19:00',
    linkedin: '08:30',
    x: '12:00',
    facebook: '13:00',
    tiktok: '18:00',
    youtube: '14:00',
    threads: '10:00',
    pinterest: '20:00',
  };

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('post_platforms')
      .select('published_at, platform, engagement_rate')
      .eq('team_id', user.teamId)
      .eq('platform', platform || 'instagram')
      .order('engagement_rate', { ascending: false })
      .limit(10);

    const hourCounts: Record<number, { sum: number; count: number }> = {};
    (data || []).forEach((p: any) => {
      if (!p.published_at) return;
      const hour = new Date(p.published_at).getHours();
      if (!hourCounts[hour]) hourCounts[hour] = { sum: 0, count: 0 };
      hourCounts[hour].sum += p.engagement_rate || 0;
      hourCounts[hour].count += 1;
    });

    let bestHour = bestTimes[platform || 'instagram'];
    let bestAvg = -1;
    Object.entries(hourCounts).forEach(([hour, { sum, count }]) => {
      const avg = sum / count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = `${String(hour).padStart(2, '0')}:00`;
      }
    });

    return NextResponse.json({ bestHour, platform: platform || 'instagram' });
  } catch (error) {
    return NextResponse.json({ bestHour: bestTimes[platform || 'instagram'], platform: platform || 'instagram' });
  }
}
