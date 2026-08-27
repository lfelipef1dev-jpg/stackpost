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
    if (team?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', team.organization_id)
        .single();
      if (org?.plan) plan = org.plan;
    }

    // Limites por plano
    const planLimits: Record<string, { posts: number; comments: number; uploads: number }> = {
      free: { posts: 20, comments: 50, uploads: 100 },
      pro: { posts: 10000, comments: 5000, uploads: 100000 },
      business: { posts: 100000, comments: 50000, uploads: 500000 },
      enterprise: { posts: 999999, comments: 999999, uploads: 999999 },
    };
    const limits = planLimits[plan] || planLimits.free;

    // Single efficient query using team_id date filter
    const [{ count: postsCount, error: postsError }, { count: uploadsCount, error: uploadsError }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
      supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('team_id', user.teamId).gte('created_at', firstOfMonth),
    ]);
    if (postsError) throw postsError;
    if (uploadsError) throw uploadsError;

    return NextResponse.json({
      plan,
      credits: 0,
      month: firstOfMonth.split('T')[0],
      posts: { used: postsCount || 0, limit: limits.posts, remaining: limits.posts - (postsCount || 0) },
      comments: { used: 0, limit: limits.comments, remaining: limits.comments },
      uploads: { used: uploadsCount || 0, limit: limits.uploads, remaining: limits.uploads - (uploadsCount || 0) },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
