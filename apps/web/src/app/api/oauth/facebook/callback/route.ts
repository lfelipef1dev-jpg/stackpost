import { logger } from '@/lib/logger';
import { oauth_facebook_callbackQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const META_APP_ID = process.env.META_APP_ID || process.env.IG_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.IG_APP_SECRET || '';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/facebook/callback';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_facebook_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'facebook';

  if (!code) {
    return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  }

  const teamId = state.includes(':') ? state.split(':')[0] : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';

  try {
    // 1. Trocar code por user access token de curta duracao
    const tokenUrl = new URL('https://graph.facebook.com/v26.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', META_APP_ID);
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
    tokenUrl.searchParams.set('redirect_uri', FACEBOOK_REDIRECT_URI);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) throw new Error(tokenData.error.message);

    const shortLivedToken = tokenData.access_token;

    // 2. Trocar por long-lived (60 dias)
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedRes.json();
    if (longLivedData.error) throw new Error(longLivedData.error.message);

    const userAccessToken = longLivedData.access_token;
    const userTokenExpiresAt = longLivedData.expires_in
      ? new Date(Date.now() + longLivedData.expires_in * 1000).toISOString()
      : null;

    // 3. Listar TODAS as Pages do usuario (com page_access_token, avatar, followers)
    const pagesRes = await fetch(
      `https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token,picture,followers_count,tasks&limit=100&access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (pagesData.error) throw new Error(pagesData.error.message);

    const pages = pagesData.data || [];
    if (pages.length === 0) {
      throw new Error('Nenhuma Page encontrada. Crie uma Page no Facebook primeiro.');
    }

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

    // 4. Salvar/Atualizar conta "meta_user" com o user_access_token (para renovar page tokens depois)
    const { data: existingUserAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', resolvedTeamId)
      .eq('platform', 'meta_user')
      .maybeSingle();

    const userAccountData = {
      access_token: userAccessToken,
      expires_at: userTokenExpiresAt,
      platform_metadata: { type: 'user_token', pages_count: pages.length },
      status: 'active',
    };

    if (existingUserAccount) {
      await supabase.from('social_accounts').update(userAccountData).eq('id', existingUserAccount.id);
    } else {
      await supabase.from('social_accounts').insert({
        team_id: resolvedTeamId,
        platform: 'meta_user',
        username: 'Meta User Token',
        ...userAccountData,
      });
    }

    // 5. Para cada Page, salvar como conta Facebook separada
    const connectedPages: string[] = [];
    for (const page of pages) {
      const pageAccountData = {
        access_token: page.access_token,
        external_id: page.id,
        platform_account_id: page.id,
        username: page.name,
        platform_metadata: {
          type: 'page',
          avatar: page.picture?.data?.url || null,
          followers: page.followers_count || 0,
          tasks: page.tasks || [],
        },
        status: 'active',
      };

      // Verificar se ja existe uma conta para esta Page (mesmo external_id)
      const { data: existingPage } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('team_id', resolvedTeamId)
        .eq('platform', 'facebook')
        .eq('external_id', page.id)
        .maybeSingle();

      if (existingPage) {
        const { error: updErr } = await supabase
          .from('social_accounts')
          .update(pageAccountData)
          .eq('id', existingPage.id);
        if (updErr) logger.warn(`Erro ao atualizar Page ${page.name}:`, updErr.message);
      } else {
        const { error: insErr } = await supabase.from('social_accounts').insert({
          team_id: resolvedTeamId,
          platform: 'facebook',
          ...pageAccountData,
        });
        if (insErr) logger.warn(`Erro ao inserir Page ${page.name}:`, insErr.message);
      }

      connectedPages.push(page.name);
    }

    // 6. Redirecionar com lista de Pages conectadas
    const pagesParam = encodeURIComponent(connectedPages.join(', '));
    return NextResponse.redirect(
      `${siteUrl}/accounts?connected=facebook&pages=${pages.length}&names=${pagesParam}`
    );
  } catch (error: any) {
    logger.error('Facebook OAuth error:', error);
    return NextResponse.redirect(`${siteUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
}
