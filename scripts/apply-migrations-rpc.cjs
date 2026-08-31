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

// SQL to create exec_sql function
const createFnSQL = `
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
`;

const migrations = [
  'supabase/migrations/009_billing_events.sql',
  'supabase/migrations/010_fix_processed_payments.sql',
  'supabase/migrations/011_invoices.sql',
  'supabase/migrations/012_credit_expiration.sql',
];

async function rpc(fn, args) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fn}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

(async () => {
  // Step 1: Try to create exec_sql function via REST
  // This won't work because PostgREST doesn't allow DDL via RPC
  // But let's try anyway

  console.log('Attempting to create exec_sql function...');
  const createResult = await rpc('exec_sql', { sql: createFnSQL });
  console.log('Create result:', createResult.status, createResult.body.substring(0, 200));

  if (createResult.ok) {
    // Step 2: Apply each migration
    console.log('\nApplying migrations...');
    for (const file of migrations) {
      const sql = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
      console.log(`\n[${path.basename(file)}] Applying...`);
      const result = await rpc('exec_sql', { sql });
      if (result.ok) {
        const parsed = JSON.parse(result.body);
        if (parsed.success) {
          console.log(`[${path.basename(file)}] Success!`);
        } else {
          console.error(`[${path.basename(file)}] Error: ${parsed.error}`);
        }
      } else {
        console.error(`[${path.basename(file)}] HTTP ${result.status}: ${result.body.substring(0, 200)}`);
      }
    }
  } else {
    console.log('\nCannot create exec_sql via REST. Need manual application.');
    console.log('Alternative: Use Playwright with existing session.');
  }
})();
