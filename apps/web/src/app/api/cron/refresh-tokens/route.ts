import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Renovar tokens OAuth prestes a expirar (proximas 24h)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, access_token, refresh_token, expires_at, external_id, platform_metadata')
      .eq('status', 'active')
      .not('refresh_token', 'is', null)
      .lte('expires_at', tomorrow)
      .limit(100);

    if (error) throw error;

    let refreshed = 0;
    let failed = 0;
    let skipped = 0;

    for (const account of accounts || []) {
      try {
        const platform = account.platform;
        let tokenData: any = null;

        if (platform === 'facebook' || platform === 'instagram' || platform === 'meta') {
          // Meta Graph API — fb_exchange_token
          const res = await fetch('https://graph.facebook.com/v21.0/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'fb_exchange_token',
              client_id: process.env.META_APP_ID || process.env.IG_APP_ID || '',
              client_secret: process.env.META_APP_SECRET || process.env.IG_APP_SECRET || '',
              fb_exchange_token: account.refresh_token || account.access_token,
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'linkedin') {
          // LinkedIn OAuth2 refresh
          const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
              client_id: process.env.LINKEDIN_CLIENT_ID || '',
              client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'x' || platform === 'twitter') {
          // Twitter/X OAuth2 refresh
          const res = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64'),
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
              client_id: process.env.TWITTER_CLIENT_ID || '',
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'google_business' || platform === 'youtube') {
          // Google OAuth2 refresh
          const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
              client_id: process.env.GOOGLE_CLIENT_ID || '',
              client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'reddit') {
          const res = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64'),
              'User-Agent': 'StackPost/1.0',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'tiktok') {
          const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_key: process.env.TIKTOK_CLIENT_KEY || '',
              client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'pinterest') {
          const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64'),
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: account.refresh_token,
            }).toString(),
          });
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else if (platform === 'threads') {
          // Threads usa long-lived token via Graph API
          const res = await fetch(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${account.access_token}`);
          if (!res.ok) { failed++; continue; }
          tokenData = await res.json();
        } else {
          skipped++;
          continue;
        }

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || account.refresh_token,
            expires_at: expiresAt,
          })
          .eq('id', account.id);

        refreshed++;
      } catch (err) {
        console.error(`Failed to refresh ${account.platform}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      cron: 'refresh-tokens',
      refreshed,
      failed,
      skipped,
      total: (accounts || []).length,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error('Cron refresh-tokens error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
