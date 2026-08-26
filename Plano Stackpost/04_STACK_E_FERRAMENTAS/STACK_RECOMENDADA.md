# Stack Recomendada - Stackpost

Analise completa de stack com alternativas, pros/contras, e justificativa de cada escolha.

## Stack final recomendada

| Camada | Escolha | Por que |
|--------|---------|---------|
| Backend framework | NestJS + Fastify | Estrutura modular (modules/providers) + performance do Fastify (2x Express) |
| Linguagem | TypeScript 5.5+ (strict) | Type safety, ecossistema, contratar devs |
| ORM | Drizzle ORM | Type-safe, SQL-first, migrations declarativas, zero overhead |
| Banco de dados | PostgreSQL 16 | JSONB, full-text search, gen_random_uuid(), particionamento |
| Cache/Fila | Redis 7 + BullMQ | Rate limits, filas persistentes, retry, scheduled jobs |
| Storage | Cloudflare R2 | S3-compativel, ZERO egress fee, integra com CDN |
| Frontend | Next.js 15 (App Router) | SSR, Server Components, streaming, Vercel ou self-host |
| UI library | shadcn/ui + Tailwind v4 | Copy-paste components, sem lock-in, dark mode nativo |
| Auth | API Key (header) + JWT opcional | Simples para API, JWT para dashboard multi-user |
| Validacao | Zod 3 | Schema inference, runtime validation, OpenAPI generation |
| Docs API | Scalar + Zod OpenAPI | Scalar UI moderna, gera spec de tipos Zod |
| SDK | gerado de OpenAPI (openapi-typescript) | TS + Python + Go automaticamente |
| Monitoring | Grafana + Loki + Prometheus | Self-hosted, gratis, completo |
| Logs | Pino (backend) + Loki | Pino e o logger Node mais rapido |
| Deploy | Docker + Coolify | Self-hosted VPS, git push = deploy, zero vendor lock-in |
| CDN/DNS | Cloudflare | Free tier, WAF, cache, R2 integration |
| Email | Resend | API moderna, 3k emails/mes free |
| Error tracking | Sentry | Free tier 5k errors/mes |

## Alternativas por camada (com pros/contras)

### Backend framework

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **NestJS + Fastify** | Modular, DI, decorators, 2x Express, OpenAPI nativo | Boilerplate, curva aprendizado | RECOMENDADO |
| Hono | Ultra leve, edge-ready, web standard | Sem DI, sem modular system, menor ecossistema | Bom para microservicos |
| Express + tRPC | Simples, tRPC type-safe end-to-end | Sem modular, tRPC nao gera OpenAPI | Bom para MVP rapido |
| Elysia (Bun) | Performance extrema, type-safe nativo | Bun ainda em maturacao, menos libs | Promissor mas arriscado |
| Fastify puro | Rapido, simples | Sem estrutura, voce monta tudo | Para devs experientes |

### ORM

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **Drizzle ORM** | SQL-first, type-safe, zero overhead, migrations declarativas | Comunidade menor que Prisma | RECOMENDADO |
| Prisma | DX excelente, studio visual, comunidade enorme | Runtime pesado, N+1 issues, menos controle SQL | Bom mas pesado |
| Kysely | Type-safe, query builder puro | Sem migrations, sem schema inference | Para quem ama SQL |
| Sequelize | Maduro, muitos adapters | API antiga, types fracos | Evitar |

### Banco de dados

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **PostgreSQL 16** | JSONB, full-text, gen_random_uuid(), particionamento, maduro | Setup/operacao | RECOMENDADO |
| CockroachDB | Distribuido, multi-regiao, Postgres-compativel | Caro, complexo | Só para escala enorme |
| MySQL 8 | Popular, simples | JSONB inferior, menos features | Evitar |
| MongoDB | Schema flexivel | Sem transacoes ACID robustas, sem joins | Errado para este use case |

### Cache/Fila

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **Redis 7 + BullMQ** | Filas persistentes, retry, scheduled, rate limit, pub/sub | Operar Redis | RECOMENDADO |
| Upstash (Redis serverless) | Serverless, pay-per-use, REST API | Latencia maior, custo escala | Bom para comecar |
| Temporal | Workflows complexos, duraveis, replay | Muito complexo, overkill | Só para workflows muito complexos |
| AWS SQS | Gerenciado, escala infinita | Sem scheduling, sem pub/sub | Se ja esta na AWS |
| RabbitMQ | Maduro, exchanges, routing | Operar, menos features que Redis para rate limit | Classico mas Redis cobre |

### Storage

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **Cloudflare R2** | S3-compativel, ZERO egress fee, CDN integrado | Menos features que S3 (lifecycle, etc) | RECOMENDADO |
| AWS S3 | Padrao, features enormes | Egress caro ($0.09/GB), custo escala | Classico mas caro |
| MinIO | Self-hosted, S3-compativel, gratis | Operar storage, backup | Para quem quer 100% self-host |
| Backblaze B2 | Barato ($0.005/GB), egress free ate 3x storage | Menos integracoes | Alternativa valida |

### Frontend

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **Next.js 15 (App Router)** | SSR, RSC, streaming, Vercel ou self-host, ecossistema | Complexidade, hidratacao parcial | RECOMENDADO |
| Remix | Web standards, nested layouts, forms | Comunidade menor, menos componentes | Bom alternativa |
| SvelteKit | Performance, bundle menor, DX excelente | Ecossistema menor, menos devs | Promissor |
| TanStack Start | Type-safe, full-stack TS | Novo, pouca adocao | Acompanhar |
| Astro | Content-focused, ilhas | Nao e SPA-first | Errado para dashboard |

### UI library

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **shadcn/ui + Tailwind v4** | Copy-paste, sem lock-in, dark mode, acessivel | Montar do zero | RECOMENDADO |
| Radix UI + Tailwind | Primitivos acessiveis, voce estiliza | Mais trabalho | Base do shadcn |
| Mantine | Completo, hooks, forms | Estilo proprio, menos flexivel | Bom para MVP rapido |
| Ant Design | Completo, empresarial | Bundle grande, estilo chinês | Evitar para SaaS moderno |
| Material UI | Google, maduro | Estilo Material, bundle grande | Classico mas datado |

### Docs API

| Opcao | Pros | Contras | Veredito |
|-------|------|---------|-----------|
| **Scalar + Zod OpenAPI** | UI moderna, dark mode, gera de Zod | Setup inicial | RECOMENDADO |
| Mintlify | Bonito, AI search, llms.txt | SaaS pago | Se tem orcamento |
| Swagger UI | Classico, gratis | UI datada | Funcional mas feio |
| Redoc | Bonito, single-page | Sem try-it-out | Bom para read-only |
| Stoplight | Design-first, visual | Caro, SaaS | Para design-driven |

## O que esta desatualizado no bundle.social (e o que usar no lugar)

Ver `O_QUE_MUDOU.md` para analise detalhada do que esta defasado.

### Resumo rapido

1. **OpenAPI 3.0 -> 3.1** - bundle usa 3.0. Use 3.1 (webhooks nativos, nullable simplificado).
2. **Express -> Fastify** - bundle provavelmente usa Express. Fastify e 2x mais rapido.
3. **Sem MCP/A2A** - bundle nao tem. Adicione MCP server para AI agents publicarem.
4. **Analytics 30 dias** - bundle so guarda 30 dias. Voce guarda indefinidamente.
5. **Sem historico de analytics** - bundle nao tem. Voce tem (cron job diario).
6. **Sem auto-reconnect** - bundle so detecta desconexao. Voce reconecta automaticamente.
7. **Sem A/B testing** - bundle nao tem. Voce tem variacoes de caption/hashtag.
8. **Sem AI caption** - bundle nao tem. Voce integra LLM (Nexus IA ja tem).
9. **Sem best-time-to-post** - bundle nao tem. Voce usa ML nos seus dados historicos.
10. **Sem approval workflow** - bundle nao tem. Voce tem rascunho -> revisao -> aprovacao -> schedule.

## Custo estimado (1000 usuarios)

| Servico | Custo/mes |
|---------|-----------|
| Cloudflare R2 (50GB) | ~$0.75 |
| PostgreSQL (Neon Pro) | ~$20 |
| Redis (Upstash Pay-as-you-go) | ~$10 |
| VPS (Hetzner CX32, 4vCPU/8GB) | ~$10 |
| Cloudflare (CDN/DNS) | $0 |
| Resend (email) | $0 (3k free) |
| Sentry | $0 (5k errors free) |
| Dominio | ~$1 |
| **TOTAL** | **~$42/mes** |

Para 10.000 usuarios: ~$200-500/mes (principalmente storage R2).
Para 100.000 usuarios: ~$2.000-5.000/mes.

## Por que nao usar X (alternativas que descartei)

### Por que nao Bun (runtime)?
- Bun e mais rapido mas ainda em maturacao. Algumas libs Node nao funcionam.
- Para SaaS production, Node.js LTS e mais seguro.
- Reavalie em 6-12 meses.

### Por que nao Prisma?
- Prisma adiciona ~3MB ao bundle e tem overhead de runtime.
- N+1 queries sao faceis de cometer.
- Drizzle e SQL-first: voce ve o SQL que roda.
- Prisma Studio e otimo mas Drizzle Studio ja existe.

### Por que nao tRPC?
- tRPC nao gera OpenAPI spec automaticamente.
- Para uma API publica (como bundle.social), OpenAPI e essencial para SDK generation.
- tRPC e otimo para dashboards internos mas nao para API product.

### Por que nao Vercel (deploy)?
- Vercel e fantastico para Next.js mas custa $20/pro e escala caro.
- Para backend (NestJS), Vercel nao e ideal (serverless functions tem cold starts).
- Coolify no Hetzner VPS ($10) da deploy automatico, git push = production, sem vendor lock-in.
- Se preferir gerenciado: Railway ou Render ($7-20/mes).

### Por que nao Supabase (Postgres)?
- Supabase e excelente mas o free tier tem pausa apos 7 dias inativo.
- Neon nao pausa no free tier e tem branching para dev.
- Para production: self-hosted Postgres no VPS ou Neon Pro ($20).
