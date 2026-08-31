#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'apps', 'web', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const tables = ['stackpost_processed_payments', 'credit_transactions', 'x_credit_balances'];
const backupDir = path.join(__dirname, 'backups');
fs.mkdirSync(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

(async () => {
  for (const table of tables) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
      const res = await fetch(url, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      if (!res.ok) {
        console.error(`[${table}] HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const backupPath = path.join(backupDir, `${table}_${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      console.log(`[${table}] Backup: ${data.length} rows -> ${backupPath}`);
    } catch (err) {
      console.error(`[${table}] Error: ${err.message}`);
    }
  }
  console.log('Backup concluido.');
})();
