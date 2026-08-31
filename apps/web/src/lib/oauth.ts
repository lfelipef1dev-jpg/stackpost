import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { requireEnv } from './env';

const BASE_URL = requireEnv('NEXT_PUBLIC_SITE_URL');

export interface OAuthConfig {
  platform: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectPath: string;
  profileUrl?: string;
  extraAuthParams?: Record<string, string>;
}

export function buildAuthUrl(config: OAuthConfig, state: string): string {
  const clientId = process.env[config.clientIdEnv];
  if (!clientId) throw new Error(`${config.clientIdEnv} nao configurado`);
  const redirectUri = `${BASE_URL}${config.redirectPath}`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    ...config.extraAuthParams,
  });
  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  config: OAuthConfig,
  code: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; raw?: any }> {
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) throw new Error(`${config.clientIdEnv} ou ${config.clientSecretEnv} nao configurado`);

  const redirectUri = `${BASE_URL}${config.redirectPath}`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.error_description || 'Token exchange failed');

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    raw: data,
  };
}

export async function saveAccount(
  req: NextRequest,
  platform: string,
  tokenData: { accessToken: string; refreshToken?: string; expiresIn?: number },
  profile: { username?: string; externalId?: string; platformAccountId?: string; metadata?: any }
) {
  const user = await getUserFromToken(req);
  if (!user) throw new Error('Nao autorizado');

  const supabase = getSupabase();
  const expiresAt = tokenData.expiresIn
    ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
    : null;

  const { data: existing } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('team_id', user.teamId)
    .eq('platform', platform)
    .eq('username', profile.username)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('social_accounts')
      .update({
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        external_id: profile.externalId,
        platform_account_id: profile.platformAccountId,
        expires_at: expiresAt,
        platform_metadata: profile.metadata,
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('social_accounts').insert({
      team_id: user.teamId,
      platform,
      username: profile.username,
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      external_id: profile.externalId,
      platform_account_id: profile.platformAccountId,
      expires_at: expiresAt,
      platform_metadata: profile.metadata,
    });
    if (error) throw error;
  }
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  tiktok: {
    platform: 'tiktok',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scope: 'user.info.basic,video.publish,video.upload',
    clientIdEnv: 'TIKTOK_CLIENT_ID',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    redirectPath: '/api/oauth/tiktok/callback',
  },
  youtube: {
    platform: 'youtube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    redirectPath: '/api/oauth/youtube/callback',
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  google_business: {
    platform: 'google_business',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/business.manage',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    redirectPath: '/api/oauth/google-business/callback',
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  pinterest: {
    platform: 'pinterest',
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scope: 'boards:read,pins:read,pins:write',
    clientIdEnv: 'PINTEREST_CLIENT_ID',
    clientSecretEnv: 'PINTEREST_CLIENT_SECRET',
    redirectPath: '/api/oauth/pinterest/callback',
  },
  reddit: {
    platform: 'reddit',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scope: 'submit identity',
    clientIdEnv: 'REDDIT_CLIENT_ID',
    clientSecretEnv: 'REDDIT_CLIENT_SECRET',
    redirectPath: '/api/oauth/reddit/callback',
    extraAuthParams: { duration: 'permanent' },
  },
  bluesky: {
    platform: 'bluesky',
    authUrl: 'https://bsky.social/oauth/authorize',
    tokenUrl: 'https://bsky.social/oauth/token',
    scope: 'atproto',
    clientIdEnv: 'BLUESKY_CLIENT_ID',
    clientSecretEnv: 'BLUESKY_CLIENT_SECRET',
    redirectPath: '/api/oauth/bluesky/callback',
  },
  snapchat: {
    platform: 'snapchat',
    authUrl: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    tokenUrl: 'https://accounts.snapchat.com/accounts/oauth2/token',
    scope: 'snapchat-marketing-api',
    clientIdEnv: 'SNAPCHAT_CLIENT_ID',
    clientSecretEnv: 'SNAPCHAT_CLIENT_SECRET',
    redirectPath: '/api/oauth/snapchat/callback',
  },
  threads: {
    platform: 'threads',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v26.0/oauth/access_token',
    scope: 'threads_basic,threads_content_publish',
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    redirectPath: '/api/oauth/threads/callback',
  },
  instagram: {
    platform: 'instagram',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
    clientIdEnv: 'IG_APP_ID',
    clientSecretEnv: 'IG_APP_SECRET',
    redirectPath: '/api/oauth/instagram/callback',
  },
  facebook: {
    platform: 'facebook',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    redirectPath: '/api/oauth/facebook/callback',
  },
  linkedin: {
    platform: 'linkedin',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_basicprofile,r_organization_social,w_organization_social,r_organization_social_feed',
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    redirectPath: '/api/oauth/linkedin/callback',
  },
  x: {
    platform: 'x',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read tweet.write users.read offline.access',
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    redirectPath: '/api/oauth/x/callback',
    extraAuthParams: { code_challenge: 'challenge', code_challenge_method: 'plain' },
  },
  mastodon: {
    platform: 'mastodon',
    authUrl: 'https://mastodon.social/oauth/authorize',
    tokenUrl: 'https://mastodon.social/oauth/token',
    scope: 'read write',
    clientIdEnv: 'MASTODON_CLIENT_ID',
    clientSecretEnv: 'MASTODON_CLIENT_SECRET',
    redirectPath: '/api/oauth/mastodon/callback',
  },
  discord: {
    platform: 'discord',
    authUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scope: 'webhook.incoming identify',
    clientIdEnv: 'DISCORD_CLIENT_ID',
    clientSecretEnv: 'DISCORD_CLIENT_SECRET',
    redirectPath: '/api/oauth/discord/callback',
  },
  slack: {
    platform: 'slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scope: 'incoming-webhook',
    clientIdEnv: 'SLACK_CLIENT_ID',
    clientSecretEnv: 'SLACK_CLIENT_SECRET',
    redirectPath: '/api/oauth/slack/callback',
  },
};
