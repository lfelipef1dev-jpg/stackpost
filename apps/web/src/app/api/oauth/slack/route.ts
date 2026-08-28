import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'SLACK_CLIENT_ID nao configurado' }, { status: 500 });

  const redirectUri = `${BASE_URL}/api/oauth/slack/callback`;
  const state = Buffer.from(Math.random().toString(36).slice(2)).toString('base64');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'incoming-webhook,chat:write',
    state,
  });

  const res = NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  res.cookies.set('oauth_state_slack', state, { httpOnly: true, maxAge: 600, path: '/' });
  return res;
}
