import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3333/api/oauth/linkedin/callback';

export function getLinkedInAuthUrl(): string {
  const scopes = encodeURIComponent('w_member_social');
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

  // Tentar /v2/me primeiro, depois /v2/userinfo
  let userId = '';
  let userName = 'LinkedIn User';
  
  try {
    const userRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (userRes.ok) {
      const user = await userRes.json();
      userId = user.id;
      userName = (user.localizedFirstName || '') + ' ' + (user.localizedLastName || '');
      if (!userName.trim()) userName = user.id || 'LinkedIn User';
    }
  } catch (e) {
    // /v2/me pode falhar sem r_basicprofile
  }

  return {
    accessToken: data.access_token,
    username: userName.trim() || userId || 'LinkedIn User',
    externalId: userId,
    expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
  };
}

export async function publishToLinkedIn(account: any, content: string, imageUrl: string) {
  const userRes = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });
  const user = await userRes.json();
  const author = `urn:li:person:${user.id}`;

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
