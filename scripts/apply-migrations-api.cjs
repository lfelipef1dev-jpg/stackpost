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

// Supabase SQL endpoint via REST
const SQL_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

// Alternative: use pg REST endpoint
// Actually Supabase doesn't expose a raw SQL RPC by default.
// We need to use the /pg endpoint or the management API.
// Let's use the query endpoint via PostgREST with a custom RPC.

// Actually, the simplest way is to use Supabase's SQL via the REST API
// using the /rest/v1 endpoint with the sql function.
// But we don't have an exec_sql function. Let's try the management API.

// Better approach: use the Supabase Management API
// POST https://api.supabase.com/v1/projects/{ref}/database/query
// This requires a personal access token, not the service role key.

// Alternative: use the database connection string directly with pg
// But we don't have pg installed and no direct DB access.

// Let's try using the Supabase SQL via the REST API with service role
// We can create a temporary function and call it, or use the /pg endpoint

// Actually, the best approach for applying migrations is to use
// the Supabase Management API with a personal access token.
// But we can also try the direct Postgres connection via the pooler.

// Let's try the simplest: use fetch to the Supabase SQL endpoint
const PROJECT_REF = 'aaynzvvoeufunbpzblwa';

const migrations = [
  'supabase/migrations/009_billing_events.sql',
  'supabase/migrations/010_fix_processed_payments.sql',
  'supabase/migrations/011_invoices.sql',
  'supabase/migrations/012_credit_expiration.sql',
];

async function applyMigration(file) {
  const sqlPath = path.join(__dirname, '..', file);
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Try Supabase REST API - execute SQL via the query endpoint
  // The /rest/v1/rpc doesn't work for raw SQL, but we can try the /pg endpoint
  // or use the management API

  // Method: Use the Supabase database query API
  // POST https://api.supabase.com/v1/projects/{ref}/database/query
  // This needs a personal access token

  // Alternative: Use the PostgREST with a custom function
  // We can create the function first, then call it

  // Actually, let's try using the supabase-js client's from() with a raw query
  // No, that doesn't work either.

  // Best approach: Use the Supabase Management API
  // But we need a personal access token for that.

  // Let's try the direct approach: use the database URL
  // POST to the Supabase SQL endpoint

  console.log(`[${path.basename(file)}] Applying...`);

  // Try using the /rest/v1 endpoint with the sql as a body
  // This won't work for DDL statements.

  // Let's try the Supabase database query endpoint
  const managementUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  try {
    const res = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (res.ok) {
      const result = await res.text();
      console.log(`[${path.basename(file)}] Success!`);
      return true;
    } else {
      const err = await res.text();
      console.error(`[${path.basename(file)}] HTTP ${res.status}: ${err.substring(0, 200)}`);
      return false;
    }
  } catch (err) {
    console.error(`[${path.basename(file)}] Error: ${err.message}`);
    return false;
  }
}

(async () => {
  console.log('Applying 4 billing migrations via Supabase Management API...\n');

  let success = 0;
  for (const migration of migrations) {
    const ok = await applyMigration(migration);
    if (ok) success++;
  }

  console.log(`\n${success}/${migrations.length} migrations applied.`);
})();
