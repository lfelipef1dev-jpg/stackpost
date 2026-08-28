// Custom Worker - adiciona handler scheduled para Cloudflare Cron Triggers
// Segue padrao oficial: https://opennext.js.org/cloudflare/howtos/custom-worker
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  // @ts-ignore - tipos do Cloudflare nao disponiveis no build do Next
  async scheduled(event: any, env: any, ctx: any) {
    console.log('[cron] scheduled handler fired', event.cron);
    const cronSecret = env.CRON_SECRET || 'B9A54177BCB6F7215D4D4356E6F9D060';
    ctx.waitUntil(
      (async () => {
        const routes = [
          '/api/cron/publish-scheduled',
          '/api/cron/refresh-tokens',
        ];
        for (const route of routes) {
          try {
            const url = 'https://stackpost.expostacker.com.br' + route;
            console.log('[cron] Fetching', url);
            const resp = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${cronSecret}`,
              },
            });
            const text = await resp.text();
            console.log('[cron] ' + route + ' -> ' + resp.status + ': ' + text.substring(0, 200));
          } catch (e: any) {
            console.error('[cron] Erro em ' + route + ':', e.message);
          }
        }
      })()
    );
  },
};

// Re-export Durable Objects (necessario para cache do OpenNext)
// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
