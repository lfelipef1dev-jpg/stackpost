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
      .select('id, platform, refresh_token, expires_at, external_id, platform_metadata')
      .not('refresh_token', 'is', null)
      .lte('expires_at', tomorrow)
      .limit(100);

    if (error) throw error;

    let refreshed = 0;
    let failed = 0;

    const refreshEndpoints: Record<string, { url: string; body: (account: any) => Record<string, string> }> = {
      meta: {
        url: 'https://graph.facebook.com/v21.0/oauth/access_token',
        body: (acc) => ({
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: acc.refresh_token,
        }),
      },
      linkedin: {
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
        body: (acc) => ({
          grant_type: 'refresh_token',
          refresh_token: acc.refresh_token,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      },
      x: {
        url: 'https://api.twitter.com/2/oauth2/token',
        body: (acc) => ({
          grant_type: 'refresh_token',
          refresh_token: acc.refresh_token,
        }),
      },
    };

    for (const account of accounts || []) {
      try {
        const config = refreshEndpoints[account.platform];
        if (!config) { failed++; continue; }

        const res = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(config.body(account)).toString(),
        });

        if (!res.ok) { failed++; continue; }

        const tokenData = await res.json();
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

    return NextResponse.json({ ok: true, cron: 'refresh-tokens', refreshed, failed, total: (accounts || []).length, timestamp: now.toISOString() });
  } catch (err: any) {
    console.error('Cron refresh-tokens error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
