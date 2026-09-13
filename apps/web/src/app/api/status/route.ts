import { NextResponse } from 'next/server';
import { requireEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

type CheckResult = { name: string; ok: boolean; ms: number };

// Circuit breaker por isolate: apos 2 falhas consecutivas, o probe fica
// suspenso por 60s — evita que dependencia lenta/down degrade a pagina.
const circuits = new Map<string, { failures: number; openUntil: number }>();
const FAILURE_THRESHOLD = 2;
const COOLDOWN_MS = 60_000;

function circuitOpen(name: string): boolean {
  const c = circuits.get(name);
  return !!c && c.failures >= FAILURE_THRESHOLD && Date.now() < c.openUntil;
}

function record(name: string, ok: boolean) {
  const c = circuits.get(name) || { failures: 0, openUntil: 0 };
  if (ok) {
    circuits.set(name, { failures: 0, openUntil: 0 });
  } else {
    const failures = c.failures + 1;
    circuits.set(name, { failures, openUntil: failures >= FAILURE_THRESHOLD ? Date.now() + COOLDOWN_MS : 0 });
  }
}

// Check externo: qualquer resposta HTTP (mesmo 4xx) prova alcance/TLS.
async function probe(url: string, timeoutMs = 3500): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now();
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    await fetch(url, { method: 'HEAD', signal: ctl.signal, redirect: 'follow' });
    clearTimeout(t);
    return { ok: true, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}

async function probeDb(timeoutMs = 4000): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now();
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(`${requireEnv('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/plans?select=id&limit=1`, {
      headers: { apikey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${requireEnv('SUPABASE_SERVICE_ROLE_KEY')}` },
      signal: ctl.signal,
    });
    clearTimeout(t);
    return { ok: res.ok, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}

async function guarded(name: string, fn: () => Promise<{ ok: boolean; ms: number }>): Promise<{ ok: boolean; ms: number }> {
  if (circuitOpen(name)) return { ok: false, ms: -1 };
  const r = await fn();
  record(name, r.ok);
  return r;
}

export async function GET() {
  const [db, instagram, linkedin, mercadopago, tiktok] = await Promise.all([
    guarded('database', probeDb),
    guarded('instagram', () => probe('https://graph.facebook.com')),
    guarded('linkedin', () => probe('https://api.linkedin.com')),
    guarded('pagamentos', () => probe('https://api.mercadopago.com')),
    guarded('tiktok', () => probe('https://open.tiktokapis.com')),
  ]);

  const checks: CheckResult[] = [
    { name: 'api', ok: true, ms: 0 },
    { name: 'database', ok: db.ok, ms: db.ms },
    { name: 'instagram', ok: instagram.ok, ms: instagram.ms },
    { name: 'linkedin', ok: linkedin.ok, ms: linkedin.ms },
    { name: 'tiktok', ok: tiktok.ok, ms: tiktok.ms },
    { name: 'pagamentos', ok: mercadopago.ok, ms: mercadopago.ms },
  ];

  const allOk = checks.every((c) => c.ok);

  return NextResponse.json(
    { status: allOk ? 'operational' : 'degraded', checked_at: new Date().toISOString(), checks },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  );
}
