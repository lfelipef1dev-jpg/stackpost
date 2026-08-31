import { logger } from '@/lib/logger';
import { oauth_slack_callbackQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_slack_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_slack')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'Slack OAuth nao configurado' }, { status: 500 });

  try {
    const redirectUri = `${BASE_URL}/api/oauth/slack/callback`;
    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.ok) throw new Error(tokenData.error || 'Slack token exchange failed');

    const user = await getUserFromToken(req);
    if (!user) throw new Error('Nao autorizado');

    const supabase = getSupabase();
    const webhookUrl = tokenData.incoming_webhook?.url;
    const channelId = tokenData.incoming_webhook?.channel_id;

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('platform', 'slack')
      .maybeSingle();

    const accountData = {
      access_token: tokenData.access_token,
      platform_account_id: channelId,
      platform_metadata: { webhook_url: webhookUrl, channel: tokenData.incoming_webhook?.channel },
      status: 'active',
    };

    if (existing) {
      await supabase.from('social_accounts').update(accountData).eq('id', existing.id);
    } else {
      await supabase.from('social_accounts').insert({
        team_id: user.teamId,
        platform: 'slack',
        username: tokenData.incoming_webhook?.channel || 'Slack Webhook',
        ...accountData,
      });
    }

    return NextResponse.redirect(new URL('/accounts?connected=slack', req.url));
  } catch (err: any) {
    logger.error('Slack OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
