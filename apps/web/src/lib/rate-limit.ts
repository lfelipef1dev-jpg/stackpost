import { NextRequest, NextResponse } from 'next/server';

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket[]>();

const LIMITS = [
  { window: 1000, max: 100 },
  { window: 10000, max: 500 },
  { window: 60000, max: 2000 },
];

export function rateLimit(key: string): { allowed: boolean; headers: Record<string, string> } {
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry) {
    entry = LIMITS.map((l) => ({ count: 0, resetAt: now + l.window }));
    buckets.set(key, entry);
  }

  for (let i = 0; i < entry.length; i++) {
    if (now > entry[i].resetAt) {
      entry[i].count = 0;
      entry[i].resetAt = now + LIMITS[i].window;
    }
  }

  const allowed = entry.every((b, i) => b.count < LIMITS[i].max);

  if (allowed) {
    entry.forEach((b) => b.count++);
  }

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(LIMITS[2].max),
    'X-RateLimit-Remaining': String(Math.max(0, LIMITS[2].max - entry[2].count)),
    'X-RateLimit-Reset': String(entry[2].resetAt),
  };

  if (!allowed) {
    headers['Retry-After'] = String(Math.ceil((entry[0].resetAt - now) / 1000));
  }

  return { allowed, headers };
}

export function rateLimitMiddleware(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const apiKey = req.headers.get('x-api-key');
  const key = apiKey || ip;

  const { allowed, headers } = rateLimit(key);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers }
    );
  }

  return null;
}
