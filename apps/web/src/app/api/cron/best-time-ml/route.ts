import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Recalcular melhores horarios via ML
// Trigger: Cloudflare Workers Cron Triggers (semanal)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar contas ativas
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, team_id, platform')
      .eq('status', 'active')
      .limit(100);

    if (error) throw error;

    let recalculated = 0;
    let failed = 0;

    for (const account of accounts || []) {
      try {
        // Buscar posts publicados da conta nos ultimos 90 dias
        const { data: posts } = await supabase
          .from('posts')
          .select('id, published_at')
          .eq('team_id', account.team_id)
          .contains('platforms', [account.platform])
          .eq('status', 'posted')
          .gte('published_at', ninetyDaysAgo);

        if (!posts || posts.length < 5) continue; // precisa de pelo menos 5 posts

        const postIds = posts.map((p) => p.id);

        // Buscar analytics desses posts
        const { data: snapshots } = await supabase
          .from('analytics_snapshots')
          .select('post_id, impressions, likes, comments, shares')
          .in('post_id', postIds)
          .eq('platform', account.platform);

        if (!snapshots || snapshots.length === 0) continue;

        // Agrupar por dia da semana + hora
        const bySlot: Record<string, { count: number; engagement: number }> = {};
        const postEngagement: Record<string, number> = {};
        for (const s of snapshots) {
          const post = posts.find((p) => p.id === s.post_id);
          if (!post?.published_at) continue;
          const d = new Date(post.published_at);
          const dayOfWeek = d.getDay(); // 0-6
          const hour = d.getHours();
          const slotKey = `${dayOfWeek}-${hour}`;
          const engagement = (s.impressions || 0) + (s.likes || 0) + (s.comments || 0) + (s.shares || 0);
          if (!bySlot[slotKey]) bySlot[slotKey] = { count: 0, engagement: 0 };
          bySlot[slotKey].count++;
          bySlot[slotKey].engagement += engagement;
          postEngagement[s.post_id] = engagement;
        }

        // Calcular engagement medio por slot
        const slotAverages = Object.entries(bySlot).map(([slot, v]) => ({
          slot,
          dayOfWeek: parseInt(slot.split('-')[0]),
          hour: parseInt(slot.split('-')[1]),
          avgEngagement: v.engagement / v.count,
          count: v.count,
        }));

        // Top 3 slots por engagement medio
        const topSlots = slotAverages
          .sort((a, b) => b.avgEngagement - a.avgEngagement)
          .slice(0, 3);

        if (topSlots.length === 0) continue;

        // Salvar na tabela best_time (ou platform_metadata)
        const bestTimeData = topSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          hour: s.hour,
          avgEngagement: Math.round(s.avgEngagement),
          samples: s.count,
        }));

        await supabase
          .from('social_accounts')
          .update({
            platform_metadata: { bestTime: bestTimeData, lastCalculated: now },
          })
          .eq('id', account.id);

        recalculated++;
      } catch (err) {
        console.warn(`Best-time ML ${account.platform} ${account.id} error:`, err);
        failed++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'best-time-ml', recalculated, failed, total: (accounts || []).length, timestamp: now });
  } catch (err: any) {
    console.error('Cron best-time-ml error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
