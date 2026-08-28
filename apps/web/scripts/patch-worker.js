#!/usr/bin/env node
/**
 * Patch pós-build: adiciona handler `scheduled` no worker.js
 * pra Cloudflare Cron Triggers funcionarem.
 * Roda após `opennextjs-cloudflare build` e antes de `deploy`.
 */
const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '..', '.open-next', 'worker.js');
const workerCode = fs.readFileSync(workerPath, 'utf8');

if (workerCode.includes('async scheduled(')) {
  console.log('[patch-worker] Handler scheduled ja existe. Pulando.');
  process.exit(0);
}

const scheduledHandler = `
  async scheduled(event, env, ctx) {
    console.log('[cron] scheduled handler fired', event.cron);
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
            const resp = await fetch(url);
            const text = await resp.text();
            console.log('[cron] ' + route + ' -> ' + resp.status + ': ' + text.substring(0, 200));
          } catch (e) {
            console.error('[cron] Erro em ' + route + ':', e.message);
          }
        }
      })()
    );
  },
`;

// Inserir antes do fechamento do export default
const patched = workerCode.replace(
  'export default {',
  'export default {' + scheduledHandler
);

fs.writeFileSync(workerPath, patched, 'utf8');
console.log('[patch-worker] Handler scheduled adicionado com sucesso.');
