# StackPost

SaaS multi-tenant de publicação em redes sociais.

## Stack

- **Framework:** Next.js 15 App Router
- **Runtime:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Banco de dados:** Supabase PostgreSQL via HTTP/REST
- **Autenticação:** JWT em cookie `HttpOnly`, API key `x-api-key` para integrações
- **Pagamentos:** Mercado Pago
- **Deploy:** `git push main` → GitHub Actions → Cloudflare
- **Contato:** contatoianexus@gmail.com

## Instalação local

1. Clone o repositório
2. Copie `apps/web/.env.example` para `apps/web/.env.local` e preencha
3. Instale as dependências:

```powershell
cd apps/web
npm install
```

4. Rode o dev server:

```powershell
npm run dev -- -p 3333
```

5. Abra `http://localhost:3333`

## Variáveis de ambiente obrigatórias

| Variável | Descrição | Onde usar |
|---|---|---|---|
| `JWT_SECRET` | Chave para assinar/verificar tokens | runtime |
| `TOKEN_ENCRYPTION_KEY` | Chave de criptografia de tokens de plataforma (32 bytes) | runtime |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token do Mercado Pago | runtime |
| `MERCADOPAGO_WEBHOOK_SECRET` | Segredo para validar HMAC de webhooks | runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key do Supabase | runtime |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | build + runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase | build + runtime |
| `NEXT_PUBLIC_SITE_URL` | URL pública da aplicação | build + runtime |

Veja `apps/web/.env.example` para a lista completa incluindo OAuth de cada plataforma.

## Migrações

As migrações ficam em `migrations/` e são replicadas em `supabase/migrations/` para uso do Supabase CLI.

Para aplicar:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "..."
npx supabase db push --project-ref aaynzvvoeufunbpzblwa
```

Sempre confira o `dry-run` primeiro:

```powershell
npx supabase db push --project-ref aaynzvvoeufunbpzblwa --dry-run
```

## Comandos úteis

```powershell
npx tsc --noEmit        # Type check
npm run build           # Build de produção
npm run preview         # Preview local do build
```

## Estrutura

- `apps/web/src/app` — páginas e rotas da API
- `apps/web/src/components` — componentes React
- `apps/web/src/lib` — bibliotecas (auth, supabase, oauth, mercadopago, publisher, logger)
- `migrations/` — migrações SQL
- `supabase/migrations/` — cópia das migrações para o Supabase CLI

## Segurança

- Nenhum secret hardcoded no fonte
- Senhas hasheadas com bcrypt
- JWT em cookie `HttpOnly; Secure; SameSite=Strict`
- Todas as tabelas com RLS ativado e `allow_service` policy
- Webhook do Mercado Pago validado via HMAC-SHA256
- Validação de entrada com Zod em todas as rotas
- CORS com origens permitidas e CSP ativo

## Checklist pré-deploy

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run build` sem erros
- [ ] `supabase db push` aplicado e sem migrações pendentes
- [ ] Variáveis de ambiente preenchidas no Cloudflare Worker
- [ ] Mercado Pago webhook aponta para `https://<site>/api/pagamentos/webhook`
- [ ] OAuth callbacks registrados nas plataformas com `https://<site>/api/oauth/<plataforma>/callback`
- [ ] Nenhum secret commitado
- [ ] Teste ponta a ponta: cadastro → login → post → pagamento

## Deploy

1. Commit e push para `main`
2. GitHub Actions roda `npm run build` e deploy via Wrangler
3. Nunca rode `wrangler deploy` localmente em produção

## Rollback

1. Reverter o commit
2. Push para `main`
3. Se necessário, reverter migrações no Supabase manualmente com SQL

## Troubleshooting

### Build falha com `pages-manifest.json` ou cache corrompido
```powershell
Remove-Item -Path "apps\web\.next" -Recurse -Force
npm run build
```

### Supabase db push falha
- Confira se a CLI está logada com `supabase login` ou `SUPABASE_ACCESS_TOKEN`
- Nunca use `CREATE POLICY IF NOT EXISTS`; as migrações atuais usam `DO $$ ... END $$`

### Webhook do Mercado Pago retorna 401
- Verifique se `MERCADOPAGO_WEBHOOK_SECRET` está preenchido
- O `x-signature` deve ser HMAC-SHA256 do body raw

## Contato

- Email: contatoianexus@gmail.com
- Domínio: https://stackpost.expostacker.com.br
- Repo: https://github.com/lfelipef1dev-jpg/stackpost
