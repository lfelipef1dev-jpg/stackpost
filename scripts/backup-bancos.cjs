const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const projects = [
  {
    name: 'StackPost',
    ref: 'aaynzvvoeufunbpzblwa',
    host: 'db.aaynzvvoeufunbpzblwa.supabase.co',
    password: 'BrUphiStackPost2026!',
  },
  {
    name: 'Nexus',
    ref: 'hfwiyxmezjfokescnzih',
    host: 'db.hfwiyxmezjfokescnzih.supabase.co',
    password: 'BrUphiNexus2026!',
  },
];

async function backupProject(p) {
  console.log(`\n=== BACKUP DE ${p.name} ===`);
  const backupDir = path.join(__dirname, '..', 'backups', p.name.toLowerCase() + '_' + new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(backupDir, { recursive: true });

  const connStr = `postgresql://postgres:${encodeURIComponent(p.password)}@${p.host}:5432/postgres`;
  const c = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

  try {
    await c.connect();

    // 1. Schema (CREATE TABLE, CREATE INDEX, etc)
    const schemaQuery = await c.query(`
      SELECT 
        table_schema,
        table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    let schemaSql = `\n-- Backup schema ${p.name} - ${new Date().toISOString()}\n\n`;

    for (const t of schemaQuery.rows) {
      const { table_name } = t;
      const create = await c.query(`
        SELECT pg_get_tabledef('public', $1, true) as def;
      `, [table_name]).catch(async () => {
        // Fallback: get create table script
        const ddl = await c.query(`
          SELECT 
            'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
            string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) ||
            ');' as def
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          GROUP BY table_name;
        `, [table_name]);
        return ddl;
      });
      if (create.rows[0]?.def) {
        schemaSql += create.rows[0].def + '\n\n';
      }
    }

    fs.writeFileSync(path.join(backupDir, 'schema.sql'), schemaSql);
    console.log(`Schema salvo: ${path.join(backupDir, 'schema.sql')}`);

    // 2. Dados de cada tabela
    for (const t of schemaQuery.rows) {
      const { table_name } = t;
      try {
        const count = await c.query(`SELECT count(*) FROM "${table_name}"`);
        console.log(`  - ${table_name}: ${count.rows[0].count} rows`);

        const data = await c.query(`SELECT * FROM "${table_name}" LIMIT 100000`);
        const file = path.join(backupDir, `${table_name}.json`);
        fs.writeFileSync(file, JSON.stringify(data.rows, null, 2));
      } catch (err) {
        console.log(`  ! ERRO em ${table_name}: ${err.message}`);
      }
    }

    // 3. Policies
    const policies = await c.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    fs.writeFileSync(path.join(backupDir, 'policies.json'), JSON.stringify(policies.rows, null, 2));

    console.log(`Backup de ${p.name} salvo em: ${backupDir}`);

    await c.end();
  } catch (e) {
    console.log(`ERRO no backup de ${p.name}: ${e.message}`);
    try { await c.end(); } catch {}
  }
}

(async () => {
  for (const p of projects) {
    await backupProject(p);
  }
  console.log('\n=== BACKUPS CONCLUIDOS ===');
})();
