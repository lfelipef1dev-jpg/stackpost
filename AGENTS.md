# StackPost — Regras Técnicas Absolutas

> Projeto full-stack do ecossistema ExpoStacker.
> Deploy: Cloudflare Workers + @opennextjs/cloudflare.
> Banco: Supabase PostgreSQL (via HTTP/REST, nunca TCP raw).

---

## 1. Regra Absoluta nº 1 — Projeto é uma ilha

- StackPost usa banco Supabase PRÓPRIO.
- NUNCA compartilhar tabelas com NEXUS, SEEDS ou qualquer outro projeto.
- NUNCA acessar banco de outro projeto com a service role key.
- Se um banco cair, os outros continuam no ar.

## 2. Regra Absoluta nº 2 — Nada manual na Cloudflare

- NUNCA rodar wrangler deploy manualmente.
- NUNCA criar CNAME, DNS record ou dominio customizado manualmente.
- NUNCA adicionar/alterar/remover secrets no Cloudflare manualmente.
- Deploy é automático: git push main → GitHub Actions → Cloudflare.

## 3. Regra Absoluta nº 3 — Não commitar secrets

- Nunca commitar: .env.local, .dev.vars, .deploy.env, wrangler.toml com valores, .devin/secrets/.
- Secrets ficam em: .devin/secrets/ (local), GitHub Secrets (CI), Cloudflare Worker (runtime).

## 4. Regra Absoluta nº 4 — Backup antes de tocar no banco

- Antes de DROP, DELETE, TRUNCATE, ALTER — fazer backup.
- Mostrar o comando exato e esperar confirmacao explicita.
- Nunca rodar DELETE sem WHERE.
- Nunca truncar sem filtro de projeto/tenant.

## 5. Arquitetura

Usuario → Cloudflare Worker (stackpost) → Next.js App Router → Supabase PostgreSQL

## 6. Dependencias de deploy

- Node 22
- @opennextjs/cloudflare
- wrangler

## 7. Comandos

npm run build      # build local
npm run deploy     # build + deploy local (NUNCA usar em prod)
npm run preview    # preview local

## 8. Variaveis de ambiente obrigatorias

Build-time (GitHub):
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL

Runtime (Cloudflare Worker):
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- JWT_SECRET
- MERCADOPAGO_ACCESS_TOKEN
- MERCADOPAGO_WEBHOOK_SECRET

## 9. Supabase

- RLS deve estar ativado em TODAS as tabelas.
- Policy padrao: llow_service com 	rue (service role bypassa).
- Auth URL: https://stackpost.expostacker.com.br
- Redirect URL: https://stackpost.expostacker.com.br/auth/callback

## 10. Pagamento

- Gateway: Mercado Pago.
- Rota checkout: /api/pagamentos/checkout
- Rota webhook: /api/pagamentos/webhook
- Idempotencia via external_reference prefixado stackpost_.

## 11. Plano

/mes (Free)
R/mes (Pro)
R/mes (Business)
RTrue (Enterprise — custom)

## 12. Plataformas suportadas

Instagram, Facebook, LinkedIn, TikTok, YouTube, Snapchat, Twitter/X, Threads,
Pinterest, Reddit, Mastodon, Bluesky, Discord, Slack, Google Business Profile.

## 13. Contato

- Repo: https://github.com/lfelipef1dev-jpg/stackpost
- Dominio: https://stackpost.expostacker.com.br
- Worker: stackpost
