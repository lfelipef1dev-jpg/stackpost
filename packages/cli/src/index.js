#!/usr/bin/env node
// StackPost CLI - Publique do terminal

const BASE_URL = process.env.STACKPOST_API_URL || 'https://stackpost.expostacker.com.br';
const API_KEY = process.env.STACKPOST_API_KEY;

if (!API_KEY) {
  console.error('Erro: defina STACKPOST_API_KEY no ambiente');
  process.exit(1);
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Erro ${res.status}: ${data.error || res.statusText}`);
    process.exit(1);
  }
  return data;
}

const [cmd, ...args] = process.argv.slice(2);

async function main() {
  switch (cmd) {
    case 'post': {
      const text = args.find(a => a.startsWith('--text='))?.split('=')[1];
      const platforms = args.find(a => a.startsWith('--platforms='))?.split('=')[1].split(',');
      const schedule = args.find(a => a.startsWith('--schedule='))?.split('=')[1];
      if (!text || !platforms) {
        console.error('Uso: stackpost post --text="Hello" --platforms=instagram,facebook [--schedule=ISO]');
        process.exit(1);
      }
      const result = await request('POST', '/api/posts', {
        platforms, text, scheduledAt: schedule || undefined,
      });
      console.log('Post criado:', result.id);
      if (!schedule) {
        const pub = await request('POST', '/api/posts/publish', { postId: result.id });
        console.log('Publicado:', pub.status);
      }
      break;
    }
    case 'accounts': {
      const accounts = await request('GET', '/api/accounts');
      console.table(accounts);
      break;
    }
    case 'analytics': {
      const period = args.find(a => a.startsWith('--period='))?.split('=')[1] || '30d';
      const data = await request('GET', `/api/analytics?period=${period}`);
      console.table(data);
      break;
    }
    case 'upload': {
      const url = args.find(a => a.startsWith('--url='))?.split('=')[1];
      if (!url) { console.error('Uso: stackpost upload --url=URL'); process.exit(1); }
      const result = await request('POST', '/api/upload/from-url', { url });
      console.log('Upload:', result.id);
      break;
    }
    case 'import': {
      const account = args.find(a => a.startsWith('--account='))?.split('=')[1];
      const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'csv';
      if (!account) { console.error('Uso: stackpost import --account=ID [--format=csv]'); process.exit(1); }
      const result = await request('POST', '/api/imports', { account, format });
      console.log('Import iniciado:', result.id);
      break;
    }
    default:
      console.log(`StackPost CLI

Comandos:
  post       Criar e publicar post
  accounts   Listar contas conectadas
  analytics  Ver analytics
  upload     Upload de midia por URL
  import     Importar historico

Exemplos:
  stackpost post --text="Hello" --platforms=instagram,facebook
  stackpost post --text="Lancamento!" --platforms=instagram --schedule="2026-09-01T10:00:00Z"
  stackpost accounts
  stackpost analytics --period=30d
  stackpost upload --url=https://example.com/image.jpg
  stackpost import --account=acc_123 --format=csv

Config:
  STACKPOST_API_KEY  Sua API key (obrigatorio)
  STACKPOST_API_URL  URL base (default: https://stackpost.expostacker.com.br)
`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
