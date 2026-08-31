import { NextRequest, NextResponse } from 'next/server';

const PROVIDERS = ['google', 'discord'] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') as (typeof PROVIDERS)[number];
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Provider invalido' }, { status: 400 });
  }

  const nexusUrl = process.env.NEXT_PUBLIC_NEXUS_SUPABASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333';

  // Codificar o redirect final dentro da URL de callback
  // O Supabase vai redirecionar para callbackUrl?access_token=...&refresh_token=...
  // e o /auth/callback vai ler o redirect da query
  const callbackUrl = `${siteUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`;

  // NAO passar state - o Supabase gera o dele internamente
  const oauthUrl = `${nexusUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(callbackUrl)}`;

  return NextResponse.redirect(oauthUrl, { status: 302 });
}
