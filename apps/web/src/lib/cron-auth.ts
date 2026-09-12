import { NextRequest, NextResponse } from 'next/server';

/**
 * Autenticação de rotas de cron — fail-closed.
 *
 * Antes: `if (cronSecret && authHeader !== ...)` — quando CRON_SECRET não estava
 * configurado no Worker, QUALQUER chamada pública executava o cron (fail-open).
 * Agora: sem secret configurado ou sem Bearer válido => 401.
 *
 * Ordem de aceitação do secret: CRON_SECRET > SUPABASE_SERVICE_ROLE_KEY.
 * O fallback existe porque o SUPABASE_SERVICE_ROLE_KEY já está garantidamente
 * configurado em runtime (o app não funciona sem ele), enquanto CRON_SECRET
 * pode não ter sido provisionado como secret do Worker.
 */
export function getCronSecret(env?: Record<string, string | undefined>): string | null {
  const e = env || (process.env as Record<string, string | undefined>);
  return e.CRON_SECRET || e.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function isCronAuthorized(req: NextRequest): boolean {
  const secret = getCronSecret();
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export function requireCronAuth(req: NextRequest): NextResponse | null {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  return null;
}
