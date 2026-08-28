import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/youtube/playlists — listar playlists do canal
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, platform_account_id')
    .eq('team_id', user.teamId)
    .eq('platform', 'youtube')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'YouTube nao conectado' }, { status: 400 });

  const channelId = account.platform_account_id;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50`,
      { headers: { Authorization: `Bearer ${account.access_token}` } }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'YouTube API error' }, { status: 400 });
    return NextResponse.json({ playlists: data.items || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/misc/youtube/playlists — criar playlist
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { title, description, privacy } = await req.json().catch(() => ({}));
  if (!title) return NextResponse.json({ error: 'title obrigatorio' }, { status: 400 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('team_id', user.teamId)
    .eq('platform', 'youtube')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'YouTube nao conectado' }, { status: 400 });

  try {
    const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snippet: { title, description: description || '' },
        status: { privacyStatus: privacy || 'public' },
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro ao criar playlist' }, { status: 400 });
    return NextResponse.json({ playlist: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
