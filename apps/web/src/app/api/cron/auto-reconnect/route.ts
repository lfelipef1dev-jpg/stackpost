import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const { data: accountsData, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('status', 'active');
    if (accountsError) throw accountsError;

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const accounts = (accountsData || []).filter((a: any) =>
      !a.last_checked_at || new Date(a.last_checked_at) < sixHoursAgo
    );

    let checked = 0;
    let expired = 0;
    let refreshed = 0;

    for (const account of accounts) {
      checked++;
      let valid = true;

      if (account.platform === 'instagram' || account.platform === 'facebook') {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/me?access_token=${account.access_token}`
          );
          if (!res.ok) valid = false;
        } catch {
          valid = false;
        }
      } else if (account.platform === 'linkedin') {
        try {
          const res = await fetch('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          if (!res.ok) valid = false;
        } catch {
          valid = false;
        }
      }

      if (!valid) {
        if (account.refresh_token) {
          let newToken: string | null = null;

          if (account.platform === 'instagram' || account.platform === 'facebook') {
            const res = await fetch(
              `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${account.access_token}`
            );
            const data = await res.json();
            if (data.access_token) newToken = data.access_token;
          } else if (account.platform === 'linkedin') {
            const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: account.refresh_token,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
              }),
            });
            const data = await res.json();
            if (data.access_token) newToken = data.access_token;
          }

          if (newToken) {
            const { error: updateError } = await supabase
              .from('social_accounts')
              .update({ access_token: newToken, status: 'active', last_checked_at: new Date().toISOString() })
              .eq('id', account.id);
            if (updateError) throw updateError;
            refreshed++;
          } else {
            const { error: updateError } = await supabase
              .from('social_accounts')
              .update({ status: 'expired', last_checked_at: new Date().toISOString() })
              .eq('id', account.id);
            if (updateError) throw updateError;
            expired++;
          }
        } else {
          const { error: updateError } = await supabase
            .from('social_accounts')
            .update({ status: 'expired', last_checked_at: new Date().toISOString() })
            .eq('id', account.id);
          if (updateError) throw updateError;
          expired++;
        }
      } else {
        const { error: updateError } = await supabase
          .from('social_accounts')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', account.id);
        if (updateError) throw updateError;
      }
    }

    return NextResponse.json({
      checked,
      expired,
      refreshed,
      stillActive: checked - expired - refreshed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
