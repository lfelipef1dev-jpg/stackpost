// Roda migration 002 no Supabase via conexao direta (pg)
// Isso e um script de migration, nao runtime do Worker

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string do Supabase - pooler
// Formato: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Mas nao temos a senha do postgres. Vamos usar o pooler com a service role.

// Na verdade, o Supabase tem duas formas de conexao:
// 1. Direta: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
// 2. Pooler: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

// Sem a senha do postgres, nao conseguimos conectar via TCP.
// Vamos tentar outro approach: usar o endpoint /rest/v1/rpc com uma funcao que ja existe

// Na verdade, vamos tentar criar a funcao pg_exec via REST primeiro
// Depois chamar ela

const SUPABASE_URL = 'https://aaynzvvoeufunbpzblwa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheW56dnZvZXVmdW5icHpibHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcxNjYzMSwiZXhwIjoyMTAzMjkyNjMxfQ.RCfTkdX5F7HNBjA_mK6AmOJHTbNO9mRJ9rrRaRuPUEM';

async function tryEndpoint(endpoint, body) {
  const resp = await fetch(`${SUPABASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { status: resp.status, body: await resp.text() };
}

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_oauth_login_support.sql'), 'utf-8');

  // Tentar varios endpoints
  const endpoints = [
    { path: '/rest/v1/rpc/exec_sql', body: { sql_text: sql } },
    { path: '/rest/v1/rpc/execute_sql', body: { sql_text: sql } },
    { path: '/rest/v1/rpc/run_sql', body: { query: sql } },
    { path: '/pg/execute', body: { query: sql } },
    { path: '/pg/query', body: { query: sql } },
  ];

  for (const ep of endpoints) {
    console.log(`Tentando ${ep.path}...`);
    try {
      const result = await tryEndpoint(ep.path, ep.body);
      console.log(`  Status: ${result.status}`);
      if (result.status === 200 || result.status === 201) {
        console.log(`  OK! Response: ${result.body.substring(0, 200)}`);
        return;
      }
      if (result.status !== 404) {
        console.log(`  Response: ${result.body.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`  Erro: ${e.message}`);
    }
  }

  console.log('\nNenhum endpoint SQL funcionou. Precisa rodar manualmente no painel do Supabase.');
  console.log('Painel: https://supabase.com/dashboard/project/aaynzvvoeufunbpzblwa/sql/new');
}

main();
