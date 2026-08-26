import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_x')?.value;
  const codeVerifier = req.cookies.get('oauth_verifier_x')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'Twitter OAuth nao configurado' }, { status: 500 });

  try {
    const redirectUri = `${BASE_URL}/api/oauth/x/callback`;
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || '',
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Twitter token exchange failed');

    // Get user info
    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    const twitterUser = userData.data;

    const user = await getUserFromToken(req);
    if (!user) throw new Error('Nao autorizado');

    const supabase = getSupabase();
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('platform', 'x')
      .eq('username', twitterUser?.username)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('social_accounts')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          external_id: twitterUser?.id,
          expires_at: expiresAt,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('social_accounts').insert({
        team_id: user.teamId,
        platform: 'x',
        username: twitterUser?.username || 'unknown',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        external_id: twitterUser?.id,
        expires_at: expiresAt,
      });
    }

    return NextResponse.redirect(new URL('/dashboard?connected=x', req.url));
  } catch (err: any) {
    console.error('X OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
