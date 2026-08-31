import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Importar historico de posts das plataformas conectadas
// Trigger: Cloudflare Workers Cron Triggers (diario)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Buscar contas ativas
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, team_id, platform, external_id, platform_account_id, username, access_token')
      .eq('status', 'active')
      .limit(100);

    if (error) throw error;

    let imported = 0;
    let failed = 0;

    for (const account of accounts || []) {
      try {
        if (account.platform === 'instagram') {
          const res = await fetch(
            `https://graph.facebook.com/v26.0/${account.external_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp&since=${Math.floor(Date.now() / 1000) - 86400}&access_token=${account.access_token}`
          );
          const data = await res.json();
          for (const item of data.data || []) {
            await supabase.from('imported_posts').upsert({
              team_id: account.team_id,
              social_account_id: account.id,
              platform: 'instagram',
              external_id: item.id,
              content: item.caption || '',
              media_url: item.media_url || null,
              permalink: item.permalink || null,
              posted_at: item.timestamp || null,
            }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
            imported++;
          }
        } else if (account.platform === 'facebook') {
          const pageId = account.platform_account_id || account.external_id;
          const res = await fetch(
            `https://graph.facebook.com/v26.0/${pageId}/posts?fields=id,message,full_picture,permalink_url,created_time&since=${Math.floor(Date.now() / 1000) - 86400}&access_token=${account.access_token}`
          );
          const data = await res.json();
          for (const item of data.data || []) {
            await supabase.from('imported_posts').upsert({
              team_id: account.team_id,
              social_account_id: account.id,
              platform: 'facebook',
              external_id: item.id,
              content: item.message || '',
              media_url: item.full_picture || null,
              permalink: item.permalink_url || null,
              posted_at: item.created_time || null,
            }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
            imported++;
          }
        } else if (account.platform === 'linkedin') {
          const author = account.external_id?.startsWith('urn:li:')
            ? account.external_id
            : `urn:li:person:${account.external_id}`;
          const res = await fetch(
            `https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(author)}&count=20`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          const data = await res.json();
          for (const item of data.elements || []) {
            const postedAt = item.created?.time ? new Date(item.created.time).toISOString() : null;
            if (postedAt && postedAt < since) continue;
            await supabase.from('imported_posts').upsert({
              team_id: account.team_id,
              social_account_id: account.id,
              platform: 'linkedin',
              external_id: item.id || item.activity,
              content: item.text?.text || '',
              media_url: item.media?.[0]?.originalUrl || null,
              permalink: item.activity || null,
              posted_at: postedAt,
            }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
            imported++;
          }
        } else if (account.platform === 'youtube') {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&forHandle=${account.username}&type=video&publishedAfter=${since}&maxResults=20`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          const data = await res.json();
          for (const item of data.items || []) {
            await supabase.from('imported_posts').upsert({
              team_id: account.team_id,
              social_account_id: account.id,
              platform: 'youtube',
              external_id: item.id?.videoId,
              content: item.snippet?.title || '',
              media_url: item.snippet?.thumbnails?.high?.url || null,
              permalink: `https://youtube.com/watch?v=${item.id?.videoId}`,
              posted_at: item.snippet?.publishedAt || null,
            }, { onConflict: 'team_id,external_id', ignoreDuplicates: true });
            imported++;
          }
        }
      } catch (err) {
        logger.warn(`Import history ${account.platform} ${account.id} error:`, err);
        failed++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'import-history', imported, failed, total: (accounts || []).length, timestamp: now });
  } catch (err: any) {
    logger.error('Cron import-history error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
