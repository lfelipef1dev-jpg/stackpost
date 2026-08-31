import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getUserFromToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const PUBLIC_PATHS = ['/', '/login', '/register', '/plans', '/about', '/features', '/pricing', '/contact', '/blog', '/docs', '/privacy', '/terms', '/status', '/changelog', '/partners', '/comparisons', '/glossary', '/brand-kit', '/platforms', '/onboarding', '/compare', '/roadmap', '/demo', '/build-vs-buy', '/migrate', '/security', '/ai-agents', '/for-saas', '/for-agencies', '/for-enterprise'];
const STATIC_PATHS = ['/_next', '/static', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/icon.png', '/logo.png', '/og.png', '/manifest', '/uploads', '/brand', '/banner', '/cases', '/prints', '/videos', '/openapi.json', '/site.webmanifest', '/_headers'];

function isPublic(path: string): boolean {
  if (STATIC_PATHS.some((p) => path.startsWith(p))) return true;
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return true;
  if (path.startsWith('/api/auth/')) return true;
  if (path.startsWith('/api/pagamentos/webhook')) return true;
  // Paginas publicas de marketing/SEO (terminadas em -api ou -alternative)
  if (/-api$/.test(path) || /-alternative$/.test(path)) return true;
  // Paginas de migracao
  if (path.startsWith('/migrate-from-')) return true;
  // Paginas SEO com sufixo -for-*
  if (/-api-for-/.test(path)) return true;
  return false;
}

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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' https: data: blob:; " +
  "connect-src 'self'; " +
  "font-src 'self'; " +
  "frame-ancestors https://expostacker.com.br https://*.expostacker.com.br http://localhost:* http://127.0.0.1:*; " +
  "base-uri 'self'; " +
  "form-action 'self';";

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

  if (!isPublic(pathname)) {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|logo.png|og.png|manifest|uploads|brand|banner|cases|prints|videos|openapi.json|site.webmanifest|_headers).*)'],
};
