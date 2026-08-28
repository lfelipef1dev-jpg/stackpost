import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/tiktok/cml — TikTok Content Marketing Library / trending
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('team_id', user.teamId)
    .eq('platform', 'tiktok')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'TikTok nao conectado' }, { status: 400 });

  try {
    const res = await fetch('https://open.tiktokapis.com/v2/research/trending_content/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ max_count: 20 }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'TikTok CML error' }, { status: 400 });
    return NextResponse.json({ trending: data.data?.trending_content || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
