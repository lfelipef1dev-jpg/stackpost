import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getUserFromToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

// Rotas que exigem autenticacao. Qualquer path fora desta lista cai na rota
// /[seo] e recebe 404 correto (em vez de redirect para /login, que gerava
// soft-404 em URLs inexistentes).
const PRIVATE_PATHS = ['/dashboard', '/composer', '/calendar', '/accounts', '/analytics', '/billing', '/settings', '/team', '/media', '/bulk', '/comments', '/imports', '/link-in-bio', '/webhooks'];

function getAllowedOrigins(): string[] {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const origins = ['http://localhost:3333', 'https://localhost:3333'];
  if (base) origins.push(base);
  return origins;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-idempotency-key, x-webhook-signature, x-admin-token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const CSP = "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' https: data: blob:; " +
  "connect-src 'self' https://cloudflareinsights.com; " +
  "font-src 'self'; " +
  "frame-ancestors https://expostacker.com.br https://*.expostacker.com.br http://localhost:* http://127.0.0.1:*; " +
  "base-uri 'self'; " +
  "form-action 'self';"

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('users')
    .select('is_superuser, status')
    .eq('id', userId)
    .single();
  return data?.is_superuser === true && data?.status === 'active';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const requestId = req.headers.get('cf-ray') || '-';
  const log = createLogger({ route: `${req.method} ${pathname}`, requestId });

  try {
    if (pathname.startsWith('/api/')) {
      const blocked = rateLimit(req);
      if (blocked) return blocked;
    }

    if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
      const res = new NextResponse(null, { status: 204 });
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const res = NextResponse.next();
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.headers.set('Content-Security-Policy', CSP);

    if (pathname.startsWith('/api/')) {
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
    }

    if (pathname.startsWith('/admin/')) {
      const user = await getUserFromToken(req);
      if (!user || !(await isAdmin(user.id))) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (pathname.startsWith('/api/admin/')) {
      const user = await getUserFromToken(req);
      if (!user || !(await isAdmin(user.id))) {
        return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
      }
    }

    if (pathname.startsWith('/api/')) {
      return res;
    }

    if (PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      const user = await getUserFromToken(req);
      if (!user) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return res;
  } catch (e) {
    log.error('Middleware error:', e);
    throw e;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|logo.png|og.png|manifest|uploads|brand|banner|cases|prints|videos|openapi.json|site.webmanifest|_headers).*)'],
};
