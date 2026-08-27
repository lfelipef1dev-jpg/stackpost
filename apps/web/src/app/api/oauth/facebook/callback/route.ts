import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const META_APP_ID = process.env.META_APP_ID || process.env.IG_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.IG_APP_SECRET || '';
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/facebook/callback';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'facebook';

  if (!code) {
    return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  }

  const teamId = state.includes(':') ? state.split(':')[0] : null;

  try {
    // 1. Trocar code por access token de usuario
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', META_APP_ID);
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
    tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) throw new Error(tokenData.error.message);

    const userAccessToken = tokenData.access_token;

    // 2. Listar Pages do usuario
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture,followers_count&access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (pagesData.error) throw new Error(pagesData.error.message);

    const pages = pagesData.data || [];
    if (pages.length === 0) {
      throw new Error('Nenhuma Page encontrada. Crie uma Page no Facebook primeiro.');
    }

    // 3. Pegar a primeira Page (ou a que tem nome ExpoStacker)
    const page = pages.find((p: any) => p.name.toLowerCase().includes('expostacker')) || pages[0];

    const supabase = getSupabase();

    // Resolver teamId
    let resolvedTeamId = teamId;
    if (!resolvedTeamId) {
      const { data: firstTeam } = await supabase
        .from('teams')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      resolvedTeamId = firstTeam?.id;
    }

    if (!resolvedTeamId) throw new Error('Nenhum team encontrado');

    // 4. Upsert no banco
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', resolvedTeamId)
      .eq('platform', 'facebook')
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          access_token: page.access_token,
          external_id: page.id,
          username: page.name,
          platform_account_id: page.id,
          status: 'active',
        })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          team_id: resolvedTeamId,
          platform: 'facebook',
          username: page.name,
          access_token: page.access_token,
          external_id: page.id,
          platform_account_id: page.id,
          status: 'active',
        });
      if (insertError) throw insertError;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
    return NextResponse.redirect(`${siteUrl}/accounts?connected=facebook&pages=${pages.length}`);
  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
    return NextResponse.redirect(`${siteUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
}
