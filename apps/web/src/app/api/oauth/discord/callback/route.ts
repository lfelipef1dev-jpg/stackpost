import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_discord')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'Discord OAuth nao configurado' }, { status: 500 });

  try {
    const redirectUri = `${BASE_URL}/api/oauth/discord/callback`;
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Discord token exchange failed');

    const user = await getUserFromToken(req);
    if (!user) throw new Error('Nao autorizado');

    const supabase = getSupabase();

    // Discord webhook URL vem no token response se scope webhook.incoming
    const webhookUrl = tokenData.webhook?.url;

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('platform', 'discord')
      .maybeSingle();

    const accountData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      platform_account_id: tokenData.webhook?.id || null,
      platform_metadata: { webhook_url: webhookUrl, channel_id: tokenData.webhook?.channel_id },
      expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      status: 'active',
    };

    if (existing) {
      await supabase.from('social_accounts').update(accountData).eq('id', existing.id);
    } else {
      await supabase.from('social_accounts').insert({
        team_id: user.teamId,
        platform: 'discord',
        username: 'Discord Webhook',
        ...accountData,
      });
    }

    return NextResponse.redirect(new URL('/accounts?connected=discord', req.url));
  } catch (err: any) {
    console.error('Discord OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
