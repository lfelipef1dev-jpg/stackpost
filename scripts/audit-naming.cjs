const { Client } = require('pg');

const projects = [
  { name: 'StackPost', host: 'db.aaynzvvoeufunbpzblwa.supabase.co', password: 'BrUphiStackPost2026!' },
  { name: 'Nexus', host: 'db.hfwiyxmezjfokescnzih.supabase.co', password: 'BrUphiNexus2026!' },
];

async function analyzeNaming(p) {
  console.log(`\n=== ANALISE DE NOMENCLATURA — ${p.name} ===`);
  const c = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(p.password)}@${p.host}:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await c.connect();

    const tables = await c.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const names = tables.rows.map(r => r.table_name);
    const prefixed = names.filter(n => n.startsWith(p.name.toLowerCase() + '_'));
    const unprefixed = names.filter(n => !n.startsWith(p.name.toLowerCase() + '_'));
    const otherPrefix = names.filter(n => n.includes('_') && !n.startsWith(p.name.toLowerCase() + '_') && !n.includes('post') && !n.includes('nexus'));

    console.log(`Total de tabelas: ${names.length}`);
    console.log(`\nCom prefixo "${p.name.toLowerCase()}_": ${prefixed.length}`);
    prefixed.forEach(t => console.log(`  - ${t}`));

    console.log(`\nSem prefixo "${p.name.toLowerCase()}_": ${unprefixed.length}`);
    unprefixed.forEach(t => console.log(`  - ${t}`));

    // Verificar chaves estrangeiras para ver impacto de renomeacao
    const fks = await c.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `);

    console.log(`\nTotal de chaves estrangeiras: ${fks.rows.length}`);
    fks.rows.forEach(r => console.log(`  - ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`));

    // Verificar views, materialized, funcoes, triggers custom
    const views = await c.query(`
      SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;
    `);
    console.log(`\nViews: ${views.rows.length}`);
    views.rows.forEach(r => console.log(`  - ${r.table_name}`));

    // Funcoes custom (nao de system schemas)
    const funcs = await c.query(`
      SELECT p.proname
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY p.proname;
    `);
    console.log(`\nFuncoes custom em public: ${funcs.rows.length}`);
    funcs.rows.forEach(r => console.log(`  - ${r.proname}`));

    await c.end();
  } catch(e) {
    console.log('ERRO:', e.message);
    try { await c.end(); } catch {}
  }
}

(async () => {
  for (const p of projects) {
    await analyzeNaming(p);
  }
  console.log('\n=== FIM ===');
})();
