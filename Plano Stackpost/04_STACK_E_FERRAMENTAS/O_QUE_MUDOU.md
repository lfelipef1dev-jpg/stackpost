# O Que Mudou - Desatualizado vs bundle.social

Analise do que esta defasado no bundle.social e o que usar no lugar no Stackpost.

## 1. OpenAPI 3.0 -> 3.1

**bundle.social:** OpenAPI 3.0
**Stackpost:** OpenAPI 3.1

O que muda:
- 3.1 suporta webhooks nativamente (3.0 usa `x-webhooks` extension)
- `nullable: true` deprecated em favor de `type: [string, null]`
- `exclusiveMinimum`/`exclusiveMaximum` sao numeros, nao booleans
- `examples` (plural) em vez de `example`
- JSON Schema 2020-12 compativel

Impacto: SDKs gerados sao mais precisos. Docs mais ricas.

## 2. Express -> Fastify

**bundle.social:** Provavelmente Express (baseado no `localhost:3001` e estilo de rotas)
**Stackpost:** Fastify

O que muda:
- Fastify e 2x mais rapido em benchmarks
- Schema validation nativa (nao precisa Joi/Zod middleware separado)
- Serializacao JSON mais rapida (fast-json-stringify)
- Plugin system mais robusto
- TypeScript support nativo

## 3. Sem MCP (Model Context Protocol)

**bundle.social:** Nao tem MCP server
**Stackpost:** MCP server para AI agents

O que e MCP:
- Protocolo da Anthropic para LLMs interagirem com ferramentas
- Um AI agent (Claude, GPT, etc) pode chamar `create_post`, `list_accounts`, `get_analytics`
- Permite automacao real: "crie um post para Instagram e TikTok sobre lancamento X"

Como implementar:
- `@modelcontextprotocol/sdk` (TypeScript)
- Expor tools: `create_post`, `schedule_post`, `list_social_accounts`, `get_analytics`, `upload_media`
- Rodar como stdio server ou HTTP server

## 4. Analytics 30 dias -> Indefinido

**bundle.social:** Analytics retidos por 30 dias apenas
**Stackpost:** Retencao configuravel (default 365 dias, ou indefinido)

Como:
- Cron job diario busca analytics de todos os posts
- Salva em `analytics_snapshots` (uma linha por fetch)
- Grafico de evolucao: likes/impressions ao longo do tempo
- bundle.social nao tem isso - voce tem

## 5. Sem auto-reconnect -> Auto-reconnect

**bundle.social:** Detecta desconexao remota (Meta) mas nao reconecta
**Stackpost:** Detecta + tenta reconectar automaticamente

Como:
- Ao detectar token invalido, dispara webhook `social-account.reconnect_needed`
- Se o usuario configurou auto-reconnect, tenta refresh token
- Se refresh falhar, notifica usuario (email + dashboard)
- bundle.social para aqui - voce vai alem

## 6. Sem A/B testing -> A/B testing nativo

**bundle.social:** Um post = uma versao
**Stackpost:** Um post = N variacoes (A/B/C)

Como:
- `post.variants[]` em vez de `post.data[platform]` direto
- Cada variant tem caption/hashtags/media diferentes
- Publica em contas diferentes ou horarios diferentes
- Compara analytics para determinar vencedor
- Promove vencedor para outras contas

## 7. Sem AI caption -> AI caption integrado

**bundle.social:** Sem geracao de caption
**Stackpost:** Integracao com Nexus IA (LLM)

Como:
- Endpoint `POST /post/ai-caption` com contexto (produto, publico, plataforma)
- Nexus IA gera 3-5 variacoes de caption
- Usuario escolhe ou edita
- Adapta por plataforma (hashtags no IG, sem hashtags no LinkedIn, etc)

## 8. Sem best-time-to-post -> ML best-time

**bundle.social:** Usuario escolhe horario
**Stackpost:** ML sugere melhor horario

Como:
- Com seus dados historicos de analytics (que voce guarda indefinidamente)
- Para cada conta + plataforma: calcular engagement por hora/dia da semana
- Sugerir top 3 horarios
- Usuario aceita ou sobrescreve

## 9. Sem approval workflow -> Approval workflow

**bundle.social:** DRAFT -> SCHEDULED (sem revisao intermediaria)
**Stackpost:** DRAFT -> REVIEW -> APPROVED -> SCHEDULED

Como:
- Roles: `content_creator`, `reviewer`, `approver`, `admin`
- Creator faz draft -> reviewer revisa -> approver aprova -> scheduler agenda
- Notificacoes em cada transicao
- Audit log de quem aprovou/rejeitou

## 10. Sem team collaboration -> Multi-user com roles

**bundle.social:** 1 API key = 1 usuario (nao tem multi-user)
**Stackpost:** Multi-user com RBAC

Como:
- `users` table com email + password (ou OAuth Google)
- `team_members` table (user_id, team_id, role)
- Roles: `owner`, `admin`, `editor`, `viewer`
- JWT para dashboard, API key para integracoes
- Audit log de todas as acoes

## 11. Sem cross-posting inteligente -> Cross-post adaptativo

**bundle.social:** Voce monta `data.PLATFORM` manualmente para cada plataforma
**Stackpost:** Voce escreve uma vez, sistema adapta

Como:
- Input unificado: `text`, `media`, `hashtags`, `link`
- Sistema gera `data.PLATFORM` para cada plataforma:
  - Instagram: caption + hashtags no final
  - LinkedIn: texto profissional, sem hashtags excessivas
  - Twitter: texto curto + 1-2 hashtags
  - TikTok: caption curta + trending hashtags
  - Pinterest: titulo + descricao + alt text
- Usuario pode editar cada versao antes de publicar

## 12. Sem hashtag suggestions -> Hashtag suggestions

**bundle.social:** Sem suggestions
**Stackpost:** Sugestoes baseadas em trending + nicho

Como:
- Integracao com APIs de trending (TikTok CML, Twitter trends, Instagram tags)
- Analisa caption do post -> sugere hashtags relevantes
- Mostra volume de busca e competencia

## 13. Webhooks: sem replay -> Replay manual + auto-replay opcional

**bundle.social:** Eventos perdidos apos disable NAO sao replayed
**Stackpost:** Opcao de auto-replay (queue eventos durante disable, envia quando re-enable)

Como:
- `webhook_events` table persiste TODOS os eventos
- Ao re-enable, pergunta: "reenviar X eventos perdidos?"
- Ou auto-replay configuravel

## 14. Sem idempotency key -> Idempotency nativa

**bundle.social:** Sem idempotency (reenviar POST /post = post duplicado)
**Stackpost:** Header `Idempotency-Key` opcional

Como:
- `POST /post` com header `Idempotency-Key: uuid`
- Se mesmo key + mesmo body em 24h: retorna post existente
- Preveni duplicacao em retries de rede

## 15. Sem rate limit headers -> Rate limit headers visiveis

**bundle.social:** Sem headers de rate limit
**Stackpost:** Headers padrao

Como:
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 87`
- `X-RateLimit-Reset: 1695000000`
- `Retry-After: 30` (em 429s)

## 16. Sem pagination cursor -> Cursor pagination

**bundle.social:** Provavelmente offset pagination
**Stackpost:** Cursor pagination em todos list endpoints

Como:
- `?cursor=abc123&limit=50`
- Response: `{ data: [...], nextCursor: "def456" }`
- Mais eficiente para grandes datasets
- Sem problema de items pulando/pulando

## 17. Upload: sem resumable -> Resumable upload (tus)

**bundle.social:** Multipart com chunks de 64 MiB (custom protocol)
**Stackpost:** tus protocol (padrao da industria)

O que e tus:
- Protocolo aberto para upload resumable
- Bibliotecas em todas linguagens (tus-js-client, tus-python, etc)
- Padrao: nao precisa inventar protocolo
- Compativel com Cloudflare R2, S3, etc

## 18. Sem SSE/WebSocket para status -> SSE para status real-time

**bundle.social:** Polling `GET /post/{id}` para saber status
**Stackpost:** SSE (Server-Sent Events) para status real-time

Como:
- `GET /post/{id}/events` (SSE)
- Eventos: `status_changed`, `platform_posted`, `platform_error`
- Dashboard atualiza em real-time sem polling

## Resumo: o que faz o Stackpost superior

| Feature | bundle.social | Stackpost |
|---------|---------------|-----------|
| OpenAPI | 3.0 | 3.1 |
| Backend | Express | Fastify (2x) |
| MCP/A2A | Nao | Sim |
| Analytics retencao | 30 dias | Indefinido |
| Auto-reconnect | Nao | Sim |
| A/B testing | Nao | Sim |
| AI caption | Nao | Sim (Nexus IA) |
| Best-time-to-post | Nao | Sim (ML) |
| Approval workflow | Nao | Sim |
| Multi-user | Nao | Sim (RBAC) |
| Cross-post adaptativo | Manual | Automatico |
| Hashtag suggestions | Nao | Sim |
| Webhook replay | Nao | Sim |
| Idempotency | Nao | Sim |
| Rate limit headers | Nao | Sim |
| Pagination | Offset | Cursor |
| Upload resumable | Custom | tus (padrao) |
| Status real-time | Polling | SSE |
