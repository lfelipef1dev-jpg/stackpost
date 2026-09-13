import { NextResponse } from 'next/server';

// Keep-alive: qualquer request a rota dinamica forca a avaliacao do bundle
// do servidor no isolate — usado pelo cron de 1 minuto para manter o
// worker quente e reduzir cold start em requests reais.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ ok: true });
}
