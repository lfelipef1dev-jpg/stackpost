const fs = require('fs');
const path = require('path');

// Ler o token do Supabase
const token = fs.readFileSync(path.join(__dirname, '..', 'scripts', '.token'), 'utf-8').trim();
const PROJECT_REF = 'aaynzvvoeufunbpzblwa';

const migrations = [
  'supabase/migrations/009_billing_events.sql',
  'supabase/migrations/010_fix_processed_payments.sql',
  'supabase/migrations/011_invoices.sql',
  'supabase/migrations/012_credit_expiration.sql',
];

async function applyMigration(file) {
  const sql = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
  const name = path.basename(file);
  console.log(`[${name}] Aplicando...`);

  // Supabase Management API: POST /v1/projects/{ref}/database/query
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    const text = await res.text();
    if (res.ok) {
      console.log(`[${name}] OK!`);
      return true;
    } else {
      console.error(`[${name}] HTTP ${res.status}: ${text.substring(0, 300)}`);
      return false;
    }
  } catch (err) {
    console.error(`[${name}] Error: ${err.message}`);
    return false;
  }
}

(async () => {
  console.log('Aplicando 4 migrations via Supabase Management API...\n');
  let ok = 0;
  for (const m of migrations) {
    if (await applyMigration(m)) ok++;
  }
  console.log(`\n${ok}/${migrations.length} migrations aplicadas.`);
})();
