import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/comments/import — importar comentarios de um post publicado
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { postId, platform, limit } = await req.json().catch(() => ({}));
  if (!postId || !platform) return NextResponse.json({ error: 'postId e platform obrigatorios' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: post } = await supabase
      .from('posts')
      .select('id, team_id')
      .eq('id', postId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (!post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });

    const { data: pp } = await supabase
      .from('post_platforms')
      .select('external_id')
      .eq('post_id', postId)
      .eq('platform', platform)
      .eq('status', 'posted')
      .maybeSingle();
    if (!pp?.external_id) return NextResponse.json({ error: 'Post nao publicado nesta plataforma' }, { status: 400 });

    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('team_id', user.teamId)
      .eq('platform', platform)
      .eq('status', 'active')
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao conectada' }, { status: 400 });

    const maxLimit = Math.min(limit || 50, 100);
    let imported = 0;

    if (platform === 'instagram' || platform === 'facebook') {
      const res = await fetch(
        `https://graph.facebook.com/v26.0/${pp.external_id}/comments?fields=id,message,from,created_time&limit=${maxLimit}&access_token=${account.access_token}`
      );
      const data = await res.json();
      for (const c of data.data || []) {
        await supabase.from('comments').upsert({
          post_id: postId,
          platform,
          text: c.message || '',
          external_id: c.id,
          author: c.from?.name || c.from?.id || '',
          status: 'imported',
          posted_at: c.created_time || null,
        }, { onConflict: 'external_id', ignoreDuplicates: true });
        imported++;
      }
    } else if (platform === 'linkedin') {
      const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(pp.external_id)}/comments?fields=(actor,message,created_time)&count=${maxLimit}`,
        { headers: { Authorization: `Bearer ${account.access_token}`, 'X-Restli-Protocol-Version': '2.0.0' } }
      );
      const data = await res.json();
      for (const c of data.elements || []) {
        await supabase.from('comments').upsert({
          post_id: postId,
          platform,
          text: c.message?.text || '',
          external_id: c.id || c.$id,
          author: c.actor || '',
          status: 'imported',
          posted_at: c.created_time || null,
        }, { onConflict: 'external_id', ignoreDuplicates: true });
        imported++;
      }
    } else if (platform === 'youtube') {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${pp.external_id}&maxResults=${maxLimit}`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const data = await res.json();
      for (const item of data.items || []) {
        const c = item.snippet?.topLevelComment?.snippet;
        await supabase.from('comments').upsert({
          post_id: postId,
          platform,
          text: c?.textDisplay || '',
          external_id: item.id,
          author: c?.authorDisplayName || '',
          status: 'imported',
          posted_at: c?.publishedAt || null,
        }, { onConflict: 'external_id', ignoreDuplicates: true });
        imported++;
      }
    } else if (platform === 'reddit') {
      const res = await fetch(`https://oauth.reddit.com/comments/${pp.external_id}?limit=${maxLimit}`, {
        headers: { Authorization: `Bearer ${account.access_token}`, 'User-Agent': 'StackPost/1.0' },
      });
      const data = await res.json();
      // Reddit returns array of listings; second one is comments
      const comments = data?.[1]?.data?.children || [];
      for (const c of comments) {
        if (c.kind !== 't1') continue;
        await supabase.from('comments').upsert({
          post_id: postId,
          platform,
          text: c.data?.body || '',
          external_id: c.data?.id,
          author: c.data?.author || '',
          status: 'imported',
          posted_at: c.data?.created_utc ? new Date(c.data.created_utc * 1000).toISOString() : null,
        }, { onConflict: 'external_id', ignoreDuplicates: true });
        imported++;
      }
    } else {
      return NextResponse.json({ error: `Import de comentarios de ${platform} nao suportado` }, { status: 400 });
    }

    return NextResponse.json({ imported, platform, postId });
  } catch (error: any) {
    console.error('Import comments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
