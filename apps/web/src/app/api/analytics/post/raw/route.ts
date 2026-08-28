import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/analytics/post/raw?postId=xxx — raw payload por plataforma
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');
  if (!postId) return NextResponse.json({ error: 'postId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: post } = await supabase
      .from('posts')
      .select('id, team_id')
      .eq('id', postId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (!post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });

    const { data: snapshots } = await supabase
      .from('analytics_snapshots')
      .select('platform, raw, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    const byPlatform: Record<string, any> = {};
    for (const s of snapshots || []) {
      if (!byPlatform[s.platform]) {
        byPlatform[s.platform] = { raw: s.raw, captured_at: s.created_at };
      }
    }

    return NextResponse.json({ postId, raw: byPlatform });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
