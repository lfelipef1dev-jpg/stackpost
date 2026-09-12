// Custom Worker - adiciona handler scheduled para Cloudflare Cron Triggers
// Segue padrao oficial: https://opennext.js.org/cloudflare/howtos/custom-worker
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";
import { createLogger } from "./src/lib/logger";

// Mapeia cada expressao de cron para as rotas que ela deve executar.
// Antes: TODOS os triggers executavam as mesmas 2 rotas via HTTP publico,
// o que consumia CPU/subrequests em excesso e contribuia para Error 1102.
const CRON_ROUTES: Record<string, string[]> = {
  // A cada 5 minutos: publicacao de posts agendados + retry de webhooks
  "*/5 * * * *": ["/api/cron/publish-scheduled", "/api/cron/webhook-retry"],
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
    if (routes.length === 0) {
      // Trigger "* * * * *": keep-alive. Um fetch interno leve mantem o isolate
      // (e o handler OpenNext) aquecido, evitando cold-start em requests reais —
      // o cold start + CPU de request era o gatilho residual do Error 1102.
      ctx.waitUntil(
        handler
          // @ts-ignore - signature interna do OpenNext
          .fetch(new Request("https://worker.internal/robots.txt"), env, ctx)
          .then((r: any) => r.body?.cancel())
          .catch(() => {})
      );
      return;
    }

    // Secret de cron: CRON_SECRET > SUPABASE_SERVICE_ROLE_KEY (fail-closed nas rotas)
    const cronSecret = env.CRON_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!cronSecret) {
      const log = createLogger({ route: `cron:${cronKey}` });
      log.error('Nenhum secret de cron disponivel; cron abortado');
      return;
    }

    const log = createLogger({ route: `cron:${cronKey}` });

    ctx.waitUntil(
      (async () => {
        try {
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
              if (resp.status >= 400) {
                log.warn(`Cron ${route} retornou ${resp.status}`);
              } else {
                log.info(`Cron ${route} -> ${resp.status}`);
              }
            } catch (err) {
              log.error(`Erro no cron ${route}`, err);
            }
          }
        } catch (e) {
          log.error('Erro geral no cron', e);
        }
      })()
    );
  },
};

// Re-export Durable Objects (necessario para cache do OpenNext)
// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
