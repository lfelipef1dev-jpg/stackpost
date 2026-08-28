import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'DISCORD_CLIENT_ID nao configurado' }, { status: 500 });

  const redirectUri = `${BASE_URL}/api/oauth/discord/callback`;
  const state = Buffer.from(Math.random().toString(36).slice(2)).toString('base64');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'webhook.incoming identify',
    state,
  });

  const res = NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  res.cookies.set('oauth_state_discord', state, { httpOnly: true, maxAge: 600, path: '/' });
  return res;
}
