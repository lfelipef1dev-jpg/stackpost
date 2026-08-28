import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/imports/post-history — importar historico de posts de uma conta
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { socialAccountId, platform, limit } = await req.json().catch(() => ({}));
  if (!socialAccountId || !platform) {
    return NextResponse.json({ error: 'socialAccountId e platform obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    const maxLimit = Math.min(limit || 100, 200);
    let imported = 0;

    if (platform === 'instagram' || platform === 'facebook') {
      const fields = 'id,caption,media_type,media_url,permalink,timestamp';
      const url = platform === 'instagram'
        ? `https://graph.facebook.com/v21.0/${account.external_id}/media?fields=${fields}&limit=${maxLimit}&access_token=${account.access_token}`
        : `https://graph.facebook.com/v21.0/${account.external_id}/posts?fields=id,message,full_picture,permalink_url,created_time&limit=${maxLimit}&access_token=${account.access_token}`;
      const res = await fetch(url);
      const data = await res.json();
      for (const item of data.data || []) {
        await supabase.from('imported_posts').upsert({
          team_id: user.teamId,
          social_account_id: socialAccountId,
          platform,
          external_id: item.id,
          content: item.caption || item.message || '',
          media_url: item.media_url || item.full_picture || null,
          permalink: item.permalink || item.permalink_url || null,
          posted_at: item.timestamp || item.created_time || null,
        }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
        imported++;
      }
    } else if (platform === 'linkedin') {
      const author = account.external_id && account.external_id.startsWith('urn:li:')
        ? account.external_id
        : `urn:li:person:${account.external_id}`;
      const res = await fetch(
        `https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(author)}&count=${maxLimit}`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const data = await res.json();
      for (const item of data.elements || []) {
        await supabase.from('imported_posts').upsert({
          team_id: user.teamId,
          social_account_id: socialAccountId,
          platform,
          external_id: item.id || item.activity,
          content: item.text?.text || '',
          media_url: item.media?.[0]?.originalUrl || null,
          permalink: item.activity || null,
          posted_at: item.created?.time ? new Date(item.created.time).toISOString() : null,
        }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
        imported++;
      }
    } else if (platform === 'youtube') {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&forHandle=${account.username}&type=video&maxResults=${maxLimit}`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const data = await res.json();
      for (const item of data.items || []) {
        await supabase.from('imported_posts').upsert({
          team_id: user.teamId,
          social_account_id: socialAccountId,
          platform,
          external_id: item.id?.videoId,
          content: item.snippet?.title || '',
          media_url: item.snippet?.thumbnails?.high?.url || null,
          permalink: `https://youtube.com/watch?v=${item.id?.videoId}`,
          posted_at: item.snippet?.publishedAt || null,
        }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
        imported++;
      }
    } else {
      return NextResponse.json({ error: `Import de historico de ${platform} nao suportado` }, { status: 400 });
    }

    return NextResponse.json({ imported, platform });
  } catch (error: any) {
    console.error('Post history import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
