#!/usr/bin/env node
/**
 * Backup das 3 tabelas que serão alteradas pelas migrations 010 e 012.
 * As migrations 009 e 011 criam tabelas novas (sem risco).
 * Roda via REST API com service role key.
 */
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Ler .env.local
const envPath = join(process.cwd(), 'apps', 'web', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const tables = [
  'stackpost_processed_payments',
  'credit_transactions',
  'x_credit_balances',
];

const backupDir = join(process.cwd(), 'scripts', 'backups');
import { mkdirSync } from 'fs';
mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

for (const table of tables) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });
    if (!res.ok) {
      console.error(`[${table}] HTTP ${res.status}: ${await res.text()}`);
      continue;
    }
    const data = await res.json();
    const backupPath = join(backupDir, `${table}_${timestamp}.json`);
    writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`[${table}] Backup: ${data.length} rows -> ${backupPath}`);
  } catch (err) {
    console.error(`[${table}] Error: ${err.message}`);
  }
}

console.log('\nBackup concluído.');
