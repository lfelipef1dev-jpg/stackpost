const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres:BrUphiStackPost2026%21@db.aaynzvvoeufunbpzblwa.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await c.connect();

  // 1. Listar todas as tabelas
  const tables = await c.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  console.log('=== TABELAS NO BANCO STACKPOST ===');
  tables.rows.forEach(r => console.log('  ' + r.tablename));
  console.log('Total: ' + tables.rows.length + ' tabelas');

  // 2. Verificar RLS nas tabelas de billing
  const rls = await c.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('billing_events', 'invoices', 'stackpost_processed_payments', 'credit_transactions', 'x_credit_balances')
    ORDER BY tablename;
  `);
  console.log('\n=== RLS NAS TABELAS DE BILLING ===');
  rls.rows.forEach(r => console.log('  ' + r.tablename + ': RLS=' + (r.rowsecurity ? 'ON' : 'OFF')));

  // 3. Verificar colunas novas em processed_payments
  const cols = await c.query(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'stackpost_processed_payments'
    AND column_name IN ('amount_cents', 'currency', 'status', 'refund_amount_cents', 'gateway_raw')
    ORDER BY column_name;
  `);
  console.log('\n=== COLUNAS NOVAS EM processed_payments ===');
  cols.rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ') default=' + (r.column_default || 'none')));

  // 4. Verificar colunas em credit_transactions
  const cols2 = await c.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'credit_transactions'
    AND column_name IN ('expires_at', 'expired_at')
    ORDER BY column_name;
  `);
  console.log('\n=== COLUNAS NOVAS EM credit_transactions ===');
  cols2.rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ')'));

  // 5. Verificar estrutura de billing_events
  const beCols = await c.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'billing_events'
    ORDER BY ordinal_position;
  `);
  console.log('\n=== ESTRUTURA DE billing_events ===');
  beCols.rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ')'));

  // 6. Verificar estrutura de invoices
  const invCols = await c.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'invoices'
    ORDER BY ordinal_position;
  `);
  console.log('\n=== ESTRUTURA DE invoices ===');
  invCols.rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ')'));

  // 7. Contar registros
  const counts = await c.query(`
    SELECT 
      (SELECT count(*) FROM billing_events) as billing_events,
      (SELECT count(*) FROM invoices) as invoices,
      (SELECT count(*) FROM stackpost_processed_payments) as payments,
      (SELECT count(*) FROM credit_transactions) as credits,
      (SELECT count(*) FROM subscriptions) as subs,
      (SELECT count(*) FROM plans) as plans,
      (SELECT count(*) FROM organizations) as orgs,
      (SELECT count(*) FROM teams) as teams,
      (SELECT count(*) FROM users) as users
  `);
  console.log('\n=== CONTAGEM DE REGISTROS ===');
  const cnt = counts.rows[0];
  Object.keys(cnt).forEach(k => console.log('  ' + k + ': ' + cnt[k]));

  await c.end();
})().catch(e => console.error('ERRO:', e.message));
