// Roda migration 002 no Supabase via REST API
// Usa a service role key que bypassa RLS

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://aaynzvvoeufunbpzblwa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheW56dnZvZXVmdW5icHpibHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcxNjYzMSwiZXhwIjoyMTAzMjkyNjMxfQ.RCfTkdX5F7HNBjA_mK6AmOJHTbNO9mRJ9rrRaRuPUEM';

const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_oauth_login_support.sql'), 'utf-8');

async function main() {
  console.log('Tentando rodar migration via Supabase REST...');
  console.log('SQL:', sql.substring(0, 100) + '...');

  // Metodo 1: Tentar endpoint /pg/sql (novo Supabase)
  try {
    const resp = await fetch(`${SUPABASE_URL}/pg/sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log(`/pg/sql status: ${resp.status}`);
    if (resp.ok) {
      const text = await resp.text();
      console.log('OK:', text.substring(0, 200));
      return;
    }
    const errText = await resp.text();
    console.log('Erro:', errText.substring(0, 200));
  } catch (e) {
    console.log('/pg/sql falhou:', e.message);
  }

  // Metodo 2: Criar funcao pg_exec temporaria e chamar via RPC
  // Primeiro tenta criar a funcao
  console.log('\nTentando criar funcao pg_exec...');
  try {
    // Nao da pra criar funcao via REST sem SQL endpoint...
    // Metodo 3: usar supabase-js client
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Verificar se a coluna provider ja existe
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, status')
      .limit(1);
    
    if (error) {
      console.log('Erro ao consultar users:', error.message);
    } else {
      console.log('users OK:', JSON.stringify(data[0]));
    }

    // Verificar colunas existentes
    const { data: cols, error: colErr } = await supabase
      .rpc('to_jsonb', { any_element: null });
    console.log('RPC test:', colErr?.message || 'ok');

  } catch (e) {
    console.log('supabase-js falhou:', e.message);
  }

  console.log('\nNao consegui rodar SQL via API. Precisa rodar manualmente no painel.');
}

main();
