import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/reddit/flairs?subreddit=xxx — listar flairs de um subreddit
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subreddit = searchParams.get('subreddit');
  if (!subreddit) return NextResponse.json({ error: 'subreddit obrigatorio' }, { status: 400 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('team_id', user.teamId)
    .eq('platform', 'reddit')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'Reddit nao conectado' }, { status: 400 });

  try {
    const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/api/link_flair_v2`, {
      headers: { Authorization: `Bearer ${account.access_token}`, 'User-Agent': 'StackPost/1.0' },
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar flairs' }, { status: 400 });
    return NextResponse.json({ flairs: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
