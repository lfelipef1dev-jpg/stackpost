const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres:BrUphiStackPost2026%21@db.aaynzvvoeufunbpzblwa.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await c.connect();

  console.log('=== AUDITORIA PROFUNDA — BANCO STACKPOST ===\n');

  // 1. Schemas
  const schemas = await c.query(`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast','pg_temp_1','pg_toast_temp_1')
    ORDER BY schema_name;
  `);
  console.log('1. SCHEMAS:');
  schemas.rows.forEach(r => console.log('  - ' + r.schema_name));

  // 2. Tabelas por schema
  const tables = await c.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog','information_schema')
    AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `);
  console.log('\n2. TABELAS POR SCHEMA:');
  tables.rows.forEach(r => console.log('  - ' + r.table_schema + '.' + r.table_table_name));

  // 3. Buscar referencias a SEEDS, NEXUS, seeds, nexus
  console.log('\n3. BUSCA POR REFERENCIAS SEEDS/NEXUS:');
  const searchTerms = ['seeds', 'nexus', 'phhurravjunielzxatxe', 'hfwiyxmezjfokescnzih'];

  // em tabelas
  for (const term of searchTerms) {
    const tableSearch = await c.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%' || $1 || '%';
    `, [term]);
    if (tableSearch.rows.length > 0) {
      console.log('  TABELAS com "' + term + '":');
      tableSearch.rows.forEach(r => console.log('    ! ' + r.table_schema + '.' + r.table_name));
    }
  }

  // em colunas
  for (const term of searchTerms) {
    const colSearch = await c.query(`
      SELECT table_schema, table_name, column_name
      FROM information_schema.columns 
      WHERE column_name ILIKE '%' || $1 || '%';
    `, [term]);
    if (colSearch.rows.length > 0) {
      console.log('  COLUNAS com "' + term + '":');
      colSearch.rows.forEach(r => console.log('    ! ' + r.table_schema + '.' + r.table_name + '.' + r.column_name));
    }
  }

  // em constraints
  for (const term of searchTerms) {
    const conSearch = await c.query(`
      SELECT conname, contype, conrelid::regclass::text as table_name
      FROM pg_constraint
      WHERE conname ILIKE '%' || $1 || '%';
    `, [term]);
    if (conSearch.rows.length > 0) {
      console.log('  CONSTRAINTS com "' + term + '":');
      conSearch.rows.forEach(r => console.log('    ! ' + r.conname + ' (' + r.contype + ') em ' + r.table_name));
    }
  }

  // 4. Funcoes
  const funcs = await c.query(`
    SELECT n.nspname as schema, p.proname as name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog','information_schema')
    ORDER BY n.nspname, p.proname;
  `);
  console.log('\n4. FUNCOES (' + funcs.rows.length + '):');
  funcs.rows.forEach(r => console.log('  - ' + r.schema + '.' + r.name));

  // 5. Triggers
  const triggers = await c.query(`
    SELECT trigger_name, event_object_table, action_statement
    FROM information_schema.triggers
    ORDER BY trigger_name;
  `);
  console.log('\n5. TRIGGERS (' + triggers.rows.length + '):');
  triggers.rows.forEach(r => console.log('  - ' + r.trigger_name + ' em ' + r.event_object_table));

  // 6. RLS Policies
  const policies = await c.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd
    FROM pg_policies
    ORDER BY schemaname, tablename, policyname;
  `);
  console.log('\n6. RLS POLICIES (' + policies.rows.length + '):');
  policies.rows.forEach(r => console.log('  - ' + r.schemaname + '.' + r.tablename + ' -> ' + r.policyname + ' [' + r.cmd + ']'));

  // 7. Extensions
  const ext = await c.query(`SELECT extname FROM pg_extension ORDER BY extname;`);
  console.log('\n7. EXTENSOES:');
  ext.rows.forEach(r => console.log('  - ' + r.extname));

  // 8. Roles/users
  const roles = await c.query(`SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg_%' ORDER BY rolname;`);
  console.log('\n8. ROLES:');
  roles.rows.forEach(r => console.log('  - ' + r.rolname));

  // 9. Verificar tabela api_keys se tem alguma key vencida/invalida
  try {
    const apiKeys = await c.query('SELECT id, name, created_at FROM api_keys ORDER BY id;');
    console.log('\n9. API_KEYS (' + apiKeys.rows.length + '):');
    apiKeys.rows.forEach(r => console.log('  - ' + r.id + ' | ' + (r.name || '-') + ' | ' + r.created_at));
  } catch(e) {
    console.log('\n9. API_KEYS: erro ou vazia');
  }

  // 10. Verificar users do auth
  const users = await c.query(`
    SELECT id, email, created_at, last_sign_in_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 20;
  `);
  console.log('\n10. USERS AUTH (' + users.rows.length + ' amostrados):');
  users.rows.forEach(r => console.log('  - ' + r.id + ' | ' + (r.email || '-') + ' | ' + (r.last_sign_in_at || 'nunca')));

  await c.end();
})().catch(e => console.error('ERRO:', e.message));
