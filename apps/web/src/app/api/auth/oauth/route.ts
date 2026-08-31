import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const PROVIDERS = ['google', 'discord'] as const;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') as (typeof PROVIDERS)[number];
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Provider invalido' }, { status: 400 });
  }

  // State para protecao CSRF - guardamos no cookie
  const state = `${provider}:${redirect}:${Math.random().toString(36).slice(2)}`;
  const callbackUrl = `${BASE_URL}/api/auth/oauth/${provider}/callback`;

  let authUrl: string;

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      logger.error('GOOGLE_CLIENT_ID nao configurado');
      return NextResponse.json({ error: 'Google OAuth nao configurado' }, { status: 500 });
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } else {
    // discord
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      logger.error('DISCORD_CLIENT_ID nao configurado');
      return NextResponse.json({ error: 'Discord OAuth nao configurado' }, { status: 500 });
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'identify email',
      state,
      prompt: 'consent',
    });
    authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set('oauth_state_auth', state, {
    httpOnly: true,
    secure: !BASE_URL.includes('localhost'),
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
