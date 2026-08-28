import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const META_APP_ID = process.env.META_APP_ID || process.env.IG_APP_ID || '';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'https://stackpost.expostacker.com.br/api/oauth/facebook/callback';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : new URL(req.url).searchParams.get('token') || '';

  let stateToken = 'facebook';
  if (token) {
    const user = await getUserFromToken(req);
    if (user) {
      stateToken = `${user.teamId}:facebook`;
    }
  }

  // Escopos basicos que funcionam sem App Review (development mode).
  // Escopos avancados (pages_manage_engagement, pages_read_engagement, pages_read_user_content,
  // pages_manage_metadata, pages_messaging) exigem App Review no Meta for Developers.
  // Adicionar depois da aprovacao.
  const scopes = [
    'pages_show_list',
    'pages_manage_posts',
  ];

  // Usar mesma versao da API configurada no App (v26.0) para evitar conflitos de escopo
  const url = new URL('https://www.facebook.com/v26.0/dialog/oauth');
  url.searchParams.set('client_id', META_APP_ID);
  url.searchParams.set('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.set('scope', scopes.join(','));
  url.searchParams.set('state', stateToken);
  url.searchParams.set('response_type', 'code');

  return NextResponse.redirect(url.toString());
}
