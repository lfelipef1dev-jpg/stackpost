import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export function middleware(req: NextRequest) {
  // Rate limiting apenas em rotas /api/
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const blocked = rateLimit(req);
    if (blocked) return blocked;
  }

  // Security headers para todas as rotas
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.svg|opengraph-image|twitter-image|manifest|uploads).*)'],
};
