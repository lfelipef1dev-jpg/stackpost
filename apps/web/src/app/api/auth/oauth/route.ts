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

  // State: base64 do JSON {redirect, nonce} — nao depende de cookie cross-site
  const nonce = Math.random().toString(36).slice(2);
  const statePayload = JSON.stringify({ redirect, nonce });
  const state = Buffer.from(statePayload).toString('base64url');

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

  return NextResponse.redirect(authUrl);
}
