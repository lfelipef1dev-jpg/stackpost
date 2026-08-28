import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/imports/facebook-recommendations — importar recommendations/reviews de uma Page
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { socialAccountId, limit } = await req.json().catch(() => ({}));
  if (!socialAccountId) return NextResponse.json({ error: 'socialAccountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .eq('platform', 'facebook')
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta Facebook nao encontrada' }, { status: 404 });

    const pageId = account.platform_account_id || account.external_id;
    const maxLimit = Math.min(limit || 50, 100);

    // Facebook recommendations/reviews via graph API
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/ratings?fields=reviewer,rating,recommendation_type,review_text,created_time,open_graph_story&limit=${maxLimit}&access_token=${account.access_token}`
    );
    const data = await res.json();

    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 });

    let imported = 0;
    for (const rec of data.data || []) {
      await supabase.from('imported_posts').upsert({
        team_id: user.teamId,
        social_account_id: socialAccountId,
        platform: 'facebook',
        external_id: rec.open_graph_story?.id || rec.id || `${pageId}_rec_${imported}`,
        content: rec.review_text || '',
        media_url: null,
        permalink: rec.open_graph_story?.id ? `https://facebook.com/${rec.open_graph_story.id}` : null,
        posted_at: rec.created_time || null,
        metadata: {
          type: 'recommendation',
          rating: rec.rating,
          recommendation_type: rec.recommendation_type,
          reviewer: rec.reviewer?.name || rec.reviewer?.id,
        },
      }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
      imported++;
    }

    return NextResponse.json({ imported, platform: 'facebook', type: 'recommendations' });
  } catch (error: any) {
    console.error('Facebook recommendations import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
