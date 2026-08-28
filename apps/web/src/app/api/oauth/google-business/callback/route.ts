import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_gb')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'Google OAuth nao configurado' }, { status: 500 });

  try {
    const redirectUri = `${BASE_URL}/api/oauth/google-business/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Google token exchange failed');

    const user = await getUserFromToken(req);
    if (!user) throw new Error('Nao autorizado');

    const supabase = getSupabase();

    // Buscar locations do Google Business Profile
    let locations: any[] = [];
    try {
      const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const accountsData = await accountsRes.json();
      if (accountsData.accounts) {
        for (const acc of accountsData.accounts) {
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${acc.name}/locations?readMask=name,title`,
            { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
          );
          const locData = await locRes.json();
          if (locData.locations) {
            locations.push(...locData.locations.map((l: any) => ({ id: l.name, name: l.title, accountId: acc.name })));
          }
        }
      }
    } catch (err) {
      console.warn('Google Business locations fetch error:', err);
    }

    // Se tem locations, criar uma conta por location; senao, uma conta generica
    const accountsToInsert: any[] = locations.length > 0
      ? locations.map((loc) => ({
          team_id: user.teamId,
          platform: 'google_business',
          username: loc.name,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          external_id: loc.id,
          platform_account_id: loc.id,
          platform_metadata: { account_id: loc.accountId, type: 'location' },
          expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          status: 'active',
        }))
      : [{
          team_id: user.teamId,
          platform: 'google_business',
          username: 'Google Business',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          external_id: null,
          platform_account_id: null,
          platform_metadata: { type: 'account' },
          expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          status: 'active',
        }];

    // Deletar contas antigas e inserir novas
    await supabase.from('social_accounts').delete().eq('team_id', user.teamId).eq('platform', 'google_business');
    for (const acc of accountsToInsert) {
      await supabase.from('social_accounts').insert(acc);
    }

    return NextResponse.redirect(new URL(`/accounts?connected=google_business&locations=${locations.length}`, req.url));
  } catch (err: any) {
    console.error('Google Business OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
