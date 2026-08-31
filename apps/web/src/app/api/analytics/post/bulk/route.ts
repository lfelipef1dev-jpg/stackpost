import { NextRequest, NextResponse } from 'next/server';
import { analytics_post_bulkBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/analytics/post/bulk — buscar analytics de multiplos posts
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = analytics_post_bulkBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { postIds } = bodyRaw1;
  if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
    return NextResponse.json({ error: 'postIds (array) obrigatorio' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    // Verificar que todos os posts pertencem ao team
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId)
      .in('id', postIds);
    const validIds = (posts || []).map((p) => p.id);
    if (validIds.length === 0) return NextResponse.json({ results: [] });

    const { data: snapshots, error } = await supabase
      .from('analytics_snapshots')
      .select('post_id, platform, impressions, views, likes, comments, shares, saves, created_at')
      .in('post_id', validIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por post_id, pegando o snapshot mais recente por plataforma
    const byPost: Record<string, any> = {};
    for (const s of snapshots || []) {
      if (!byPost[s.post_id]) {
        byPost[s.post_id] = { postId: s.post_id, totals: { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }, byPlatform: {} };
      }
      if (!byPost[s.post_id].byPlatform[s.platform]) {
        byPost[s.post_id].byPlatform[s.platform] = {
          impressions: s.impressions || 0,
          views: s.views || 0,
          likes: s.likes || 0,
          comments: s.comments || 0,
          shares: s.shares || 0,
          saves: s.saves || 0,
        };
        byPost[s.post_id].totals.impressions += s.impressions || 0;
        byPost[s.post_id].totals.views += s.views || 0;
        byPost[s.post_id].totals.likes += s.likes || 0;
        byPost[s.post_id].totals.comments += s.comments || 0;
        byPost[s.post_id].totals.shares += s.shares || 0;
        byPost[s.post_id].totals.saves += s.saves || 0;
      }
    }

    return NextResponse.json({ results: Object.values(byPost) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
