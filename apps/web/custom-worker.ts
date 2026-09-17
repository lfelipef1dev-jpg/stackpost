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
    "/api/cron/health-check",
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
      // Trigger "* * * * *": keep-alive. Antes batia em /robots.txt (asset
      // estatico) — com cache interception isso nem chega no bundle do
      // servidor (~15MB). /api/ping e rota dinamica: forca a avaliacao do
      // handler.mjs e mantem o isolate quente de verdade.
      ctx.waitUntil(
        handler
          // @ts-ignore - signature interna do OpenNext
          .fetch(new Request("https://worker.internal/api/ping"), env, ctx)
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
              // publish-scheduled: cada post vai pra FILA (Cloudflare Queues).
              // O consumer processa 1 mensagem por invocacao = 50 subrequests
              // proprios por post — um video nas 5 redes cabe tranquilo.
              if (route === '/api/cron/publish-scheduled') {
                const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL;
                const supaKey = env.SUPABASE_SERVICE_ROLE_KEY;
                if (supaUrl && supaKey && env.PUBLISH_QUEUE) {
                  const res = await fetch(
                    `${supaUrl}/rest/v1/posts?select=id&status=eq.scheduled&scheduled_at=lte.${new Date().toISOString()}&order=scheduled_at.asc&limit=30`,
                    { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
                  );
                  const due: any[] = await res.json().catch(() => []);
                  if (Array.isArray(due) && due.length) {
                    await env.PUBLISH_QUEUE.sendBatch(due.map((p: any) => ({ body: p.id })));
                    log.info(`publish-scheduled: ${due.length} posts enfileirados`);
                  } else {
                    log.info('publish-scheduled: fila vazia');
                  }
                }
                continue;
              }
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

  // Consumer da fila de publicacao: 1 mensagem = 1 invocacao = 50 subrequests
  // proprios. max_batch_size=1 garante isolamento total por post.
  // @ts-ignore
  async queue(batch: any, env: any, ctx: any) {
    const cronSecret = env.CRON_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;
    const log = createLogger({ route: 'queue:publish' });
    for (const msg of batch.messages) {
      try {
        const postId = msg.body;
        const req = new Request(`https://worker.internal/api/cron/publish-scheduled?postId=${postId}`, {
          headers: { Authorization: `Bearer ${cronSecret}` },
        });
        // @ts-ignore
        const resp = await handler.fetch(req, env, ctx);
        await resp.body?.cancel();
        log.info(`post ${postId} -> ${resp.status}`);
        msg.ack();
      } catch (err) {
        log.error('falha ao publicar mensagem da fila', err);
        msg.retry(); // queue faz retry (max_retries: 2)
      }
    }
  },
};

// Re-export Durable Objects (necessario para cache do OpenNext)
// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
