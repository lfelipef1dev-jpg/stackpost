import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instance = searchParams.get('instance') || 'mastodon.social';

  // Mastodon OAuth requires per-instance client registration
  // First, try to register a client dynamically
  const redirectUri = `${BASE_URL}/api/oauth/mastodon/callback`;
  const state = Buffer.from(Math.random().toString(36).slice(2)).toString('base64');

  try {
    // Register client dynamically (Mastodon supports this)
    const regRes = await fetch(`https://${instance}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'StackPost',
        redirect_uris: redirectUri,
        scopes: 'read write',
        website: 'https://stackpost.expostacker.com.br',
      }),
    });

    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.error || 'Failed to register Mastodon client');

    const params = new URLSearchParams({
      client_id: regData.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read write',
      state,
    });

    const res = NextResponse.redirect(`https://${instance}/oauth/authorize?${params.toString()}`);
    res.cookies.set('oauth_state_mastodon', state, { httpOnly: true, maxAge: 600, path: '/' });
    res.cookies.set('oauth_instance_mastodon', instance, { httpOnly: true, maxAge: 600, path: '/' });
    res.cookies.set('oauth_mastodon_client_id', regData.client_id, { httpOnly: true, maxAge: 600, path: '/' });
    res.cookies.set('oauth_mastodon_client_secret', regData.client_secret, { httpOnly: true, maxAge: 600, path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
