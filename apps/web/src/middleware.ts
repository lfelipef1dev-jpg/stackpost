import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export function middleware(req: NextRequest) {
  // Rate limiting apenas em rotas /api/
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const blocked = rateLimit(req);
    if (blocked) return blocked;
  }

  // CORS para rotas /api/
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 });
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-idempotency-key, x-webhook-signature');
      res.headers.set('Access-Control-Max-Age', '86400');
      return res;
    }
  }

  // Security headers para todas as rotas
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS headers nas respostas de API
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-idempotency-key, x-webhook-signature');
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|logo.png|og.png|manifest|uploads).*)'],
};
