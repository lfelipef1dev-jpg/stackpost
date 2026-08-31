import { logger } from '@/lib/logger';
import { oauth_mastodon_callbackQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_mastodon_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_mastodon')?.value;
  const instance = req.cookies.get('oauth_instance_mastodon')?.value || 'mastodon.social';
  const clientId = req.cookies.get('oauth_mastodon_client_id')?.value;
  const clientSecret = req.cookies.get('oauth_mastodon_client_secret')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'Client credentials perdidos' }, { status: 400 });

  try {
    const redirectUri = `${BASE_URL}/api/oauth/mastodon/callback`;
    const tokenRes = await fetch(`https://${instance}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error || 'Mastodon token exchange failed');

    // Get user info
    const userRes = await fetch(`https://${instance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    const user = await getUserFromToken(req);
    if (!user) throw new Error('Nao autorizado');

    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('platform', 'mastodon')
      .eq('username', userData.username)
      .maybeSingle();

    const accountData = {
      access_token: tokenData.access_token,
      external_id: userData.id,
      platform_account_id: userData.id,
      platform_metadata: { instance, acct: userData.acct },
    };

    if (existing) {
      await supabase.from('social_accounts').update(accountData).eq('id', existing.id);
    } else {
      await supabase.from('social_accounts').insert({
        team_id: user.teamId,
        platform: 'mastodon',
        username: userData.username,
        ...accountData,
      });
    }

    return NextResponse.redirect(new URL('/dashboard?connected=mastodon', req.url));
  } catch (err: any) {
    logger.error('Mastodon OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
