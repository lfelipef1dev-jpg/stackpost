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

```powershell
npm run build      # build local
npm run deploy     # build + deploy local (NUNCA usar em prod)
npm run preview    # preview local
npx tsc --noEmit   # Type check
```

## 8. Variaveis de ambiente obrigatorias

### Build-time (GitHub)

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL

### Runtime (Cloudflare Worker)

- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- JWT_SECRET
- TOKEN_ENCRYPTION_KEY
- MERCADOPAGO_ACCESS_TOKEN
- MERCADOPAGO_WEBHOOK_SECRET
- CRON_SECRET

### OAuth por plataforma

- META_APP_ID, META_APP_SECRET
- IG_APP_ID, IG_APP_SECRET
- LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
- TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
- TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET
- REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET
- MASTODON_CLIENT_ID, MASTODON_CLIENT_SECRET (instancia: mastodon.social, conta @expostacker)
- SNAPCHAT_CLIENT_ID, SNAPCHAT_CLIENT_SECRET
- DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
- SLACK_CLIENT_ID, SLACK_CLIENT_SECRET

## 9. Supabase

- RLS deve estar ativado em TODAS as tabelas.
- Policy padrao: allow_service com true (service role bypassa).
- Auth URL: https://stackpost.expostacker.com.br
- Redirect URL: https://stackpost.expostacker.com.br/auth/callback
- Migrações: `supabase/migrations/`

## 10. Segurança

- Senhas com bcrypt (nunca SHA-256).
- JWT em cookie HttpOnly, Secure, SameSite=Strict.
- Todas as rotas validam entrada com Zod.
- Mercado Pago webhook validado via HMAC-SHA256.
- Sem `console.log` em produção.

## 11. Pagamento

- Gateway: Mercado Pago.
- Rota checkout: /api/pagamentos/checkout
- Rota webhook: /api/pagamentos/webhook
- Idempotencia via external_reference prefixado stackpost_.

## 12. Plataformas suportadas

Instagram, Facebook, LinkedIn, TikTok, YouTube, Snapchat, Twitter/X, Threads,
Pinterest, Reddit, Mastodon, Bluesky, Discord, Slack, Google Business Profile.

### Status de conexao (19/09/2026)

| Plataforma | Nossa conta | Cliente consegue? | Observacao |
|---|---|---|---|
| LinkedIn | ✅ POSTANDO | ? | video ok, URL salva (feed/update) |
| Bluesky | ✅ POSTANDO | sim | @expostacker.bsky.social, video ok |
| Discord | ✅ POSTANDO | webhook | video ok |
| Slack | ✅ POSTANDO | webhook | video ok |
| Mastodon | ✅ POSTANDO | sim | @expo_stacker (antiga suspensa) |
| Instagram | ✅ POSTANDO | depende Meta review | reels ok, permalink salvo |
| Facebook | ✅ POSTANDO | depende Meta review | pacing 60min anti-ban |
| Threads | ✅ POSTANDO | depende Meta review | video ok c/ polling de status |
| TikTok | ⚠️ INBOX | nao | app nao auditado: video cai na inbox s/ legenda. App Review em preparacao |
| YouTube | ❌ needs_reconnect | nao | refresh token de outro client — reconectar OAuth |
| Pinterest | ⚠️ conectada s/ board | nao | boards:write no scope, falta board + reconnect |
| Google Business | ❌ needs_reconnect | nao | token invalido + quota/location pendente |
| Reddit | BLOQUEADA | nao | pedido de acesso dev enviado |
| X/Twitter | CONGELADA | — | "em breve" |
| Snapchat | REMOVIDA | — | fora do projeto |

### Credenciais por plataforma (.dev.vars — nunca commitar)

- Slack: `SLACK_WEBHOOK_URL` (webhook posta no canal #social)
- Mastodon: `MASTODON_CLIENT_ID/SECRET/ACCESS_TOKEN` (mastodon.social)
- Discord: webhook no `access_token` da social_account
- Bluesky: app password na social_account

## 13. Contato

- Repo: https://github.com/lfelipef1dev-jpg/stackpost
- Dominio: https://stackpost.expostacker.com.br
- Worker: stackpost
