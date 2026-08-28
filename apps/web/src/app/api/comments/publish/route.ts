import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

// POST /api/comments/publish — publica um comment salvo na plataforma
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireRole(req, PERMISSIONS.EDIT);
  if (authError) return authError;

  const { commentId } = await req.json().catch(() => ({}));
  if (!commentId) return NextResponse.json({ error: 'commentId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: comment, error: cError } = await supabase
      .from('comments')
      .select('*, posts!inner(team_id, id, platforms)')
      .eq('id', commentId)
      .single();
    if (cError || !comment) return NextResponse.json({ error: 'Comment nao encontrado' }, { status: 404 });
    if (comment.posts?.team_id !== user!.teamId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const platform = comment.platform;
    const text = comment.text;

    // Buscar external_id do post na plataforma
    const { data: pp } = await supabase
      .from('post_platforms')
      .select('external_id')
      .eq('post_id', comment.post_id)
      .eq('platform', platform)
      .eq('status', 'posted')
      .maybeSingle();
    if (!pp?.external_id) return NextResponse.json({ error: 'Post nao publicado nesta plataforma' }, { status: 400 });

    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('team_id', user!.teamId)
      .eq('platform', platform)
      .eq('status', 'active')
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao conectada' }, { status: 400 });

    let externalCommentId: string | null = null;

    if (platform === 'instagram' || platform === 'facebook') {
      const res = await fetch(`https://graph.facebook.com/v26.0/${pp.external_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, access_token: account.access_token }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro ao comentar' }, { status: 400 });
      externalCommentId = data.id;
    } else if (platform === 'linkedin') {
      // LinkedIn comments via socialActions
      const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(pp.external_id)}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${account.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({ actor: `urn:li:person:${account.external_id}`, message: { text } }),
        }
      );
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.message || 'Erro ao comentar no LinkedIn' }, { status: 400 });
      externalCommentId = data.id || data.$id;
    } else if (platform === 'x') {
      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.access_token}`,
        },
        body: JSON.stringify({ text, reply: { in_reply_to_tweet_id: pp.external_id } }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.detail || 'Erro ao comentar no X' }, { status: 400 });
      externalCommentId = data.data?.id;
    } else if (platform === 'youtube') {
      const res = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            videoId: pp.external_id,
            topLevelComment: { snippet: { textOriginal: text } },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro ao comentar no YouTube' }, { status: 400 });
      externalCommentId = data.id;
    } else if (platform === 'reddit') {
      const res = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'StackPost/1.0',
        },
        body: new URLSearchParams({ thing_id: `t3_${pp.external_id}`, text }).toString(),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: 'Erro ao comentar no Reddit' }, { status: 400 });
      externalCommentId = data.json?.data?.things?.[0]?.data?.id;
    } else if (platform === 'threads') {
      const userId = account.platform_account_id;
      const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'TEXT', text, reply_to_id: pp.external_id, access_token: account.access_token }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) return NextResponse.json({ error: createData.error?.message || 'Erro no Threads' }, { status: 400 });
      const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: createData.id, access_token: account.access_token }),
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok) return NextResponse.json({ error: publishData.error?.message || 'Erro no Threads' }, { status: 400 });
      externalCommentId = publishData.id;
    } else {
      return NextResponse.json({ error: `Comentar em ${platform} nao suportado ainda` }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({ status: 'posted', external_id: externalCommentId, posted_at: new Date().toISOString() })
      .eq('id', commentId);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, externalId: externalCommentId });
  } catch (error: any) {
    console.error('Publish comment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
