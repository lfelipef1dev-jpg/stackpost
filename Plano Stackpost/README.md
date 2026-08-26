# Plano Stackpost

Blueprint tecnico completo para construcao de uma plataforma de publicacao multi-redes-sociais superior ao bundle.social.

## Estrutura da pasta

```
Plano Stackpost/
├── README.md                          <- Voce esta aqui (indice geral)
├── AGENTS.md                          <- Regras e contexto do projeto
├── 01_BLUEPRINT_TECNICO/              <- PDFs com a analise completa
│   ├── BLUEPRINT_MESTRE_bundle_social.pdf   (47 paginas - documento final)
│   ├── RELATORIO_TECNICO_COMPLETO.pdf       (32 paginas - versao anterior)
│   └── RELATORIO_BUNDLE_SOCIAL.pdf          (relatorio original do scan)
├── 02_DADOS_EXTRAIDOS/                <- Dados crus extraidos da API
│   ├── bundle_openapi_full.json             (spec OpenAPI 3.0 - 3MB, 114 endpoints)
│   ├── openapi_details.txt                  (detalhes de todos endpoints)
│   ├── openapi_FULL.txt                     (extracao completa + schemas)
│   └── post_schema.txt                      (schema do POST /post isolado)
├── 03_SCRIPTS_EXTRACAO/               <- Scripts Python que geraram os dados
│   ├── extract_openapi.py                   (baixa swagger-json)
│   ├── extract_full.py                      (extrai todos endpoints)
│   ├── extract_post_schema.py               (extrai schema do post)
│   ├── extract_everything.py                (extracao completa)
│   ├── gerar_blueprint_mestre.py            (classe PDF base)
│   ├── gerar_blueprint_completo.py          (gera o PDF mestre - 47 pag)
│   └── gerar_relatorio_tecnico.py           (gera PDF versao anterior)
├── 04_STACK_E_FERRAMENTAS/            <- Analise de stack + o que mudou
│   ├── STACK_RECOMENDADA.md                 (stack com alternativas e pros/contras)
│   └── O_QUE_MUDOU.md                       (desatualizado vs bundle.social)
├── 05_PLANO_IMPLEMENTACAO/            <- Roadmap com milestones
│   └── PLANO.md                             (fases, prioridade, ordem)
└── 06_SCAFFOLD/                       <- Configuracao inicial do projeto
    ├── package.json                         (deps do backend)
    ├── docker-compose.yml                   (Postgres + Redis + app)
    ├── .env.example                         (variaveis de ambiente)
    └── ESTRUTURA_PASTAS.txt                 (layout do monorepo)
```

## Como usar

1. **Leia primeiro:** `01_BLUEPRINT_TECNICO/BLUEPRINT_MESTRE_bundle_social.pdf`
   - Documento final com todos os valores reais, limites, fluxo, etc.
2. **Stack:** `04_STACK_E_FERRAMENTAS/STACK_RECOMENDADA.md`
   - O que usar e por que (com alternativas)
3. **Plano:** `05_PLANO_IMPLEMENTACAO/PLANO.md`
   - Ordem de implementacao por prioridade
4. **Comecar:** `06_SCAFFOLD/`
   - `cp .env.example .env` -> editar -> `docker-compose up -d`

## Fontes dos dados

- OpenAPI spec real: `https://api.bundle.social/swagger-json` (114 endpoints)
- Documentacao oficial: `https://info.bundle.social` (markdown pages)
- Scan VulnStrike: correlacao com artifacts do scanner custom

## Resumo do que foi documentado

- 114 endpoints da API bundle.social
- 15 plataformas suportadas (Instagram, TikTok, YouTube, Facebook, Twitter/X, Threads, LinkedIn, Pinterest, Reddit, Mastodon, Discord, Slack, Bluesky, Google Business, Snapchat)
- Limites de midia por plataforma (resolucao, duracao, aspect ratio, bitrate, tamanho)
- Fluxo completo de postagem (5 fases: request -> validacao -> agendamento -> publisher paralelo -> pos-publicacao)
- Sistema de upload (4 metodos: simple, direct, multipart, from-url)
- Rate limits (3 camadas API + diario por conta real + mensal por org)
- Webhooks (9 eventos, delivery, retries, auto-disable)
- Erros padronizados (errorsVerbose com code, userFacingMessage, isTransient)
- Analytics (refresh 24h, retencao 30 dias, raw por plataforma)
- Comments API (11 plataformas)
- Imports (post history, CSV, reviews)
- Misc endpoints (editar/deletar posts, playlists, mentions, locations)
- Schema PostgreSQL completo (9 tabelas)
- Stack recomendada + alternativas
- Cron jobs (11 jobs)
- Roadmap (4 fases)
- Custo de infraestrutura (~$40-140/mes para 1000 usuarios)
- Checklist final de implementacao

## Status

- [x] Extracao OpenAPI completa
- [x] Extracao documentacao oficial
- [x] Blueprint tecnico PDF (47 paginas)
- [x] Organizacao em pasta estruturada
- [x] Stack recomendada com alternativas
- [x] Plano de implementacao
- [x] Scaffold inicial
- [ ] Implementacao do backend
- [ ] Implementacao do frontend
- [ ] Testes com contas reais
