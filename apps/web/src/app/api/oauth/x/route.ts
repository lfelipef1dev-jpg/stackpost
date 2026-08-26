import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'TWITTER_CLIENT_ID nao configurado' }, { status: 500 });

  const redirectUri = `${BASE_URL}/api/oauth/x/callback`;
  const state = Buffer.from(Math.random().toString(36).slice(2)).toString('base64');
  const codeVerifier = Buffer.from(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeVerifier,
    code_challenge_method: 'plain',
  });

  const res = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params.toString()}`);
  res.cookies.set('oauth_state_x', state, { httpOnly: true, maxAge: 600, path: '/' });
  res.cookies.set('oauth_verifier_x', codeVerifier, { httpOnly: true, maxAge: 600, path: '/' });
  return res;
}
