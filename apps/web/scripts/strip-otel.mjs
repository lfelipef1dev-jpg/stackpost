#!/usr/bin/env node
// Remove @opentelemetry/api do bundle do Worker para reduzir memoria.
// O OpenTelemetry e incluido pelo Next.js mas nao e usado em runtime
// (nao ha instrumentation.ts no projeto). Isso reduz o handler.mjs de
// ~3.18 MB para ~1.23 MB, evitando Error 1102 (exceededResources).

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const handlerPath = join(process.cwd(), '.open-next', 'server-functions', 'default', 'apps', 'web', 'handler.mjs');

if (!existsSync(handlerPath)) {
  console.log('[strip-otel] handler.mjs not found, skipping.');
  process.exit(0);
}

const content = readFileSync(handlerPath, 'utf8');

// Procura pela seção do OpenTelemetry no bundle.
// O Next.js inclui @opentelemetry/api compilado em next/dist/compiled/@opentelemetry/api/index.js
const markers = [
  '.open-next/server-functions/default/node_modules/next/dist/compiled/@opentelemetry/api/index.js',
  'node_modules/next/dist/compiled/@opentelemetry/api/index.js',
  '@opentelemetry/api/index.js',
];

let startIdx = -1;
let usedMarker = '';
for (const marker of markers) {
  startIdx = content.indexOf(marker);
  if (startIdx !== -1) {
    usedMarker = marker;
    break;
  }
}

if (startIdx === -1) {
  console.log('[strip-otel] OpenTelemetry section not found, skipping.');
  process.exit(0);
}

// Encontra o inicio do modulo __commonJS que contem o OTel
const before = content.substring(0, startIdx);
const moduleStart = before.lastIndexOf('var require_');
if (moduleStart === -1) {
  console.log('[strip-otel] Could not find module start, skipping.');
  process.exit(0);
}

// Encontra o proximo modulo require_ apos o OTel
const after = content.substring(startIdx);
const nextModuleRel = after.indexOf('var require_', 100);
if (nextModuleRel === -1) {
  console.log('[strip-otel] Could not find next module, skipping.');
  process.exit(0);
}

const nextModule = startIdx + nextModuleRel;

// Remove a secao do OTel
const newContent = content.substring(0, moduleStart) + content.substring(nextModule);
const oldSize = content.length;
const newSize = newContent.length;
const saved = oldSize - newSize;

writeFileSync(handlerPath, newContent, 'utf8');

console.log(`[strip-otel] Removed ${Math.round(saved / 1024)} KB (${Math.round(saved / oldSize * 100)}%)`);
console.log(`[strip-otel] handler.mjs: ${Math.round(oldSize / 1024 / 1024 * 100) / 100} MB -> ${Math.round(newSize / 1024 / 1024 * 100) / 100} MB`);
