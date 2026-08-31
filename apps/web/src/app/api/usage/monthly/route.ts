import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const now = new Date();
  const firstOfMonth = now.toISOString().slice(0, 7) + '-01T00:00:00.000Z';

  const supabase = getSupabase();

  try {
    // Buscar o plano da organizacao
    const { data: team } = await supabase
      .from('teams')
      .select('organization_id')
      .eq('id', user.teamId)
      .single();

    let plan = 'free';
    let organizationCreatedAt: string | null = null;
    if (team?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan, created_at')
        .eq('id', team.organization_id)
        .single();
      if (org?.plan) plan = org.plan;
      if (org?.created_at) organizationCreatedAt = org.created_at;
    }

    // Limites por plano
    const planLimits: Record<string, { posts: number; comments: number; uploads: number }> = {
      free: { posts: 50, comments: 100, uploads: 100 * 1024 * 1024 }, // 100 MB
      starter: { posts: 2000, comments: 1000, uploads: 500 * 1024 * 1024 }, // 500 MB
      growth: { posts: 8000, comments: 4000, uploads: 2 * 1024 * 1024 * 1024 }, // 2 GB
      scale: { posts: 40000, comments: 20000, uploads: 10 * 1024 * 1024 * 1024 }, // 10 GB
      business: { posts: 150000, comments: 75000, uploads: 50 * 1024 * 1024 * 1024 }, // 50 GB
    };
    const limits = planLimits[plan] || planLimits.free;

    // Single efficient query using team_id date filter
    const [{ count: postsCount, error: postsError }, { count: uploadsCount, error: uploadsError }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
      supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
    ]);
    if (postsError) throw postsError;
    if (uploadsError) throw uploadsError;

    return new NextResponse(JSON.stringify({
      plan,
      organizationCreatedAt,
      credits: 0,
      month: firstOfMonth.split('T')[0],
      posts: { used: postsCount || 0, limit: limits.posts, remaining: limits.posts - (postsCount || 0) },
      comments: { used: 0, limit: limits.comments, remaining: limits.comments },
      uploads: { used: uploadsCount || 0, limit: limits.uploads, remaining: limits.uploads - (uploadsCount || 0) },
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
