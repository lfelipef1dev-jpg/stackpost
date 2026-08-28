import { getSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/meta/callback';
// Para Business Login for Instagram, usar o Instagram App ID (diferente do Meta App ID)
const IG_APP_ID = process.env.IG_APP_ID || META_APP_ID;
const IG_APP_SECRET = process.env.IG_APP_SECRET || META_APP_SECRET;

export function getInstagramAuthUrl(stateToken?: string): string {
  // Business Login for Instagram - permissoes instagram_business_* ja ativadas
  // https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/
  const scopes = [
    'instagram_business_basic',
    'instagram_business_content_publish',
    'instagram_business_manage_comments',
    'instagram_business_manage_messages',
    'instagram_business_manage_insights',
  ];
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', IG_APP_ID || '');
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
    client_id: IG_APP_ID || '',
    client_secret: IG_APP_SECRET || '',
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
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${data.access_token}`
  );
  const longLived = await longLivedRes.json();

  const accessToken = longLived.access_token || data.access_token;
  const expiresIn = longLived.expires_in || 3600;
  const userId = data.user_id;

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
    instagramId: profile.id || userId,
    username: profile.username,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export async function publishToInstagram(account: any, content: string, mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' | 'STORY' | 'CAROUSEL' = 'IMAGE', firstComment?: string, carouselUrls?: string[]) {
  // Business Login for Instagram usa graph.instagram.com (nao graph.facebook.com)
  const igUserId = account.external_id || account.instagram_id;
  const token = account.access_token;

  if (!igUserId) return { success: false, error: 'Instagram: external_id nao encontrado na conta.' };

  // CAROUSEL: criar container para cada midia, depois container pai
  if (mediaType === 'CAROUSEL' && carouselUrls && carouselUrls.length > 0) {
    const childrenIds: string[] = [];
    for (const url of carouselUrls.slice(0, 10)) {
      const isVideo = url.match(/\.(mp4|mov|webm)$/i);
      const childParams: Record<string, string> = {
        access_token: token,
        is_carousel_item: 'true',
      };
      if (isVideo) {
        childParams.media_type = 'VIDEO';
        childParams.video_url = url;
      } else {
        childParams.image_url = url;
      }

      const childRes = await fetch(`https://graph.instagram.com/v23.0/${igUserId}/media`, {
        method: 'POST',
        body: new URLSearchParams(childParams),
      });
      const child = await childRes.json();
      if (child.error) return { success: false, error: child.error.error_user_msg || child.error.message };
      childrenIds.push(child.id);
    }

    // Aguardar processamento de cada child (polling real em vez de delay fixo)
    for (const childId of childrenIds) {
      let retries = 0;
      while (retries < 30) {
        const statusRes = await fetch(`https://graph.instagram.com/v23.0/${childId}?fields=status_code&access_token=${token}`);
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') break;
        if (statusData.status_code === 'ERROR') {
          return { success: false, error: `Erro ao processar midia do carrossel (child ${childId})` };
        }
        await new Promise((r) => setTimeout(r, 3000));
        retries++;
      }
    }

    const carouselParams = new URLSearchParams({
      access_token: token,
      media_type: 'CAROUSEL',
      caption: content,
      children: JSON.stringify(childrenIds),
    });

    const carouselRes = await fetch(`https://graph.instagram.com/v23.0/${igUserId}/media`, {
      method: 'POST',
      body: carouselParams,
    });
    const carousel = await carouselRes.json();
    if (carousel.error) return { success: false, error: carousel.error.error_user_msg || carousel.error.message };

    const publishRes = await fetch(`https://graph.instagram.com/v23.0/${igUserId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({ creation_id: carousel.id, access_token: token }),
    });
    const publish = await publishRes.json();
    if (publish.error) return { success: false, error: publish.error.error_user_msg || publish.error.message };

    if (firstComment?.trim() && publish.id) {
      await fetch(`https://graph.instagram.com/v23.0/${publish.id}/comments`, {
        method: 'POST',
        body: new URLSearchParams({ message: firstComment.trim(), access_token: token }),
      }).catch((err) => console.warn('Instagram first comment error:', err));
    }

    return { success: true, externalId: publish.id };
  }

  // Criar container de midia - parametros diferentes pra video, imagem e story
  const params: Record<string, string> = {
    access_token: token,
  };

  if (mediaType === 'STORY') {
    // Instagram Content Publishing API (graph.instagram.com) NAO suporta stories.
    // Stories exigem o endpoint /stories dedicado que nao esta disponivel via Business Login.
    // Retornar erro claro em vez de tentar e falhar silenciosamente.
    return {
      success: false,
      error: 'Stories do Instagram nao sao suportados via Content Publishing API. Use o endpoint de Stories dedicado.',
    };
  } else if (mediaType === 'VIDEO') {
    params.media_type = 'REELS';
    params.video_url = mediaUrl;
    params.caption = content;
  } else {
    params.image_url = mediaUrl;
    params.caption = content;
  }

  const containerRes = await fetch(`https://graph.instagram.com/v23.0/${igUserId}/media`, {
    method: 'POST',
    body: new URLSearchParams(params),
  });
  const container = await containerRes.json();

  if (container.error) return { success: false, error: container.error.error_user_msg || container.error.message };

  // Video precisa de polling real de status (delay fixo e frágil)
  if (mediaType === 'VIDEO') {
    let retries = 0;
    while (retries < 60) {
      const statusRes = await fetch(`https://graph.instagram.com/v23.0/${container.id}?fields=status_code&access_token=${token}`);
      const statusData = await statusRes.json();
      if (statusData.status_code === 'FINISHED') break;
      if (statusData.status_code === 'ERROR') return { success: false, error: 'Erro ao processar video no Instagram' };
      await new Promise((r) => setTimeout(r, 5000));
      retries++;
    }
  } else {
    // Imagem: pequeno delay inicial
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Publicar o container
  const publishRes = await fetch(`https://graph.instagram.com/v23.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: container.id,
      access_token: token,
    }),
  });
  const publish = await publishRes.json();

  if (publish.error) return { success: false, error: publish.error.error_user_msg || publish.error.message };

  // First comment (regra do bundle: max 2.200, ja validado no adapter)
  if (firstComment?.trim() && publish.id) {
    await fetch(`https://graph.instagram.com/v23.0/${publish.id}/comments`, {
      method: 'POST',
      body: new URLSearchParams({
        message: firstComment.trim(),
        access_token: token,
      }),
    }).catch((err) => console.warn('Instagram first comment error:', err));
  }

  return { success: true, externalId: publish.id };
}
