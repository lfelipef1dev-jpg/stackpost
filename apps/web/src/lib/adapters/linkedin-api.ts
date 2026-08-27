import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3333/api/oauth/linkedin/callback';

export function getLinkedInAuthUrl(): string {
  const scopes = encodeURIComponent('openid profile w_member_social');
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${scopes}`;
}

export async function handleLinkedInCallback(code: string) {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: LINKEDIN_CLIENT_ID || '',
      client_secret: LINKEDIN_CLIENT_SECRET || '',
      redirect_uri: LINKEDIN_REDIRECT_URI,
    }),
  });
  const data = await res.json();

  if (data.error) throw new Error(data.error_description || data.error);

  // Usar /v2/userinfo (openid + profile) pra pegar sub (person ID) e nome
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json();

  if (user.error) throw new Error(user.error_description || user.error || 'Erro ao buscar perfil');

  return {
    accessToken: data.access_token,
    username: user.name || user.given_name || user.sub || 'LinkedIn User',
    externalId: user.sub,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
  };
}

export async function publishToLinkedIn(account: any, content: string, imageUrl: string, videoUrl?: string) {
  // Usar external_id (user.sub do userinfo) salvo no momento do OAuth
  const author = `urn:li:person:${account.external_id}`;

  if (!account.external_id) {
    return { success: false, error: 'LinkedIn account sem external_id. Reconecte a conta.' };
  }

  // VIDEO: upload via assets com recipe feedshare-video
  if (videoUrl) {
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          owner: author,
          serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
        },
      }),
    });
    const register = await registerRes.json();

    if (register.error) return { success: false, error: register.error };

    const uploadUrl = register.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = register.value.asset;

    // Baixar video e subir
    const videoRes = await fetch(videoUrl);
    const videoBlob = await videoRes.blob();

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': videoRes.headers.get('content-type') || 'video/mp4' },
      body: videoBlob,
    });

    if (!uploadRes.ok) return { success: false, error: 'Falha no upload do video' };

    // Polling: esperar processamento do video (max 5 min)
    let videoReady = false;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.linkedin.com/v2/assets/${asset.split(':').pop()}`, {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const status = await statusRes.json();
      const recipes = status?.recipes || [];
      const videoRecipe = recipes.find((r: any) => r.recipe === 'urn:li:digitalmediaRecipe:feedshare-video');
      if (videoRecipe?.status === 'READY') {
        videoReady = true;
        break;
      }
      if (videoRecipe?.status === 'ERROR') {
        return { success: false, error: 'LinkedIn rejeitou o video' };
      }
    }

    if (!videoReady) return { success: false, error: 'Timeout: video nao processou apos 5 min' };

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'VIDEO',
            media: [{ status: 'READY', description: { text: content }, media: asset }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const post = await postRes.json();

    if (post.error) return { success: false, error: post.error };

    return { success: true, externalId: post.id };
  }

  // IMAGE: upload via assets com recipe feedshare-image
  if (imageUrl) {
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: author,
          serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
        },
      }),
    });
    const register = await registerRes.json();

    if (register.error) return { success: false, error: register.error };

    const uploadUrl = register.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = register.value.asset;

    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': imageRes.headers.get('content-type') || 'image/jpeg' },
      body: imageBlob,
    });

    if (!uploadRes.ok) return { success: false, error: 'Falha no upload da imagem' };

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'IMAGE',
            media: [{ status: 'READY', description: { text: content }, media: asset }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const post = await postRes.json();

    if (post.error) return { success: false, error: post.error };

    return { success: true, externalId: post.id };
  }

  // Post só de texto
  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  const post = await postRes.json();

  if (post.error) return { success: false, error: post.error };

  return { success: true, externalId: post.id };
}
