import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/instagram/audio?q=texto — buscar audio no Instagram
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'q obrigatorio' }, { status: 400 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, external_id')
    .eq('team_id', user.teamId)
    .eq('platform', 'instagram')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'Instagram nao conectado' }, { status: 400 });

  try {
    // Instagram Music Search (requere instagram_business_manage_messages)
    const res = await fetch(
      `https://graph.facebook.com/v26.0/${account.external_id}/music?fields=id,title,artist&access_token=${account.access_token}`
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Audio search nao disponivel' }, { status: 400 });
    return NextResponse.json({ audio: data.data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
