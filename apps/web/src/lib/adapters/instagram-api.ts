import { getSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/meta/callback';

export function getInstagramAuthUrl(stateToken?: string): string {
  // Instagram API with Facebook Login for Business
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/get-started/
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_read_engagement',
    'pages_show_list',
    'business_management',
  ];
  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  url.searchParams.set('client_id', META_APP_ID || '');
  url.searchParams.set('redirect_uri', META_REDIRECT_URI);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('state', stateToken || 'instagram');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('display', 'page');
  url.searchParams.set('extras', JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } }));
  return url.toString();
}

export async function handleInstagramCallback(code: string) {
  // Facebook Login for Business - trocar code por token
  const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
  const res = await fetch(`${tokenUrl}?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${META_REDIRECT_URI}&code=${code}`);
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);

  // Obter paginas do usuario
  const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${data.access_token}`);
  const pages = await pagesRes.json();

  if (!pages.data?.length) throw new Error('Nenhuma pagina do Facebook encontrada. Conecte uma pagina business.');

  const pageToken = pages.data[0].access_token;
  const pageId = pages.data[0].id;

  // Obter Instagram Business Account da pagina
  const igRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
  const igData = await igRes.json();

  const instagramId = igData.instagram_business_account?.id;
  if (!instagramId) throw new Error('Conta do Instagram nao encontrada na pagina. Vincule uma conta business do Instagram a sua pagina do Facebook.');

  // Obter username do Instagram
  const igProfileRes = await fetch(`https://graph.facebook.com/v19.0/${instagramId}?fields=username&access_token=${pageToken}`);
  const igProfile = await igProfileRes.json();

  return {
    accessToken: data.access_token,
    pageToken,
    pageId,
    instagramId,
    username: igProfile.username || pages.data[0].name,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
  };
}

export async function publishToInstagram(account: any, content: string, imageUrl: string) {
  const containerRes = await fetch(`https://graph.facebook.com/v19.0/${account.instagram_id}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: imageUrl,
      caption: content,
      access_token: account.access_token,
    }),
  });
  const container = await containerRes.json();

  if (container.error) return { success: false, error: container.error.error_user_msg || container.error.message };

  await new Promise((r) => setTimeout(r, 3000));

  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${account.instagram_id}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: container.id,
      access_token: account.access_token,
    }),
  });
  const publish = await publishRes.json();

  if (publish.error) return { success: false, error: publish.error.error_user_msg || publish.error.message };

  return { success: true, externalId: publish.id };
}
