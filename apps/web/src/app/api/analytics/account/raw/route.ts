import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/analytics/account/raw?accountId=xxx — raw analytics por conta
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('platform, team_id')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('team_id', user.teamId)
      .contains('platforms', [account.platform])
      .eq('status', 'posted');

    const postIds = (posts || []).map((p) => p.id);
    if (postIds.length === 0) return NextResponse.json({ raw: [] });

    const { data: snapshots } = await supabase
      .from('analytics_snapshots')
      .select('post_id, raw, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: false });

    const rawPerPost: Record<string, any> = {};
    for (const s of snapshots || []) {
      if (!rawPerPost[s.post_id]) {
        rawPerPost[s.post_id] = { raw: s.raw, captured_at: s.created_at };
      }
    }

    return NextResponse.json({ accountId, raw: Object.entries(rawPerPost).map(([postId, v]) => ({ postId, ...v })) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
