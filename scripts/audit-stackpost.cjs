const { Client } = require('pg');

async function auditStackPost() {
  console.log('=== STACKPOST (aaynzvvoeufunbpzblwa) ===');
  const c = new Client({
    connectionString: 'postgresql://postgres:BrUphiStackPost2026%21@db.aaynzvvoeufunbpzblwa.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await c.connect();
    console.log('Conexao: OK');

    // Tabelas
    const tables = await c.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    console.log('\nTabelas (' + tables.rows.length + ' total):');

    const counts = {};
    for (const r of tables.rows) {
      const t = r.tablename;
      try {
        const cnt = await c.query('SELECT count(*) FROM "' + t + '"');
        counts[t] = cnt.rows[0].count;
        console.log('  ' + t.padEnd(40) + ' ' + String(counts[t]).padStart(8) + ' rows');
      } catch(e) {
        counts[t] = 'erro';
        console.log('  ' + t.padEnd(40) + '    ERRO');
      }
    }

    // RLS
    const rls = await c.query(`
      SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    const rlsOn = rls.rows.filter(r => r.rowsecurity).length;
    const rlsOff = rls.rows.filter(r => !r.rowsecurity).length;
    console.log('\nRLS: ' + rlsOn + ' ON, ' + rlsOff + ' OFF');
    if (rlsOff > 0) {
      console.log('Tabelas SEM RLS:');
      rls.rows.filter(r => !r.rowsecurity).forEach(r => console.log('  ! ' + r.tablename));
    }

    // Verificar se tem dados de outro projeto
    console.log('\n=== VERIFICACAO DE CROSS-CONTAMINATION ===');
    // Procurar tabelas com prefixo nexus ou seeds
    const foreign = tables.rows.filter(r => 
      r.tablename.toLowerCase().includes('nexus') || 
      r.tablename.toLowerCase().includes('seeds')
    );
    if (foreign.length > 0) {
      console.log('TABELAS DE OUTRO PROJETO ENCONTRADAS:');
      foreign.forEach(r => console.log('  ! ' + r.tablename));
    } else {
      console.log('Nenhuma tabela com nome nexus/seeds encontrada. OK.');
    }

    await c.end();
  } catch(e) {
    console.log('ERRO: ' + e.message.substring(0, 200));
    try { await c.end(); } catch {}
  }
}

auditStackPost();
