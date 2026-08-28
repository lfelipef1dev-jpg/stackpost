import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3333/api/oauth/linkedin/callback';

export function getLinkedInAuthUrl(): string {
  // r_basicprofile retido para compatibilidade; r_organization_social permite Company Pages
  const scopes = encodeURIComponent('openid profile w_member_social r_organization_social w_organization_social');
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

  const accessToken = data.access_token;

  // Usar /v2/userinfo (openid + profile) pra pegar sub (person ID) e nome
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = await userRes.json();

  if (user.error) throw new Error(user.error_description || user.error || 'Erro ao buscar perfil');

  const accounts: any[] = [];

  // Conta pessoal
  accounts.push({
    accessToken,
    username: user.name || user.given_name || user.sub || 'LinkedIn User',
    externalId: user.sub,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
    type: 'person',
  });

  // Buscar Company Pages administradas
  try {
    const orgsRes = await fetch(
      'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalEntity~(id,localizedName,vanityName)))',
      { headers: { Authorization: `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' } }
    );
    const orgsData = await orgsRes.json();
    if (orgsData.elements) {
      for (const el of orgsData.elements) {
        const org = el.organizationalEntity;
        const orgId = org.match(/\d+$/)[0];
        accounts.push({
          accessToken,
          username: `${org.localizedName || 'Company'} (Page)`,
          externalId: `urn:li:organization:${orgId}`,
          expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
          type: 'company',
        });
      }
    }
  } catch (err) {
    console.warn('LinkedIn Company Pages fetch error:', err);
  }

  return accounts;
}

export async function publishToLinkedIn(account: any, content: string, imageUrl: string, videoUrl?: string, mediaUrls?: string[], pdfUrl?: string) {
  // author pode ser urn:li:person:{sub} ou urn:li:organization:{id}
  const author = account.external_id && account.external_id.startsWith('urn:li:')
    ? account.external_id
    : `urn:li:person:${account.external_id}`;

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

    // Publicar com status READY - LinkedIn processa async apos publicacao
    // (Polling dentro do Worker estoura o CPU time limit do Cloudflare)
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

  // MULTI-MIDIA (ate 10 imagens)
  if (mediaUrls && mediaUrls.length > 1) {
    const mediaItems: any[] = [];
    for (const url of mediaUrls.slice(0, 10)) {
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
      if (register.error || !register.value) {
        return { success: false, error: register.error?.message || register.error || 'Erro ao registrar upload LinkedIn' };
      }

      const uploadUrl = register.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = register.value.asset;

      const imgRes = await fetch(url);
      const imgBlob = await imgRes.blob();
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg' },
        body: imgBlob,
      });
      if (!uploadRes.ok) {
        return { success: false, error: `Falha no upload de midia LinkedIn (HTTP ${uploadRes.status})` };
      }

      mediaItems.push({ status: 'READY', description: { text: content.slice(0, 200) }, media: asset });
    }

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
            media: mediaItems,
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const post = await postRes.json();
    if (post.error) return { success: false, error: post.error };
    return { success: true, externalId: post.id };
  }

  // PDF / DOCUMENTO
  if (pdfUrl) {
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-document'],
          owner: author,
          serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
        },
      }),
    });
    const register = await registerRes.json();
    if (register.error || !register.value) {
      return { success: false, error: register.error?.message || register.error || 'Erro ao registrar upload PDF LinkedIn' };
    }

    const uploadUrl = register.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = register.value.asset;

    const pdfRes = await fetch(pdfUrl);
    const pdfBlob = await pdfRes.blob();
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': pdfRes.headers.get('content-type') || 'application/pdf' },
      body: pdfBlob,
    });
    if (!uploadRes.ok) {
      return { success: false, error: `Falha no upload de PDF LinkedIn (HTTP ${uploadRes.status})` };
    }

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
            shareMediaCategory: 'DOCUMENT',
            media: [{ status: 'READY', description: { text: content.slice(0, 200) }, media: asset }],
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
