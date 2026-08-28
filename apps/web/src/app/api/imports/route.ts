import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { socialAccountId, platform, limit } = body;

  if (!socialAccountId || !platform) {
    return NextResponse.json({ error: 'socialAccountId e platform obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (accountError) throw accountError;

    if (!account) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    const maxLimit = Math.min(limit || 100, 100);

    let imported: any[] = [];

    if (account.platform === 'instagram' || account.platform === 'facebook') {
      const mediaRes = await fetch(
        `https://graph.facebook.com/v19.0/${account.external_id}/media?fields=id,caption,media_type,media_url,timestamp,permalink&limit=${maxLimit}&access_token=${account.access_token}`
      );
      const mediaData = await mediaRes.json();
      imported = mediaData.data || [];
    } else if (account.platform === 'linkedin') {
      const author = account.external_id && account.external_id.startsWith('urn:li:')
        ? account.external_id
        : `urn:li:person:${account.external_id}`;
      const postsRes = await fetch(
        `https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(author)}&count=${maxLimit}`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const postsData = await postsRes.json();
      imported = postsData.elements || [];
    }

    for (const item of imported) {
      try {
        const { error: upsertError } = await supabase
          .from('imported_posts')
          .upsert(
            {
              team_id: user.teamId,
              social_account_id: socialAccountId,
              platform,
              external_id: item.id,
              content: item.caption || item.text?.text || '',
              media_url: item.media_url || item.media?.[0]?.originalUrl || null,
              permalink: item.permalink || item.activity || null,
              posted_at: item.timestamp || item.created?.time || null,
            },
            { onConflict: 'team_id,external_id', ignoreDuplicates: true }
          );
        if (upsertError) throw upsertError;
      } catch (e) {
        // skip duplicates
      }
    }

    return NextResponse.json({ imported: imported.length, platform });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('imported_posts')
      .select('*')
      .eq('team_id', user.teamId)
      .order('posted_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
