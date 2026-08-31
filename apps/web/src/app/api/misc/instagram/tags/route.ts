import { misc_instagram_tagsQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/instagram/tags?q=texto — buscar hashtags/tags no Instagram
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = misc_instagram_tagsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
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
    const res = await fetch(
      `https://graph.facebook.com/v26.0/ig_hashtag_search?user_id=${account.external_id}&q=${encodeURIComponent(query)}&access_token=${account.access_token}`
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro ao buscar tags' }, { status: 400 });
    return NextResponse.json({ tags: data.data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
