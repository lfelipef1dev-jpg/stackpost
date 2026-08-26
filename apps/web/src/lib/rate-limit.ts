import { NextRequest, NextResponse } from 'next/server';

// Rate limiting 3 camadas: 100/1s, 500/10s, 2000/60s
// Em producao: usar Cloudflare KV ou Durable Objects
// Em dev: usar Map em memoria (reset ao reiniciar)

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, { s1: RateBucket; s10: RateBucket; s60: RateBucket }>();

const LIMITS = {
  s1: { max: 100, window: 1000 },
  s10: { max: 500, window: 10000 },
  s60: { max: 2000, window: 60000 },
};

function getBucket(key: string) {
  if (!buckets.has(key)) {
    buckets.set(key, {
      s1: { count: 0, resetAt: Date.now() + LIMITS.s1.window },
      s10: { count: 0, resetAt: Date.now() + LIMITS.s10.window },
      s60: { count: 0, resetAt: Date.now() + LIMITS.s60.window },
    });
  }
  return buckets.get(key)!;
}

function checkBucket(bucket: RateBucket, max: number, window: number): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + window;
  }
  bucket.count++;
  if (bucket.count > max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: max - bucket.count, retryAfter: 0 };
}

export function rateLimit(req: NextRequest): NextResponse | null {
  // Pular para rotas publicas e static
  const path = new URL(req.url).pathname;
  if (path.startsWith('/_next') || path.startsWith('/uploads') || path === '/robots.txt' || path === '/sitemap.xml') {
    return null;
  }

  // Identificar por IP ou API key
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const apiKey = req.headers.get('x-api-key') || '';
  const key = apiKey ? `key:${apiKey}` : `ip:${ip}`;

  const bucket = getBucket(key);
  const now = Date.now();

  // Resetar buckets expirados
  for (const tier of ['s1', 's10', 's60'] as const) {
    if (now > bucket[tier].resetAt) {
      bucket[tier].count = 0;
      bucket[tier].resetAt = now + LIMITS[tier].window;
    }
  }

  // Verificar 3 camadas
  const checks = [
    checkBucket(bucket.s1, LIMITS.s1.max, LIMITS.s1.window),
    checkBucket(bucket.s10, LIMITS.s10.max, LIMITS.s10.window),
    checkBucket(bucket.s60, LIMITS.s60.max, LIMITS.s60.window),
  ];

  const blocked = checks.find((c) => !c.allowed);
  if (blocked) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        retryAfter: blocked.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(blocked.retryAfter),
          'X-RateLimit-Limit': String(LIMITS.s1.max),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}

export function getRateLimitHeaders(req: NextRequest): Record<string, string> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const apiKey = req.headers.get('x-api-key') || '';
  const key = apiKey ? `key:${apiKey}` : `ip:${ip}`;
  const bucket = getBucket(key);
  return {
    'X-RateLimit-Limit': String(LIMITS.s1.max),
    'X-RateLimit-Remaining': String(Math.max(0, LIMITS.s1.max - bucket.s1.count)),
  };
}
