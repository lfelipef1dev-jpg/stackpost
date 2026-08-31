const { Client } = require('pg');

const projects = [
  {
    name: 'StackPost',
    ref: 'aaynzvvoeufunbpzblwa',
    host: 'db.aaynzvvoeufunbpzblwa.supabase.co',
    password: 'BrUphiStackPost2026!',
  },
  {
    name: 'Nexus IA',
    ref: 'hfwiyxmezjfokescnzih',
    host: 'db.hfwiyxmezjfokescnzih.supabase.co',
    password: 'BrUphiNexus2026!',
  },
  {
    name: 'SEEDS',
    ref: 'phhurravjunielzxatxe',
    host: 'db.phhurravjunielzxatxe.supabase.co',
    password: 'BrUphi@te#13',
  },
];

async function auditProject(p) {
  console.log('\n========================================');
  console.log('PROJETO: ' + p.name + ' (' + p.ref + ')');
  console.log('Host: ' + p.host);
  console.log('========================================');

  const connStr = `postgresql://postgres:${encodeURIComponent(p.password)}@${p.host}:5432/postgres`;
  const c = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

  try {
    await c.connect();
    console.log('Conexao: OK');

    // 1. Nome do banco
    const db = await c.query('SELECT current_database(), version()');
    console.log('Database: ' + db.rows[0].current_database);
    console.log('PostgreSQL: ' + db.rows[0].version.substring(0, 60));

    // 2. Todas as tabelas com contagem
    const tables = await c.query(`
      SELECT t.tablename,
             pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) as size,
             (SELECT reltuples::bigint FROM pg_class WHERE relname = t.tablename AND relkind = 'r') as approx_rows
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY t.tablename;
    `);
    console.log('\nTabelas (' + tables.rows.length + ' total):');
    tables.rows.forEach(r => {
      console.log('  ' + r.tablename.padEnd(40) + ' ' + String(r.approx_rows).padStart(8) + ' rows  ' + (r.size || '-'));
    });

    // 3. RLS status
    const rls = await c.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    const rlsOn = rls.rows.filter(r => r.rowsecurity).length;
    const rlsOff = rls.rows.filter(r => !r.rowsecurity).length;
    console.log('\nRLS: ' + rlsOn + ' ON, ' + rlsOff + ' OFF');
    if (rlsOff > 0) {
      console.log('Tabelas SEM RLS:');
      rls.rows.filter(r => !r.rowsecurity).forEach(r => console.log('  ! ' + r.tablename));
    }

    // 4. Contagem exata das tabelas principais
    const mainTables = tables.rows.map(r => r.tablename);
    const counts = {};
    for (const t of mainTables.slice(0, 20)) { // limitar para nao demorar
      try {
        const r = await c.query('SELECT count(*) FROM ' + t);
        counts[t] = r.rows[0].count;
      } catch(e) {
        counts[t] = 'erro';
      }
    }
    console.log('\nContagem exata (primeiras 20):');
    Object.keys(counts).forEach(k => console.log('  ' + k.padEnd(40) + ' ' + counts[k]));

    // 5. Verificar se tem dados de outro projeto (cross-contamination)
    const orgCount = counts['organizations'] || 0;
    const userCount = counts['users'] || 0;
    console.log('\nOrganizacoes: ' + orgCount + ' | Users: ' + userCount);

    await c.end();
  } catch(e) {
    console.log('Conexao: FALHOU - ' + e.message.substring(0, 150));
    try { await c.end(); } catch {}
  }
}

(async () => {
  console.log('=== AUDITORIA DOS 3 PROJETOS SUPABASE ===');
  for (const p of projects) {
    await auditProject(p);
  }
  console.log('\n=== FIM DA AUDITORIA ===');
})();
