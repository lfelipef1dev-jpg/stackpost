const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DB_PASSWORD = 'BrUphiStackPost2026!';
const DB_HOST = 'db.aaynzvvoeufunbpzblwa.supabase.co';
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
  const name = path.basename(file);
  console.log(`\n[${name}] Aplicando...`);

  const connStr = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:5432/postgres`;
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`[${name}] OK!`);
    return true;
  } catch (err) {
    const msg = err.message;
    // IF NOT EXISTS errors are OK
    if (msg.includes('already exists')) {
      console.log(`[${name}] Ja existia (OK)`);
      return true;
    }
    console.error(`[${name}] ERRO: ${msg.substring(0, 300)}`);
    return false;
  } finally {
    try { await client.end(); } catch {}
  }
}

(async () => {
  console.log('=== Aplicando 4 migrations do billing no StackPost ===');
  console.log(`Host: ${DB_HOST}`);
  console.log(`User: postgres`);

  let ok = 0;
  for (const m of migrations) {
    if (await applyMigration(m)) ok++;
  }

  console.log(`\n=== ${ok}/${migrations.length} migrations aplicadas ===`);

  // Verificar tabelas criadas
  console.log('\n=== Verificando schema ===');
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const r = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('billing_events', 'invoices')
      ORDER BY tablename;
    `);
    console.log('Tabelas billing criadas:', r.rows.map(row => row.tablename));

    const r2 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'stackpost_processed_payments'
      AND column_name IN ('amount_cents', 'currency', 'status', 'refund_amount_cents', 'gateway_raw')
      ORDER BY column_name;
    `);
    console.log('Colunas em processed_payments:', r2.rows.map(row => row.column_name));

    const r3 = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'credit_transactions'
      AND column_name IN ('expires_at', 'expired_at')
      ORDER BY column_name;
    `);
    console.log('Colunas em credit_transactions:', r3.rows.map(row => row.column_name));
  } catch (err) {
    console.error('Erro verificando schema:', err.message.substring(0, 200));
  } finally {
    try { await client.end(); } catch {}
  }
})();
