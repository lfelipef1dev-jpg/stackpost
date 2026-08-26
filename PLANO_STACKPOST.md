# STACKPOST - PLANO PROFISSIONAL

## Visao

SaaS de gestao e postagem multi-rede, comecando pelo Instagram. Inspirado nas melhores ferramentas do mercado (Bundle.social, PostPulse, Posthive), mas com superioridade em:
- Geracao de imagem nativa no tamanho correto
- Safe zone por plataforma
- Automacao por IA (MCP)
- PIX/BRL para o mercado brasileiro

## Fase 1: MVP Instagram (meses 1-3)

Objetivo: uma pessoa consegue conectar o Instagram, criar post com imagem e texto, agendar e publicar automaticamente.

### Funcionalidades
1. Cadastro/Login
2. Conectar conta Instagram Business/Creator
3. Upload de imagem
4. Criar post com caption
5. Preview de como fica no feed e na grade
6. Agendamento
7. Publicacao imediata
8. Historico de posts
9. Dashboard basico

### Telas
1. Login
2. Dashboard
3. Conectar contas
4. Criar post
5. Calendario
6. Posts publicados
7. Configuracoes

### Stack
- Frontend: Next.js 16 + React 19 + Tailwind + shadcn/ui
- Backend: FastAPI + PostgreSQL + Redis
- Auth: Clerk ou Supabase
- OAuth Instagram: Meta Graph API
- Fila: Celery + Redis
- Storage: S3/R2

## Fase 2: + LinkedIn + Facebook (meses 4-5)

## Fase 3: + X + TikTok + Threads + YouTube (meses 6-8)

## Fase 4: + Pinterest + Bluesky + Google Business (meses 9-12)

## Arquitetura

```
[Next.js Frontend] <-> [FastAPI Backend] <-> [PostgreSQL]
                            |
                        [Redis/Celery] <-> [Publisher Worker]
                            |
                        [Meta Graph API] -> Instagram
                        [LinkedIn API]
                        [Facebook Graph API]
                        ...
```

## Diferenciais

1. Gerador de imagem 1080x1350 com safe zone
2. Preview real de feed e grade
3. AI para caption
4. MCP para agentes de IA
5. PIX/BRL

## Plano de precos

| Plano | Preco (BRL) | Inclui |
|-------|-------------|--------|
| Free | R$ 0 | 1 conta, 10 posts/mes |
| Criador | R$ 39 | 3 contas, posts ilimitados |
| Pro | R$ 79 | 10 contas, AI, analytics |
| Agency | R$ 199 | 50 contas, white-label |

## Proximos passos

1. Criar estrutura de pastas
2. Instalar dependencias
3. Criar banco de dados
4. Login com Clerk
5. Conectar Instagram OAuth
6. Criar post e publicar
