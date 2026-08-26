# Plano de Implementacao - Stackpost

Roadmap com milestones e ordem de prioridade. Sem estimativa de tempo (voce define o ritmo).

## Principios

1. **MVP primeiro:** 3 plataformas + fluxo basico = produto usavel
2. **Vertical slices:** cada milestone entrega valor end-to-end
3. **Dados reais cedo:** testar com contas reais o quanto antes
4. **Tech debt controlada:** nao atalhar no auth/rate-limit/upload (fundacao)
5. **Reusar blueprint:** todos os valores reais ja estao no PDF mestre

## Milestone 0: Fundacao (pre-requisito)

### 0.1 Setup monorepo
- [ ] Criar monorepo (pnpm workspaces ou Turborepo)
- [ ] `apps/backend` (NestJS + Fastify)
- [ ] `apps/dashboard` (Next.js 15)
- [ ] `packages/shared` (tipos Zod compartilhados)
- [ ] `packages/sdk` (gerado de OpenAPI)
- [ ] Docker + docker-compose (Postgres + Redis + app)
- [ ] `.env.example` preenchido
- [ ] ESLint + Prettier + Husky pre-commit

### 0.2 Banco de dados
- [ ] PostgreSQL 16 no docker-compose
- [ ] Drizzle ORM + drizzle-kit (migrations)
- [ ] Schema do blueprint (9 tabelas do PDF, secao 19)
- [ ] Seed script (org demo + team + 1 conta)

### 0.3 Infra basica
- [ ] Cloudflare R2 bucket + API token
- [ ] Redis no docker-compose
- [ ] Pino logger estruturado
- [ ] Sentry error tracking
- [ ] Health check endpoint

**Checkpoint:** `docker-compose up -d` sobe tudo. `GET /health` responde 200.

---

## Milestone 1: Auth + Multi-tenancy

### 1.1 API Key auth
- [ ] Middleware Fastify: validar `x-api-key` header
- [ ] Tabela `api_keys` (hash, prefix, last_used_at)
- [ ] Gerar chave com prefixo `sk_live_` (ou `pk_live_`)
- [ ] 401 sem chave, 403 chave invalida
- [ ] Rate limit 3 camadas (Redis): 100/1s, 500/10s, 2000/60s
- [ ] Headers `X-RateLimit-*` em todas respostas
- [ ] 429 com `Retry-After`

### 1.2 Organization > Team hierarchy
- [ ] CRUD organizations
- [ ] CRUD teams (dentro de org)
- [ ] Planos: FREE, PRO, BUSINESS, CUSTOM
- [ ] Monthly caps (Redis counter, reset dia 1 UTC)
- [ ] Daily limits por conta real (Redis counter por UTC date)
- [ ] Endpoint `GET /organization/usage/daily-limits`

### 1.3 Webhooks (estrutura)
- [ ] Tabela `webhooks` (url, signing_secret, status)
- [ ] Tabela `webhook_events` (type, payload, status, attempts)
- [ ] HMAC-SHA256 signature
- [ ] Delivery worker (BullMQ): 15s timeout, 3 retries, 30s backoff
- [ ] 50 concorrentes
- [ ] Auto-disable apos 7 dias sem sucesso
- [ ] Resend manual
- [ ] 9 eventos: post.published, comment.published, social-account.*, team.*

**Checkpoint:** Criar org + team + API key. Rate limit funciona. Webhook entrega.

---

## Milestone 2: Upload

### 2.1 Simple upload
- [ ] `POST /upload/` (multipart/form-data, 90 MB ceiling)
- [ ] Salvar no R2
- [ ] Retornar `{ id, fileName, mimeType, size }`

### 2.2 Direct upload (presigned URL)
- [ ] `POST /upload/init` -> retorna presigned URL R2 (30 min expiry)
- [ ] `POST /upload/finalize` -> confirma upload
- [ ] Validar mimeType + size

### 2.3 Multipart upload (resumable)
- [ ] `POST /upload/multipart/init` (fileSize required, 64 MiB chunks, 6h expiry)
- [ ] `POST /upload/multipart/sign` (re-sign expired parts)
- [ ] `POST /upload/multipart/complete` (ETags)
- [ ] `POST /upload/multipart/abort`
- [ ] Max 10.000 parts
- [ ] Auto-abort apos 7 dias (cron)

### 2.4 Upload from URL
- [ ] `POST /upload/from-url` (1 GB max, 60s timeout)

### 2.5 Cleanup
- [ ] Cron: soft-delete uploads nao usados ha 90 dias
- [ ] Cron: purge uploads deletados ha 7 dias
- [ ] Cron: abort multipart nao completado ha 7 dias

**Checkpoint:** Upload de imagem (simple), video grande (multipart), e de URL funcionam.

---

## Milestone 3: 3 Plataformas MVP

### 3.1 Interface PlatformAdapter
- [ ] Interface padrao (getAuthUrl, handleCallback, refreshToken, getChannels, publish, getAnalytics, validateConnection)
- [ ] Registry de adapters
- [ ] Normalizacao de erros (errorsVerbose)

### 3.2 Instagram (Meta Graph API)
- [ ] OAuth via Meta (set-channel obrigatorio)
- [ ] `POST /social-account/connect`
- [ ] `POST /social-account/set-channel`
- [ ] `POST /social-account/refresh-channels`
- [ ] Validar: type (POST/REEL/STORY), carouselItems, uploadIds, aspect ratio
- [ ] Publish: POST, REEL, STORY
- [ ] firstComment automatico (max 2.200)
- [ ] Erros Meta:190 (token expired), Meta:368 (rate limited)

### 3.3 Twitter/X (API v2)
- [ ] OAuth direto (sem set-channel)
- [ ] Validar: text 280/25.000, 4 imagens ou 1 video
- [ ] Publish: tweet com midia
- [ ] Sem firstComment
- [ ] Sem analytics

### 3.4 LinkedIn (Marketing API)
- [ ] OAuth (set-channel: perfil ou Company Page)
- [ ] Validar: text 3.000, 10 midias ou 1 PDF, mediaTitle 200
- [ ] Publish: text, midia, link, documento
- [ ] firstComment (max 1.250)

### 3.5 POST /post (unificado)
- [ ] Schema Zod (validar body)
- [ ] Validar uploadIds existem e pertencem ao team
- [ ] Validar regras por plataforma (aspect ratio, tamanho, duracao)
- [ ] Salvar como DRAFT ou SCHEDULED
- [ ] Retornar 201 com `{ id, status }`

### 3.6 Publisher worker (BullMQ)
- [ ] Scheduler: posts SCHEDULED com postDate <= now
- [ ] Worker: Promise.allSettled por plataforma
- [ ] Status: SCHEDULED -> PROCESSING -> POSTED/ERROR
- [ ] Retry transient (3x, backoff 30s/90s/270s)
- [ ] Salvar externalData (IDs + permalinks)
- [ ] Salvar errorsVerbose
- [ ] Disparar webhook post.published
- [ ] Agendar firstComment apos sucesso

**Checkpoint:** Post para Instagram + Twitter + LinkedIn em paralelo funciona. Webhook entrega.

---

## Milestone 4: +6 Plataformas Core

### 4.1 TikTok (Content API)
- [ ] OAuth direto
- [ ] Validar: type (VIDEO/IMAGE), Photo Mode (JPG/WebP only, PNG rejeitado)
- [ ] Publish: video, photo mode
- [ ] Status REVIEW (re-check periodicamente)
- [ ] musicSoundInfo (CML trending list)
- [ ] firstComment (max 150)

### 4.2 YouTube (Data API v3)
- [ ] OAuth (set-channel: canal)
- [ ] Validar: type (VIDEO/SHORT), text 100 (titulo), description 5.000
- [ ] madeForKids (required por COPPA)
- [ ] Shorts auto-detectados
- [ ] firstComment (max 10.000)

### 4.3 Facebook (Meta Graph API)
- [ ] OAuth (set-channel: Page)
- [ ] Meta Rule: selecionar TODAS as Pages no OAuth
- [ ] Validar: type (POST/REEL/STORY), 4 imagens ou 1 video
- [ ] Publish: page post, reel, story
- [ ] firstComment (max 8.000)

### 4.4 Threads (Meta)
- [ ] OAuth direto
- [ ] Validar: 10 imagens ou 1 video, poll/gif/link text-only
- [ ] Publish: text, midia, poll, gif, link
- [ ] firstComment (max 500)

### 4.5 Pinterest (API v5)
- [ ] OAuth (sem set-channel, boards via refresh)
- [ ] Validar: boardName required, 1 imagem ou video
- [ ] Publish: pin
- [ ] Sem firstComment

### 4.6 Reddit (API)
- [ ] OAuth (sem set-channel)
- [ ] Validar: sr required, text 300, description 30.000
- [ ] `/misc/reddit/post-requirements` ANTES de postar
- [ ] Publish: text, link, midia, gallery
- [ ] firstComment (max 10.000)

**Checkpoint:** 9 plataformas funcionando. Post para 9 redes em paralelo.

---

## Milestone 5: +6 Plataformas Completas

### 5.1 Bluesky (AT Protocol)
- [ ] OAuth (serverUrl opcional, default bsky.social)
- [ ] Validar: text 300, 4 midias, videoAlt
- [ ] Publish: text, midia, link card, quote
- [ ] firstComment (max 300)

### 5.2 Mastodon (API, instancia custom)
- [ ] OAuth (serverUrl obrigatorio)
- [ ] Validar: 4 midias, privacy, spoiler
- [ ] Publish: status
- [ ] firstComment (max 500)

### 5.3 Discord (webhook URL)
- [ ] OAuth via webhook
- [ ] Validar: channelId, text 2.000, 10 attachments
- [ ] Publish: mensagem
- [ ] firstComment (max 2.000)

### 5.4 Slack (webhook URL)
- [ ] OAuth via webhook
- [ ] Validar: channelId, text 30.000, 4 attachments
- [ ] Publish: mensagem
- [ ] firstComment (max 30.000)

### 5.5 Google Business (My Business API)
- [ ] OAuth (set-channel: location)
- [ ] Validar: topicType, 1 imagem, text 1.500
- [ ] Publish: STANDARD, EVENT, OFFER, ALERT
- [ ] Sem firstComment

### 5.6 Snapchat (Marketing API)
- [ ] OAuth (Public Profile)
- [ ] Validar: type (STORY/SPOTLIGHT), 1 midia
- [ ] Publish: story, spotlight
- [ ] Sem firstComment

**Checkpoint:** 15 plataformas funcionando. Paridade total com bundle.social.

---

## Milestone 6: Comments + Imports

### 6.1 Comments API
- [ ] `POST /comment` (11 plataformas)
- [ ] `POST /comment/import` (async, 9 plataformas)
- [ ] Import worker (BullMQ)
- [ ] Limites: FREE 25 / PRO 200 / BUSINESS 1.000 por post

### 6.2 Post history import
- [ ] `POST /post-history-import` (async, 15 plataformas)
- [ ] Limites: FREE 5 / PRO 100 / BUSINESS 500 por conta/mes
- [ ] Hard cap: 100 posts por request
- [ ] Retencao 30 dias

### 6.3 CSV bulk import
- [ ] `POST /post-csv-import` (async)
- [ ] Resultados por linha

### 6.4 Reviews import
- [ ] Google reviews import
- [ ] Facebook recommendations import
- [ ] Responder reviews

**Checkpoint:** Comments + imports funcionando.

---

## Milestone 7: Analytics

### 7.1 Parsed analytics
- [ ] Interface `getAnalytics` em cada adapter
- [ ] Metricas normalizadas (impressions, views, likes, comments, shares, saves)
- [ ] `POST /analytics/post/force`
- [ ] `POST /analytics/social-account/force`
- [ ] Force rate limit: teams x 5/dia

### 7.2 Raw analytics
- [ ] `GET /analytics/post/raw`
- [ ] `GET /analytics/social-account/raw`
- [ ] YouTube monetizacao (withBusinessScope + rawYoutubeAnalyticsEnabled)

### 7.3 Cron analytics refresh
- [ ] A cada 24h: buscar analytics de todos os posts
- [ ] Salvar em `analytics_snapshots`
- [ ] Retencao 30 dias (configuravel para indefinido no Stackpost)

### 7.4 Analytics historico (DIFERENCIAL vs bundle.social)
- [ ] Cron job diario salva snapshot
- [ ] Grafico de evolucao temporal
- [ ] Comparacao entre periodos

**Checkpoint:** Analytics funcionando + historico indefinido (superior ao bundle).

---

## Milestone 8: Misc Endpoints

### 8.1 Editar/deletar posts e comentarios
- [ ] Facebook, Instagram, LinkedIn, YouTube, TikTok, Reddit, Twitter, Pinterest, Mastodon, Bluesky, Discord, Slack

### 8.2 YouTube playlists
- [ ] CRUD playlists + items

### 8.3 LinkedIn mentions
- [ ] `/misc/linkedin/mentions/builder`

### 8.4 Google Business location management
- [ ] CRUD location, attributes, categories, food-menus, hours, service-list, place-action-links

### 8.5 Instagram audio + locations + tags
- [ ] `/misc/instagram/audio` (Reels music)
- [ ] `/misc/instagram/locations`
- [ ] `/misc/instagram/tags` (business discovery)

### 8.6 TikTok CML
- [ ] `/misc/tiktok/cml/trending-list`

### 8.7 Reddit flairs + requirements
- [ ] `/misc/reddit/subreddit-flairs`
- [ ] `/misc/reddit/post-requirements`

**Checkpoint:** Paridade total com bundle.social em misc endpoints.

---

## Milestone 9: Diferenciais (superior ao bundle.social)

### 9.1 MCP server (AI agents)
- [ ] `@modelcontextprotocol/sdk`
- [ ] Tools: create_post, schedule_post, list_accounts, get_analytics, upload_media
- [ ] stdio + HTTP server

### 9.2 AI caption (Nexus IA)
- [ ] `POST /post/ai-caption`
- [ ] Integracao com Nexus IA (LLM)
- [ ] 3-5 variacoes por plataforma

### 9.3 A/B testing
- [ ] `post.variants[]`
- [ ] Publica em contas/horarios diferentes
- [ ] Compara analytics

### 9.4 Best-time-to-post (ML)
- [ ] Calcular engagement por hora/dia
- [ ] Sugerir top 3 horarios

### 9.5 Auto-reconnect
- [ ] Detectar + tentar refresh automatico
- [ ] Notificar usuario se falhar

### 9.6 Approval workflow
- [ ] DRAFT -> REVIEW -> APPROVED -> SCHEDULED
- [ ] Roles: creator, reviewer, approver
- [ ] Notificacoes em cada transicao

### 9.7 Multi-user + RBAC
- [ ] `users` table (email + password ou OAuth Google)
- [ ] `team_members` (user_id, team_id, role)
- [ ] JWT para dashboard, API key para integracoes

### 9.8 Cross-post adaptativo
- [ ] Input unificado (text, media, hashtags, link)
- [ ] Gerar `data.PLATFORM` por plataforma
- [ ] Usuario edita antes de publicar

### 9.9 Hashtag suggestions
- [ ] Trending APIs (TikTok CML, Twitter trends, IG tags)
- [ ] Sugestoes por nicho

### 9.10 SSE status real-time
- [ ] `GET /post/{id}/events` (SSE)
- [ ] Eventos: status_changed, platform_posted, platform_error

### 9.11 Idempotency
- [ ] Header `Idempotency-Key`
- [ ] Dedup em 24h

### 9.12 Cursor pagination
- [ ] Todos list endpoints
- [ ] `?cursor=abc&limit=50`

### 9.13 Webhook replay
- [ ] Persistir todos eventos
- [ ] Replay ao re-enable

### 9.14 tus upload (padrao)
- [ ] Substituir multipart custom por tus

**Checkpoint:** Stackpost e superior ao bundle.social em todos os aspectos.

---

## Milestone 10: Dashboard (Next.js)

### 10.1 Auth
- [ ] Login com email + password
- [ ] OAuth Google
- [ ] JWT session

### 10.2 Onboarding
- [ ] Criar organization
- [ ] Criar team
- [ ] Gerar API key
- [ ] Conectar primeira conta social

### 10.3 Calendar view
- [ ] Calendario de posts agendados
- [ ] Drag-and-drop para reagendar
- [ ] Visual por plataforma

### 10.4 Composer
- [ ] Editor unificado (text, media, hashtags)
- [ ] Preview por plataforma
- [ ] Upload com progresso (tus)
- [ ] Agendar ou publicar agora

### 10.5 Analytics dashboard
- [ ] Graficos de evolucao
- [ ] Comparacao entre periodos
- [ ] Top posts
- [ ] Demograficos (raw)

### 10.6 Accounts management
- [ ] Listar contas conectadas
- [ ] Status (active, expired, scheduled_for_deletion)
- [ ] Reconnect
- [ ] Refresh channels

### 10.7 Webhooks management
- [ ] Listar webhooks
- [ ] Criar/editar/deletar
- [ ] Ver eventos entregues
- [ ] Resend manual
- [ ] Re-enable

### 10.8 Settings
- [ ] Organization settings
- [ ] Team settings
- [ ] API keys management
- [ ] Billing (Stripe integration)

**Checkpoint:** Dashboard completo. Produto usavel end-to-end.

---

## Milestone 11: Producao

### 11.1 Deploy
- [ ] Coolify no VPS (Hetzner)
- [ ] Git push = deploy
- [ ] Environment variables
- [ ] SSL (Let's Encrypt via Coolify)

### 11.2 Monitoring
- [ ] Grafana + Loki + Prometheus
- [ ] Alertas: erro rate, queue backlog, webhook failures
- [ ] Uptime monitoring (BetterStack ou UptimeRobot)

### 11.3 Backup
- [ ] Postgres: backup diario (pg_dump -> R2)
- [ ] Redis: AOF persistence
- [ ] R2: versioning + lifecycle rules

### 11.4 Security
- [ ] Tokens encriptados no DB (AES-256-GCM)
- [ ] Secrets em env vars (nao no codigo)
- [ ] CORS configurado
- [ ] Rate limit em auth endpoints
- [ ] Audit log

### 11.5 Billing
- [ ] Stripe integration
- [ ] Planos: FREE, PRO, BUSINESS
- [ ] Webhook Stripe -> atualizar plano

### 11.6 Docs
- [ ] Scalar API docs
- [ ] llms.txt para AI agents
- [ ] Quickstart guide
- [ ] SDK: TS + Python + Go (gerado de OpenAPI)

**Checkpoint:** Stackpost em producao em `stackpost.expostacker.com.br`.

---

## Ordem de prioridade (resumo)

1. **M0 Fundacao** -> setup basico
2. **M1 Auth** -> sem auth nao tem produto
3. **M2 Upload** -> sem upload nao tem midia
4. **M3 3 Plataformas MVP** -> Instagram + Twitter + LinkedIn = produto usavel
5. **M4 +6 Plataformas Core** -> 9 plataformas = paridade parcial
6. **M5 +6 Plataformas Completas** -> 15 plataformas = paridade total
7. **M6 Comments + Imports** -> features secundarias
8. **M7 Analytics** -> essencial para SaaS
9. **M8 Misc Endpoints** -> paridade total
10. **M9 Diferenciais** -> o que faz superior ao bundle
11. **M10 Dashboard** -> UX
12. **M11 Producao** -> go-live

**Recomendacao:** Nao pular M0-M3. Sao a fundacao. Apos M3, voce ja tem um produto usavel para testar com contas reais.
