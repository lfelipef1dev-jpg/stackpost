// Custom Worker - adiciona handler scheduled para Cloudflare Cron Triggers
// Segue padrao oficial: https://opennext.js.org/cloudflare/howtos/custom-worker
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

// Mapeia cada expressao de cron para as rotas que ela deve executar.
// Antes: TODOS os triggers executavam as mesmas 2 rotas via HTTP publico,
// o que consumia CPU/subrequests em excesso e contribuia para Error 1102.
const CRON_ROUTES: Record<string, string[]> = {
  // A cada minuto: apenas publicacao de posts agendados
  "* * * * *": ["/api/cron/publish-scheduled"],
  // A cada 5 minutos: retry de webhooks + health-check leve
  "*/5 * * * *": ["/api/cron/webhook-retry", "/api/cron/health-check"],
  // A cada hora: renovacao de tokens + manutencao de conexoes
  "0 * * * *": [
    "/api/cron/refresh-tokens",
    "/api/cron/auto-reconnect",
    "/api/cron/auto-disable-webhooks",
  ],
  // Diario 03:00 UTC: limpeza, analytics, billing
  "0 3 * * *": [
    "/api/cron/cleanup-uploads",
    "/api/cron/sync-analytics",
    "/api/cron/credit-expiration",
    "/api/cron/dunning",
    "/api/cron/billing-renewal",
    "/api/cron/best-time-ml",
    "/api/cron/import-history",
  ],
  // Mensal: reset de uso
  "0 0 1 * *": ["/api/cron/monthly-usage-reset"],
};

export default {
  fetch: handler.fetch,

  // @ts-ignore - tipos do Cloudflare nao disponiveis no build do Next
  async scheduled(event: any, env: any, ctx: any) {
    const cronKey: string = event.cron || "";
    const routes = CRON_ROUTES[cronKey] || [];
    console.log(`[cron] scheduled fired: ${cronKey} -> ${routes.length} rotas`);
    if (routes.length === 0) return;

    const cronSecret = env.CRON_SECRET || 'B9A54177BCB6F7215D4D4356E6F9D060';
    ctx.waitUntil(
      (async () => {
        for (const route of routes) {
          try {
            // Fetch interno direto no handler: evita subrequest externo
            // e o round-trip completo de middleware/CORS/TLS do dominio publico.
            const req = new Request(`https://worker.internal${route}`, {
              headers: { Authorization: `Bearer ${cronSecret}` },
            });
            // @ts-ignore - signature interna do OpenNext
            const resp = await handler.fetch(req, env, ctx);
            await resp.body?.cancel();
            console.log(`[cron] ${route} -> ${resp.status}`);
          } catch (e: any) {
            console.error(`[cron] Erro em ${route}:`, e?.message ?? e);
          }
        }
      })()
    );
  },
};

// Re-export Durable Objects (necessario para cache do OpenNext)
// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
