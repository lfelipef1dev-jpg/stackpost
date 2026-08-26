# AGENTS.md - Plano Stackpost

## Contexto do projeto

Construcao de uma plataforma SaaS de publicacao multi-redes-sociais (estilo bundle.social) sob o dominio expostacker.com.br. O projeto tem duas frentes:

1. **Nexus IA** (`https://nexusia.expostacker.com.br/`) - backend multi-provider de AI (chat, code, image, document, audio, video) com quotas, failover, e rotas por provider.
2. **Stackpost** (novo) - plataforma de publicacao em redes sociais baseada neste blueprint.

## Regras absolutas

1. **As quatro contas ja criadas no Nexus IA nao devem ser tocadas.** Regra absoluta do usuario.
2. Credenciais expostas durante trabalhos anteriores devem ser tratadas como comprometidas.
3. Nao iniciar novos scans VulnStrike sem autorizacao explicita.
4. Nao modificar inventarios de credenciais existentes.
5. Usar a OpenAPI spec real (`02_DADOS_EXTRAIDOS/bundle_openapi_full.json`) e a documentacao oficial (`info.bundle.social`) como fontes primarias.
6. Distinguir sempre: valor confirmado na OpenAPI vs valor da doc oficial vs valor inferido de scan vs recomendacao.

## Comandos uteis

### Regenerar o blueprint PDF
```powershell
cd "C:\Users\lfeli\Desktop\Plano Stackpost\03_SCRIPTS_EXTRACAO"
py gerar_blueprint_completo.py
# Saida: 01_BLUEPRINT_TECNICO/BLUEPRINT_MESTRE_bundle_social.pdf
```

### Re-extrair OpenAPI spec
```powershell
cd "C:\Users\lfeli\Desktop\Plano Stackpost\03_SCRIPTS_EXTRACAO"
py extract_openapi.py      # baixa swagger-json
py extract_full.py         # extrai detalhes de endpoints
py extract_everything.py   # extracao completa
```

### Verificar PDF gerado
```powershell
py -c "from pypdf import PdfReader; r=PdfReader('C:/Users/lfeli/Desktop/Plano Stackpost/01_BLUEPRINT_TECNICO/BLUEPRINT_MESTRE_bundle_social.pdf'); print('Paginas:', len(r.pages))"
```

## Stack confirmada para o projeto

- **Backend:** Node.js + NestJS + Fastify
- **Linguagem:** TypeScript (strict)
- **Banco:** PostgreSQL 16 + Drizzle ORM
- **Cache/Fila:** Redis 7 + BullMQ
- **Storage:** Cloudflare R2 (zero egress)
- **Frontend:** Next.js 15 + App Router
- **Deploy:** Docker + Coolify ou Kubernetes
- **CDN:** Cloudflare

Ver `04_STACK_E_FERRAMENTAS/STACK_RECOMENDADA.md` para alternativas e justificativa.

## Estrutura do monorepo (planejada)

Ver `06_SCAFFOLD/ESTRUTURA_PASTAS.txt`.

## Notas tecnicas

- A API bundle.social usa OpenAPI 3.0 com schemas inline (zero componentes reusaveis em `components.schemas`, apenas `securitySchemes`).
- 114 endpoints confirmados pelo scan VulnStrike.
- 15 plataformas suportadas.
- Autenticacao unica via header `x-api-key` (padrao Stripe-like com prefixo `pk_live_`).
- Publicacao e PARALELA por plataforma (Promise.allSettled) - falha em uma nao afeta outras.
- Rate limits em 3 camadas: 100/1s, 500/10s, 2000/60s por endpoint + tracker.
- Daily limits por CONTA REAL (nao por conexao/team).
- Monthly caps por ORGANIZATION (reset dia 1 UTC).
- Webhooks: 9 eventos, HMAC-SHA256, 15s timeout, 3 retries, backoff 30s exponencial, 50 concorrentes, auto-disable apos 7 dias.
- Analytics: refresh 24h, retencao 30 dias, raw por plataforma, YouTube monetizacao requer `withBusinessScope` + `rawYoutubeAnalyticsEnabled`.
