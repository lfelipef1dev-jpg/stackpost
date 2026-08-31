const { Client } = require('pg');

const client = new Client({
  host: 'db.aaynzvvoeufunbpzblwa.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'BrUphiStackPost2026!',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();

  const queries = {
    tabelas: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
    sem_rls: `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = false ORDER BY c.relname`,
    policies: `SELECT schemaname, tablename, count(*) FROM pg_policies WHERE schemaname = 'public' GROUP BY schemaname, tablename ORDER BY tablename`,
    fks: `SELECT conrelid::regclass AS table_name, a.attname AS column_name, confrelid::regclass AS foreign_table, af.attname AS foreign_column FROM pg_constraint c JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid WHERE c.contype = 'f' AND c.connamespace = 'public'::regnamespace ORDER BY conrelid::regclass::text`,
    contagem: `SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY n_live_tup DESC`,
    columnas_billing: `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('billing_events','invoices','stackpost_processed_payments','x_credit_balances','credit_transactions') ORDER BY table_name, ordinal_position`,
  };

  for (const [name, sql] of Object.entries(queries)) {
    try {
      const res = await client.query(sql);
      console.log('\n### ' + name + ' ###');
      console.log(JSON.stringify(res.rows, null, 2).substring(0, 3000));
    } catch (e) {
      console.log('\n### ' + name + ' ERROR ###');
      console.log(e.message);
    }
  }

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
