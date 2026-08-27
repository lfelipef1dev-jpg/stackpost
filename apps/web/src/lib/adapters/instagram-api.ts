import { getSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/meta/callback';

export function getInstagramAuthUrl(stateToken?: string): string {
  // Business Login for Instagram - endpoint api.instagram.com (nao facebook.com)
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_comments',
    'instagram_business_manage_messages',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ];
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', META_APP_ID || '');
  url.searchParams.set('redirect_uri', META_REDIRECT_URI);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('state', stateToken || 'instagram');
  url.searchParams.set('response_type', 'code');
  return url.toString();
}

export async function handleInstagramCallback(code: string) {
  // Business Login for Instagram - trocar code por token no endpoint do Instagram
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  const params = new URLSearchParams({
    client_id: META_APP_ID || '',
    client_secret: META_APP_SECRET || '',
    grant_type: 'authorization_code',
    redirect_uri: META_REDIRECT_URI,
    code,
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    body: params,
  });
  const data = await res.json();

  if (data.error_type) throw new Error(data.error_message || data.error_type);

  // Trocar short-lived por long-lived (60 dias)
  const longLivedRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${META_APP_SECRET}&access_token=${data.access_token}`
  );
  const longLived = await longLivedRes.json();

  const accessToken = longLived.access_token || data.access_token;
  const expiresIn = longLived.expires_in || 3600;

  // Obter perfil do usuario
  const profileRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  );
  const profile = await profileRes.json();

  if (profile.error) throw new Error(profile.error.message);

  return {
    accessToken,
    pageToken: null,
    pageId: null,
    instagramId: profile.id,
    username: profile.username,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
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
