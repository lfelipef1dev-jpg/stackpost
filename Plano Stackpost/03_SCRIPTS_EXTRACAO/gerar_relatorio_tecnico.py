"""
Gerador do Relatorio Tecnico Completo - bundle.social
Cruza dados do scan VulnStrike + OpenAPI spec real + PDF existente
Gera PDF tecnico para enviar a outro PC e montar site superior
"""
from fpdf import FPDF
import json

class PDF(FPDF):
    def header(self):
        self.set_fill_color(15, 23, 42)
        self.rect(0, 0, 210, 25, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 10)
        self.cell(0, 8, 'ANALISE TECNICA COMPLETA - bundle.social', 0, 1, 'L')
        self.set_font('Arial', 'I', 7)
        self.cell(0, 5, 'Engenharia Reversa + OpenAPI Real + Scan VulnStrike | Documento confidencial', 0, 1, 'L')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_text_color(100)
        self.set_font('Arial', 'I', 7)
        self.cell(0, 10, f'Pagina {self.page_no()}/{{nb}} - bundle.social Blueprint', 0, 0, 'C')

    def section_title(self, title):
        self.ln(3)
        self.set_fill_color(30, 41, 59)
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 11)
        self.cell(0, 7, f'  {title}', 0, 1, 'L', fill=True)
        self.ln(2)

    def subsection(self, title):
        self.ln(2)
        self.set_text_color(59, 130, 246)
        self.set_font('Arial', 'B', 9)
        self.cell(0, 5, title, 0, 1, 'L')
        self.set_text_color(0)

    def body(self, text, font_size=8):
        self.set_font('Arial', '', font_size)
        self.multi_cell(0, 4, text)
        self.ln(1)

    def code_block(self, text):
        self.set_fill_color(245, 245, 245)
        self.set_font('Courier', '', 7)
        x = self.get_x()
        y = self.get_y()
        self.multi_cell(0, 4, text, fill=True)
        self.ln(2)

    def table_row(self, col1, col2, col3='', col4='', header=False):
        is4 = bool(col4)
        if header:
            self.set_fill_color(30, 41, 59)
            self.set_text_color(255)
            self.set_font('Arial', 'B', 7)
        else:
            self.set_fill_color(255 if self.page_no() % 2 == 0 else 248)
            self.set_text_color(0)
            self.set_font('Arial', '', 7)
        if is4:
            w1, w2, w3, w4 = 45, 35, 35, 35
            self.cell(w1, 5, col1[:40], 0, 0, 'L', fill=True)
            self.cell(w2, 5, col2[:30], 0, 0, 'L', fill=True)
            self.cell(w3, 5, col3[:30], 0, 0, 'L', fill=True)
            self.cell(w4, 5, col4[:30], 0, 1, 'L', fill=True)
        elif col3:
            w1, w2, w3 = 60, 50, 70
            self.cell(w1, 5, col1[:50], 0, 0, 'L', fill=True)
            self.cell(w2, 5, col2[:45], 0, 0, 'L', fill=True)
            self.cell(w3, 5, col3[:40], 0, 1, 'L', fill=True)
        else:
            w1, w2 = 80, 90
            self.cell(w1, 5, col1[:50], 0, 0, 'L', fill=True)
            self.cell(w2, 5, col2[:80], 0, 1, 'L', fill=True)

pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_page()

# ============ PAGINA 1: RESUMO ============
pdf.section_title('1. RESUMO EXECUTIVO')
pdf.body(
    'bundle.social e uma API unificada (middleware) para postar, agendar, analisar e moderar '
    'conteudo em 15 redes sociais atraves de uma unica integracao REST.\n\n'
    'Dados oficiais extraidos da OpenAPI spec publica (https://api.bundle.social/swagger-json):\n'
    '- 114 endpoints REST\n'
    '- 15 plataformas suportadas\n'
    '- Autenticacao: API Key (header x-api-key, prefixo pk_live_)\n'
    '- Spec: OpenAPI 3.0\n'
    '- Server: https://api.bundle.social (producao) + http://localhost:3001 (dev)\n'
    '- Tags: app, organization, team, socialAccount, upload, post, postImport, analytics, comment, misc, postCSV\n\n'
    'Dados do scan VulnStrike (25/08/2026):\n'
    '- WAF: Cloudflare\n'
    '- Portas: 80, 443, 8080, 8443 (todas Cloudflare proxy)\n'
    '- Frontend: Next.js (SPA com _next/static/chunks)\n'
    '- DBMS: Nao detectado (backend protegido)\n'
    '- openapi.json exposto (307 redirect)\n'
    '- Missing Security Headers (CSP, X-XSS, X-Content-Type, X-Frame-Options)\n'
    '- 42 segredos basic_auth_url em JS (falsos positivos - polyfills Next.js)\n'
    '- Scan morreu na fase 8/15 - 7 fases nao rodaram'
)

pdf.subsection('URLs e Endpoints Oficiais')
pdf.body(
    'Site: https://bundle.social\n'
    'API: https://api.bundle.social\n'
    'Docs: https://docs.bundle.social\n'
    'OpenAPI JSON: https://api.bundle.social/swagger-json\n'
    'OpenAPI YAML: https://api.bundle.social/swagger-yaml\n'
    'SDK GitHub: github.com/bundleglobal/bundlesocial-node\n'
    'Status: bundlesocial.betteruptime.com\n'
    'Info: info.bundle.social\n'
    'Contact: contact@bundle.social\n'
    'Terms: https://bundle.social/terms'
)

# ============ MODELO DE NEGOCIO ============
pdf.add_page()
pdf.section_title('2. MODELO DE NEGOCIO')
pdf.body('Cobranca por ORGANIZACAO (nao por conta conectada). 3 contas = 3.000 contas no mesmo preco.')

pdf.subsection('Planos')
pdf.table_row('Plano', 'Preco', 'Posts/mes', header=True)
pdf.table_row('FREE', '$0', '20')
pdf.table_row('PRO', '$100/mes', '10.000')
pdf.table_row('BUSINESS', '$400/mes', '100.000')
pdf.table_row('CUSTOM', 'Sob consulta', 'Custom')
pdf.ln(2)
pdf.table_row('Plano', 'Comentarios/mes', 'Contas sociais', header=True)
pdf.table_row('FREE', '50', '3')
pdf.table_row('PRO', '5.000', 'Ilimitado')
pdf.table_row('BUSINESS', '50.000', 'Ilimitado')
pdf.ln(2)
pdf.body('Uploads/mes: FREE=200 | PRO=100.000 | BUSINESS=1.000.000')
pdf.body('Contagem: Por data de CRIACAO no mes UTC. Rascunhos nao contam. Falhas NAO devolvem cota. Reset dia 1 (UTC).')

# ============ ARQUITETURA ============
pdf.add_page()
pdf.section_title('3. ARQUITETURA TECNICA')

pdf.subsection('3.1 Hierarquia Multi-tenant')
pdf.body(
    'Organization (conta)\n'
    '  |- API Keys (compartilhadas entre todos os teams)\n'
    '  |- Webhooks (compartilhados entre todos os teams)\n'
    '  |- Subscription & Billing\n'
    '  |- Team A (ex: "Marketing")\n'
    '  |   |- Social Accounts (Instagram, TikTok, ...)\n'
    '  |   |- Posts\n'
    '  |   |- Uploads\n'
    '  |- Team B (ex: "Cliente: Acme Corp")\n'
    '  |   |- Social Accounts\n'
    '  |   |- Posts\n'
    '  |   |- Uploads\n\n'
    'REGRA CRITICA: Rate limits sao por TEAM. Post caps mensais sao por ORGANIZATION.\n'
    'Para SaaS onde cada cliente precisa suas proprias contas, crie um TEAM por cliente.'
)

pdf.subsection('3.2 Stack Tecnologico (inferido do scan + OpenAPI)')
pdf.table_row('Componente', 'Tecnologia', 'Evidencia', header=True)
pdf.table_row('Backend API', 'Node.js + Express/Nest', 'SDK TypeScript, OpenAPI 3.0, REST')
pdf.table_row('Linguagem SDK', 'TypeScript', 'package.json: typescript ^5.4.5')
pdf.table_row('Geracao cliente', '@hey-api/openapi-ts', 'devDeps')
pdf.table_row('Testes SDK', 'Jest', 'jest.config.ts, ts-jest')
pdf.table_row('Release SDK', 'semantic-release', '.releaserc')
pdf.table_row('Storage midia', 'S3-compativel', 'Presigned URLs, multipart')
pdf.table_row('Banco dados', 'PostgreSQL (provavel)', 'IDs: post_abc, team_xyz, sa_789')
pdf.table_row('Cache/Rate limit', 'Redis (provavel)', '3 camadas, contador por endpoint')
pdf.table_row('Webhooks', 'Fila assincrona (BullMQ/SQS)', 'Retries exponenciais, 50 concorrentes')
pdf.table_row('Status page', 'BetterStack', 'bundlesocial.betteruptime.com')
pdf.table_row('Frontend', 'Next.js (confirmado)', '_next/static/chunks no scan')
pdf.table_row('WAF/CDN', 'Cloudflare (confirmado)', 'Nmap: Cloudflare http proxy')
pdf.table_row('Auth', 'API Key (x-api-key)', 'OpenAPI securitySchemes')
pdf.table_row('Spec', 'OpenAPI 3.0', 'swagger-json publico')
pdf.table_row('MCP Server', 'Model Context Protocol', 'bundlesocial-mcp')
pdf.table_row('CLI', 'Node.js CLI', 'bundlesocial-cli, JSON in/out')

# ============ AUTENTICACAO ============
pdf.add_page()
pdf.section_title('4. AUTENTICACAO E SEGURANCA')

pdf.subsection('4.1 API Key (cliente -> bundle.social)')
pdf.body(
    'Header unico: x-api-key\n'
    'Prefixo: pk_live_... (padrao Stripe-like)\n'
    '401 = sem chave | 403 = chave invalida\n'
    'Chaves sao org-level: uma chave da acesso a todos os teams da organizacao.\n'
    'Sem OAuth2, sem JWT para o cliente final.'
)

pdf.subsection('4.2 OAuth (bundle.social -> plataformas sociais)')
pdf.body(
    'Fluxo Hosted (recomendado):\n'
    '1. Cliente chama POST /social-account/create-portal-link\n'
    '2. bundle.social abre portal que gerencia OAuth UI + selecao de canal + idioma\n'
    '3. Usuario conclui e e redirecionado de volta\n\n'
    'Fluxo Custom UI:\n'
    '1. Cliente chama POST /social-account/connect (gera OAuth URL)\n'
    '2. Redireciona usuario para OAuth da plataforma\n'
    '3. Callback retorna para bundle.social\n'
    '4. POST /social-account/set-channel (seleciona Page/canal/local)\n'
    '5. POST /social-account/refresh-channels (atualiza lista)'
)

pdf.subsection('4.3 Token Management')
pdf.body(
    'bundle.social armazena: accessToken, refreshToken, secret, expiresAt\n'
    'Esses campos NUNCA aparecem em webhooks ou respostas publicas.\n'
    'Renovacao automatica de tokens.\n'
    'Deteccao de desconexao remota a cada 6h (Meta: FB, IG, Threads).\n'
    'POST /social-account/connection-check valida token manualmente.'
)

pdf.subsection('4.4 Webhook Signature')
pdf.body(
    'Header x-signature: HMAC-SHA256\n'
    'Verificacao com Signing Secret (crypto.timingSafeEqual)\n'
    'User-Agent enviado: "bundlesocial"'
)

# ============ ENDPOINTS COMPLETOS ============
pdf.add_page()
pdf.section_title('5. ENDPOINTS COMPLETOS (114 total - extraidos da OpenAPI)')

pdf.subsection('5.1 Posts (tag: post)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/post/', 'GET', 'Listar posts de um team')
pdf.table_row('/api/v1/post/', 'POST', 'Criar post (rascunho/agendado/imediato)')
pdf.table_row('/api/v1/post/{id}', 'GET', 'Detalhes de um post')
pdf.table_row('/api/v1/post/{id}', 'PATCH', 'Atualizar post (antes de publicar)')
pdf.table_row('/api/v1/post/{id}', 'DELETE', 'Deletar post')
pdf.table_row('/api/v1/post/{id}/retry', 'POST', 'Re-tentar publicacao de post falho')
pdf.table_row('/api/v1/post/reference-key/{referenceKey}', 'GET', 'Buscar post por referenceKey')
pdf.table_row('/api/v1/post/reconnect-social-account', 'POST', 'Re-anexar conta a posts orfãos')
pdf.table_row('/api/v1/post/reconnect-social-account/candidates', 'GET', 'Listar candidatos a reconexao')

pdf.subsection('5.2 Uploads (tag: upload)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/upload/', 'GET', 'Listar uploads')
pdf.table_row('/api/v1/upload/', 'POST', 'Simple upload (multipart/form-data, ate 90MB)')
pdf.table_row('/api/v1/upload/', 'DELETE', 'Deletar varios uploads')
pdf.table_row('/api/v1/upload/{id}', 'GET', 'Detalhes de upload')
pdf.table_row('/api/v1/upload/{id}', 'DELETE', 'Deletar upload')
pdf.table_row('/api/v1/upload/init', 'POST', 'Direct upload - presigned URL (ate 5GiB)')
pdf.table_row('/api/v1/upload/finalize', 'POST', 'Finalizar direct upload')
pdf.table_row('/api/v1/upload/from-url', 'POST', 'Registrar midia de URL publica (ate 1GB)')
pdf.table_row('/api/v1/upload/multipart/init', 'POST', 'Iniciar multipart (retorna URLs por parte)')
pdf.table_row('/api/v1/upload/multipart/sign', 'POST', 'Re-assinar partes expiradas')
pdf.table_row('/api/v1/upload/multipart/complete', 'POST', 'Juntar partes e registrar')
pdf.table_row('/api/v1/upload/multipart/abort', 'POST', 'Cancelar multipart upload')

pdf.subsection('5.3 Social Accounts (tag: socialAccount)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/social-account/by-type', 'GET', 'Listar contas por tipo')
pdf.table_row('/api/v1/social-account/connect', 'POST', 'Gerar OAuth URL (custom UI)')
pdf.table_row('/api/v1/social-account/create-portal-link', 'POST', 'Criar hosted connect link')
pdf.table_row('/api/v1/social-account/connection-check', 'POST', 'Validar token manualmente')
pdf.table_row('/api/v1/social-account/copy', 'POST', 'Copiar contas entre teams')
pdf.table_row('/api/v1/social-account/disconnect', 'DELETE', 'Desconectar conta')
pdf.table_row('/api/v1/social-account/refresh-channels', 'POST', 'Atualizar lista de canais')
pdf.table_row('/api/v1/social-account/set-channel', 'POST', 'Selecionar canal (Page/canal/local)')
pdf.table_row('/api/v1/social-account/unset-channel', 'POST', 'Remover canal selecionado')
pdf.table_row('/api/v1/social-account/profile-refresh', 'POST', 'Refresh perfil da conta')
pdf.table_row('/api/v1/social-account/to-delete', 'GET', 'Listar contas marcadas para deletar')

pdf.add_page()
pdf.subsection('5.4 Analytics (tag: analytics)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/analytics/post', 'GET', 'Analytics de post (normalizado)')
pdf.table_row('/api/v1/analytics/post/raw', 'GET', 'Analytics bruto por plataforma')
pdf.table_row('/api/v1/analytics/post/force', 'POST', 'Forcar refresh de post')
pdf.table_row('/api/v1/analytics/post/bulk', 'GET', 'Analytics em massa (max 60, pag 20)')
pdf.table_row('/api/v1/analytics/social-account', 'GET', 'Analytics de conta (normalizado)')
pdf.table_row('/api/v1/analytics/social-account/raw', 'GET', 'Analytics bruto de conta')
pdf.table_row('/api/v1/analytics/social-account/force', 'POST', 'Forcar refresh de conta')

pdf.subsection('5.5 Comments (tag: comment)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/comment/', 'GET', 'Listar comentarios (paginado)')
pdf.table_row('/api/v1/comment/', 'POST', 'Criar comentario/resposta')
pdf.table_row('/api/v1/comment/{id}', 'GET', 'Detalhes de comentario')
pdf.table_row('/api/v1/comment/{id}', 'PATCH', 'Atualizar comentario')
pdf.table_row('/api/v1/comment/{id}', 'DELETE', 'Deletar comentario')
pdf.table_row('/api/v1/comment/{id}/retry', 'POST', 'Re-tentar comentario falho')
pdf.table_row('/api/v1/comment/import', 'POST', 'Iniciar import de comentarios (async)')
pdf.table_row('/api/v1/comment/import', 'GET', 'Listar imports de comentarios')
pdf.table_row('/api/v1/comment/import/{importId}', 'GET', 'Status de import')
pdf.table_row('/api/v1/comment/import/comments', 'GET', 'Comentarios importados (paginado)')
pdf.table_row('/api/v1/comment/import/comments/{commentId}/action', 'POST', 'Acao em comentario importado')

pdf.subsection('5.6 Organization, Team, Import (tags: organization, team, postImport, postCSV)')
pdf.table_row('Endpoint', 'Metodo', 'Funcao', header=True)
pdf.table_row('/api/v1/', 'GET', 'Health check + status por plataforma')
pdf.table_row('/api/v1/organization/', 'GET', 'Dados da organizacao')
pdf.table_row('/api/v1/organization/usage/daily-limits', 'GET', 'Uso diario por conta')
pdf.table_row('/api/v1/organization/usage/posts', 'GET', 'Uso de posts')
pdf.table_row('/api/v1/organization/usage/comments', 'GET', 'Uso de comentarios')
pdf.table_row('/api/v1/organization/usage/uploads', 'GET', 'Uso de uploads')
pdf.table_row('/api/v1/organization/usage/imports', 'GET', 'Uso de imports')
pdf.table_row('/api/v1/team/', 'GET/POST', 'Listar/criar teams')
pdf.table_row('/api/v1/team/{id}', 'GET/PATCH/DELETE', 'Detalhes/atualizar/deletar team')
pdf.table_row('/api/v1/post-csv-import/', 'POST/GET', 'Import via CSV (async)')
pdf.table_row('/api/v1/post-csv-import/{importId}', 'GET', 'Status de import CSV')
pdf.table_row('/api/v1/post-csv-import/{importId}/rows', 'GET', 'Linhas do CSV')
pdf.table_row('/api/v1/post-csv-import/{importId}/status', 'GET', 'Status detalhado')
pdf.table_row('/api/v1/post-history-import/', 'POST/GET', 'Importar historico (async)')
pdf.table_row('/api/v1/post-history-import/posts', 'GET/DELETE', 'Posts importados')
pdf.table_row('/api/v1/post-history-import/{importId}/retry', 'POST', 'Re-tentar import')

pdf.add_page()
pdf.subsection('5.7 Misc Endpoints (tag: misc - operacoes por plataforma)')
pdf.body('Endpoints auxiliares por plataforma para moderacao, edicao e features especificas:')
pdf.table_row('Plataforma', 'Operacoes', '', header=True)
pdf.table_row('Facebook', 'PATCH/DELETE comment, PATCH/DELETE post, recommendations, token-debug', '')
pdf.table_row('Instagram', 'DELETE comment, audio search, locations, tags', '')
pdf.table_row('TikTok', 'DELETE comment, CML trending-list', '')
pdf.table_row('YouTube', 'PATCH/DELETE comment, video, playlist, thumbnail, regions, categories', '')
pdf.table_row('LinkedIn', 'PATCH/DELETE comment, PATCH/DELETE post, reshare, mentions', '')
pdf.table_row('Twitter/X', 'DELETE tweet', '')
pdf.table_row('Threads', '(via misc - edicao)', '')
pdf.table_row('Reddit', 'PATCH/DELETE comment, PATCH/DELETE post, post-requirements, subreddit-flairs', '')
pdf.table_row('Pinterest', 'PATCH/DELETE pin', '')
pdf.table_row('Mastodon', 'PATCH/DELETE comment, PATCH/DELETE status', '')
pdf.table_row('Bluesky', 'DELETE comment, DELETE post', '')
pdf.table_row('Discord', 'DELETE message', '')
pdf.table_row('Slack', 'PATCH/DELETE message', '')
pdf.table_row('Google Business', 'location, media, reviews, posts, attributes, hours, food-menus', '')

# ============ SCHEMA DO POST ============
pdf.add_page()
pdf.section_title('6. SCHEMA COMPLETO DO POST (POST /api/v1/post/)')
pdf.body('Este e o objeto central. O campo "data" e chaveado por plataforma. Cada plataforma recebe seus proprios campos.')

pdf.subsection('6.1 Campos Obrigatorios (top-level)')
pdf.body(
    'teamId: string (obrigatorio)\n'
    'title: string, minLength=1 (obrigatorio)\n'
    'postDate: string ISO 8601 (obrigatorio)\n'
    'status: "DRAFT" | "SCHEDULED" (obrigatorio)\n'
    'socialAccountTypes: array, minItems=1 (obrigatorio)\n'
    'data: objeto com overrides por plataforma (obrigatorio)\n'
    'referenceKey: string, maxLength=128 (opcional)\n'
    'firstComment: objeto com primeiro comentario por plataforma (opcional)'
)

pdf.subsection('6.2 Enum: socialAccountTypes (15 plataformas)')
pdf.body('TIKTOK | YOUTUBE | INSTAGRAM | FACEBOOK | TWITTER | THREADS | LINKEDIN | PINTEREST | REDDIT | MASTODON | DISCORD | SLACK | BLUESKY | GOOGLE_BUSINESS | SNAPCHAT')

# ============ FORMATO POR PLATAFORMA ============
pdf.add_page()
pdf.section_title('7. FORMATO DE POST POR PLATAFORMA (data.PLATFORM)')

pdf.subsection('7.1 TWITTER / X (data.TWITTER)')
pdf.body(
    'CAMPOS:\n'
    '- text: string (ate 280 chars)\n'
    '- uploadIds: array de strings (ate 4 imagens OU 1 video)\n'
    '- replySettings: enum [EVERYONE, FOLLOWING, MENTIONED_USERS, SUBSCRIBERS, VERIFIED]\n'
    '- isAiGenerated: boolean (default false) - adiciona label "made with AI" do X\n\n'
    'REGRAS:\n'
    '- Sem analytics via API\n'
    '- Sem set-channel (OAuth direto)\n'
    '- Sem comentarios via API\n'
    '- isAiGenerated obrigatorio se conteudo for AI'
)

pdf.subsection('7.2 INSTAGRAM (data.INSTAGRAM)')
pdf.body(
    'CAMPOS:\n'
    '- type: enum [POST, REEL, STORY] (default: POST)\n'
    '- text: string (caption)\n'
    '- uploadIds: array de strings\n'
    '- altText: string (texto alternativo para imagem unica)\n'
    '- thumbnailOffset: number (frame do video como capa, em ms)\n'
    '- thumbnail: string (URL de imagem no bundle.social)\n'
    '- shareToFeed: boolean (default true) - Reels: aparece no Feed + Reels ou so Reels\n'
    '- collaborators: array de strings (usernames)\n'
    '- autoFitImage: boolean (default false)\n'
    '- autoCropImage: boolean (default false)\n'
    '- tagged: array [{username, x(0-1), y(0-1)}] - marca pessoas na foto\n'
    '- carouselItems: array [{uploadId, altText, tagged[]}] - carrossel multi-imagem\n'
    '- locationId: string (ID de localizacao do Instagram)\n'
    '- trialParams: {graduationStrategy: MANUAL|SS_PERFORMANCE} - Reels trial para nao-seguidores\n'
    '- isPaidPartnership: boolean (default false) - label "Paid partnership"\n'
    '- brandedContentSponsors: array max 2 usernames (max 30 chars cada)\n'
    '- musicSoundInfo: {musicSoundId, musicSoundVolume(0-100), videoOriginalSoundVolume(0-100)}\n'
    '- isAiGenerated: boolean (default false) - label AI do Instagram\n\n'
    'REGRAS:\n'
    '- OAuth via Meta Graph API\n'
    '- set-channel obrigatorio (selecionar conta IG)\n'
    '- Reels suportam musica via audio_id\n'
    '- Aspect ratio 4:5 a 1.91:1\n'
    '- firstComment maxLength: 2200'
)

pdf.add_page()
pdf.subsection('7.3 FACEBOOK (data.FACEBOOK)')
pdf.body(
    'CAMPOS:\n'
    '- type: enum [POST, REEL, STORY] (default: POST)\n'
    '- text: string\n'
    '- uploadIds: array de strings\n'
    '- mediaItems: array [{uploadId, altText}] - midia com alt text\n'
    '- link: string (URL, so para type=POST)\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- mediaTitle: string (titulo para video, so POST com video)\n'
    '- nativeScheduleTime: ISO 8601 (agendar direto no Meta, max 30 dias futuro)\n\n'
    'REGRAS:\n'
    '- OAuth via Meta Graph API (Page token)\n'
    '- set-channel obrigatorio (selecionar Page)\n'
    '- Token expiration e a dor principal\n'
    '- firstComment maxLength: 8000'
)

pdf.subsection('7.4 TIKTOK (data.TIKTOK)')
pdf.body(
    'CAMPOS:\n'
    '- type: enum [VIDEO, IMAGE] (default: VIDEO)\n'
    '- text: string (caption)\n'
    '- uploadIds: array de strings\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- privacy: enum [SELF_ONLY, PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, FOLLOWER_OF_CREATOR]\n'
    '- photoCoverIndex: integer (default 0, min 0) - capa para posts de foto\n'
    '- isBrandContent: boolean (default false) - parceria terceiro\n'
    '- isOrganicBrandContent: boolean (default false) - promover proprio negocio\n'
    '- disableComments: boolean (default false)\n'
    '- disableDuet: boolean (default false)\n'
    '- disableStitch: boolean (default false)\n'
    '- thumbnailOffset: number (frame capa em ms)\n'
    '- isAiGenerated: boolean (default false)\n'
    '- autoAddMusic: boolean (default false) - adiciona musica automatica em fotos\n'
    '- autoScale: boolean (default false)\n'
    '- uploadToDraft: boolean (default false) - salvar como rascunho\n'
    '- musicSoundInfo: {musicSoundId, musicSoundVolume(0-100), musicSoundStart(ms), musicSoundEnd(ms), videoOriginalSoundVolume(0-100)}\n'
    '  musicSoundId = song_clip_id do CML trending list\n\n'
    'REGRAS:\n'
    '- OAuth direto (sem set-channel)\n'
    '- Comentarios suportados via API\n'
    '- Analytics suportado\n'
    '- firstComment maxLength: 150'
)

pdf.add_page()
pdf.subsection('7.5 YOUTUBE (data.YOUTUBE)')
pdf.body(
    'CAMPOS:\n'
    '- type: enum [VIDEO, SHORT] (default: SHORT)\n'
    '- uploadIds: array de strings\n'
    '- text: string (titulo - sempre obrigatorio)\n'
    '- description: string (descricao do video)\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- privacy: enum [PRIVATE, PUBLIC, UNLISTED]\n'
    '- defaultLanguage: string (BCP-47, max 35 chars) - idioma titulo/descricao\n'
    '- defaultAudioLanguage: string (BCP-47, max 35 chars) - idioma audio\n'
    '- madeForKids: boolean (default false) - OBRIGATORIO\n'
    '- containsSyntheticMedia: boolean (default false) - conteudo AI\n'
    '- hasPaidProductPlacement: boolean (default false)\n\n'
    'REGRAS:\n'
    '- OAuth via YouTube Data API v3\n'
    '- set-channel obrigatorio (selecionar canal)\n'
    '- Videos ate 4h e 5GB\n'
    '- 10.000 units/dia (free tier Google)\n'
    '- firstComment maxLength: 10000\n'
    '- Playlists suportadas via /misc/youtube/playlist'
)

pdf.subsection('7.6 LINKEDIN (data.LINKEDIN)')
pdf.body(
    'CAMPOS:\n'
    '- text: string (OBRIGATORIO, ate 3000 chars)\n'
    '- uploadIds: array de strings\n'
    '- link: string (URL para article preview)\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- mediaTitle: string (titulo para video/documento)\n'
    '- privacy: enum [CONNECTIONS, PUBLIC, LOGGED_IN, CONTAINER]\n'
    '- hideFromFeed: boolean (default false)\n'
    '- disableReshare: boolean (default false)\n\n'
    'REGRAS:\n'
    '- OAuth via LinkedIn Marketing API\n'
    '- set-channel obrigatorio (perfil ou Company Page)\n'
    '- URNs para Company Pages\n'
    '- firstComment maxLength: 1250\n'
    '- Mentions suportadas via /misc/linkedin/mentions'
)

pdf.add_page()
pdf.subsection('7.7 THREADS (data.THREADS)')
pdf.body(
    'CAMPOS:\n'
    '- text: string (ate 500 chars)\n'
    '- uploadIds: array de strings (ate 10 imagens)\n'
    '- mediaItems: array [{uploadId, altText}]\n'
    '- topicTag: string\n'
    '- replyControl: enum [everyone, accounts_you_follow, mentioned_only, parent_post_author_only, followers_only]\n'
    '- linkAttachment: string\n'
    '- poll: {optionA, optionB, optionC?, optionD?} - enquete (min 2 opcoes)\n'
    '- gif: {gifId, provider: GIPHY}\n'
    '- allowlistedCountryCodes: array de strings\n'
    '- crosspostToInstagramStory: boolean\n'
    '- crosspostToInstagramStoryDarkMode: boolean\n\n'
    'REGRAS:\n'
    '- OAuth via Meta (mesmo ecossistema FB/IG)\n'
    '- Sem set-channel (OAuth direto)\n'
    '- firstComment maxLength: 500\n'
    '- Comentarios suportados\n'
    '- Analytics suportado'
)

pdf.subsection('7.8 BLUESKY (data.BLUESKY)')
pdf.body(
    'CAMPOS:\n'
    '- text: string (ate 300 chars)\n'
    '- uploadIds: array de strings (4 imgs ou 1 video)\n'
    '- tags: array max 8 (hashtags sem #)\n'
    '- labels: array enum [!no-unauthenticated, porn, sexual, nudity, graphic-media] - content warnings\n'
    '- quoteUri: string (AT-URI do post citado, pattern: ^at://\\S+, max 512)\n'
    '- externalUrl: string (URI, link card)\n'
    '- externalTitle: string (titulo do card)\n'
    '- externalDescription: string (descricao do card)\n'
    '- thumbnail: string (URI, max 2048) - URL imagem publica no bundle.social\n'
    '- videoAlt: string (max 10000) - alt text do video\n\n'
    'REGRAS:\n'
    '- OAuth via AT Protocol\n'
    '- serverUrl opcional (default: https://bsky.social, pode usar PDS/entryway custom)\n'
    '- Sem set-channel\n'
    '- firstComment maxLength: 300'
)

pdf.add_page()
pdf.subsection('7.9 MASTODON (data.MASTODON)')
pdf.body(
    'CAMPOS:\n'
    '- text: string (depende da instancia)\n'
    '- uploadIds: array de strings\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- privacy: enum [PUBLIC, UNLISTED, PRIVATE, DIRECT]\n'
    '- spoiler: string (texto de spoiler/content warning)\n\n'
    'REGRAS:\n'
    '- OAuth via Mastodon API (instancia custom)\n'
    '- serverUrl OBRIGATORIO no /connect (ex: https://mastodon.social)\n'
    '- Sem set-channel\n'
    '- firstComment maxLength: 500\n'
    '- Comentarios suportados\n'
    '- Analytics basico'
)

pdf.subsection('7.10 PINTEREST (data.PINTEREST)')
pdf.body(
    'CAMPOS:\n'
    '- text: string\n'
    '- description: string\n'
    '- boardName: string (OBRIGATORIO)\n'
    '- uploadIds: array de strings\n'
    '- thumbnail: string (URL imagem no bundle.social)\n'
    '- link: string (URL para qual o Pin linka)\n'
    '- altText: string (acessibilidade)\n'
    '- note: string (nota privada, nao visivel publicamente)\n'
    '- dominantColor: string (cor dominante da imagem)\n'
    '- isAiGenerated: boolean (default false) - label AI do Pinterest\n\n'
    'REGRAS:\n'
    '- OAuth via Pinterest API v5\n'
    '- Sem set-channel (boards refresh automatico)\n'
    '- Sem comentarios via API\n'
    '- Analytics suportado'
)

pdf.subsection('7.11 REDDIT (data.REDDIT)')
pdf.body(
    'CAMPOS:\n'
    '- sr: string (OBRIGATORIO) - subreddit name (ex: r/subredditName ou u/username)\n'
    '- text: string (OBRIGATORIO)\n'
    '- description: string\n'
    '- uploadIds: array de strings\n'
    '- link: string (URL do post link)\n'
    '- nsfw: boolean (default false)\n'
    '- flairId: string (obrigatorio se subreddit exigir flair)\n\n'
    'REGRAS:\n'
    '- OAuth via Reddit API\n'
    '- Sem set-channel\n'
    '- Comentarios suportados\n'
    '- Analytics limitado\n'
    '- firstComment maxLength: 10000\n'
    '- post-requirements e subreddit-flairs via /misc/reddit'
)

pdf.add_page()
pdf.subsection('7.12 DISCORD (data.DISCORD)')
pdf.body(
    'CAMPOS:\n'
    '- channelId: string (OBRIGATORIO)\n'
    '- text: string\n'
    '- uploadIds: array de strings\n'
    '- username: string (nome exibido como autor)\n'
    '- avatarUrl: string (avatar exibido como autor)\n\n'
    'REGRAS:\n'
    '- OAuth via webhook URL\n'
    '- Sem set-channel\n'
    '- Comentarios suportados (mensagens)\n'
    '- Sem analytics\n'
    '- firstComment maxLength: 2000'
)

pdf.subsection('7.13 SLACK (data.SLACK)')
pdf.body(
    'CAMPOS:\n'
    '- channelId: string (OBRIGATORIO)\n'
    '- text: string\n'
    '- uploadIds: array de strings\n'
    '- username: string (nome exibido)\n'
    '- avatarUrl: string (avatar exibido)\n\n'
    'REGRAS:\n'
    '- OAuth via webhook URL\n'
    '- Sem set-channel\n'
    '- Comentarios suportados (mensagens)\n'
    '- Sem analytics\n'
    '- firstComment maxLength: 30000'
)

pdf.subsection('7.14 GOOGLE_BUSINESS (data.GOOGLE_BUSINESS)')
pdf.body(
    'CAMPOS:\n'
    '- text: string\n'
    '- uploadIds: array de strings (imagens/videos)\n'
    '- topicType: enum [STANDARD, EVENT, OFFER, ALERT] (default: STANDARD)\n'
    '- languageCode: string (ex: en, en-US)\n'
    '- callToActionType: enum [BOOK, ORDER, SHOP, LEARN_MORE, SIGN_UP, CALL]\n'
    '- callToActionUrl: string\n'
    '- eventTitle: string (se topicType=EVENT)\n'
    '- eventStartDate: ISO 8601\n'
    '- eventEndDate: ISO 8601\n'
    '- offerCouponCode: string (se topicType=OFFER)\n'
    '- offerRedeemOnlineUrl: string\n'
    '- offerTermsConditions: string\n'
    '- alertType: enum [COVID_19] (default: COVID_19, se topicType=ALERT)\n\n'
    'REGRAS:\n'
    '- OAuth via Google My Business API\n'
    '- set-channel obrigatorio (selecionar local/business)\n'
    '- Sem comentarios via API\n'
    '- Analytics suportado\n'
    '- Reviews suportadas via /misc/google-business/reviews\n'
    '- Location management completo via /misc/google-business/location'
)

pdf.subsection('7.15 SNAPCHAT (data.SNAPCHAT)')
pdf.body(
    'CAMPOS:\n'
    '- type: enum [STORY, SPOTLIGHT] (default: STORY)\n'
    '- uploadIds: array de strings\n'
    '- text: string\n'
    '- description: string\n'
    '- locale: string\n'
    '- skipSaveToProfile: boolean (default false)\n\n'
    'REGRAS:\n'
    '- OAuth via Snapchat Marketing API (snapkit.com)\n'
    '- Sem set-channel\n'
    '- Sem comentarios via API\n'
    '- Analytics suportado'
)

# ============ FIRST COMMENT LIMITS ============
pdf.add_page()
pdf.section_title('8. LIMITES DE FIRST COMMENT POR PLATAFORMA')
pdf.table_row('Plataforma', 'maxLength', '', header=True)
pdf.table_row('TIKTOK', '150', '')
pdf.table_row('YOUTUBE', '10000', '')
pdf.table_row('INSTAGRAM', '2200', '')
pdf.table_row('FACEBOOK', '8000', '')
pdf.table_row('THREADS', '500', '')
pdf.table_row('LINKEDIN', '1250', '')
pdf.table_row('REDDIT', '10000', '')
pdf.table_row('MASTODON', '500', '')
pdf.table_row('DISCORD', '2000', '')
pdf.table_row('SLACK', '30000', '')
pdf.table_row('BLUESKY', '300', '')
pdf.body('TWITTER, PINTEREST, GOOGLE_BUSINESS, SNAPCHAT: firstComment nao suportado')

# ============ UPLOAD ============
pdf.add_page()
pdf.section_title('9. SISTEMA DE UPLOAD (3 estrategias)')

pdf.subsection('9.1 Simple Upload (imagens, <90MB)')
pdf.body(
    'POST /api/v1/upload/\n'
    'Content-Type: multipart/form-data\n'
    'Fields: teamId (string, opcional), file (binary)\n'
    'Retorna: upload.id\n'
    'Unico endpoint que usa multipart/form-data'
)

pdf.subsection('9.2 Direct Upload (ate 5GiB)')
pdf.body(
    '1. POST /api/v1/upload/init -> retorna {url, path}\n'
    '2. PUT <url> --upload-file video.mp4 (direto no storage, presigned URL)\n'
    '   URL presigned expira em 30min\n'
    '3. POST /api/v1/upload/finalize -> {teamId?, path} -> retorna upload.id'
)

pdf.subsection('9.3 Multipart Upload (videos grandes, retryable)')
pdf.body(
    '1. POST /api/v1/upload/multipart/init -> {uploadId, parts: [{url}]}\n'
    '   Chunks de 64MiB cada\n'
    '   URLs presigned expiram em 6h\n'
    '2. PUT <part1.url> --upload-file chunk1 (cada parte independente)\n'
    '3. PUT <part2.url> --upload-file chunk2\n'
    '4. Se uma parte falhar: POST /api/v1/upload/multipart/sign {partNumbers: [3]}\n'
    '   Re-assina apenas as partes que falharam (partes ja enviadas mantem ETags)\n'
    '5. POST /api/v1/upload/multipart/complete -> junta partes, retorna upload.id\n'
    '   Enviar ETag de cada parte\n'
    '6. POST /api/v1/upload/multipart/abort -> cancela (se desistir)'
)

pdf.subsection('9.4 Upload from URL')
pdf.body(
    'POST /api/v1/upload/from-url\n'
    'Body: {teamId?, url} (URL publica, ate 1GB)\n'
    'bundle.social faz fetch server-side da URL\n'
    'Util quando midia ja esta em CDN/S3'
)

# ============ RATE LIMITS ============
pdf.add_page()
pdf.section_title('10. RATE LIMITS E COTAS')

pdf.subsection('10.1 Rate Limits da API (3 camadas)')
pdf.table_row('Camada', 'Janela', 'Max Requests', header=True)
pdf.table_row('Burst', '1 segundo', '100')
pdf.table_row('Short', '10 segundos', '500')
pdf.table_row('Minute', '1 minuto', '2000')
pdf.body(
    'Implementacao: Contadores por endpoint + por tracker (API key ou IP).\n'
    'Trafego em POST /post nao consome bucket de GET /analytics.\n'
    'Resposta 429 quando excedido.'
)

pdf.subsection('10.2 Limites Diarios por Plataforma (por conta conectada)')
pdf.table_row('Plataforma', 'FREE', 'PRO', 'BUSINESS', header=True)
pdf.table_row('Twitter/X', '5', '15', '15')
pdf.table_row('Facebook', '10', '50', '100')
pdf.table_row('Instagram', '10', '50', '100')
pdf.table_row('LinkedIn', '10', '18', '24')
pdf.table_row('YouTube', '10', '10', '15')
pdf.table_row('TikTok', '5', '10', '15')
pdf.table_row('Threads', '10', '200', '250')
pdf.table_row('Pinterest', '10', '24', '36')
pdf.table_row('Reddit', '10', '24', '36')
pdf.table_row('Discord', '10', '100', '200')
pdf.table_row('Slack', '10', '100', '200')
pdf.table_row('Mastodon', '10', '50', '100')
pdf.table_row('Bluesky', '10', '50', '100')
pdf.table_row('Google Business', '10', '20', '40')
pdf.table_row('Snapchat', '5', '20', '40')
pdf.body(
    'REGRA CHAVE: A cota segue a CONTA REAL (platform + account id), nao a conexao.\n'
    'Mesma conta TikTok em 5 teams = 10/day total (nao 50). Contas diferentes = cotas independentes.'
)

pdf.subsection('10.3 Force Refresh Analytics')
pdf.body('Formula: max force refreshes/dia = numero_de_teams x 5\nEx: 10 teams = 50 refreshes/dia. Exceder = 429.')

# ============ WEBHOOKS ============
pdf.add_page()
pdf.section_title('11. WEBHOOKS E EVENTOS')

pdf.subsection('11.1 Eventos Suportados')
pdf.table_row('Evento', 'Quando dispara', '', header=True)
pdf.table_row('post.published', 'Post terminou (POSTED ou ERROR)', '')
pdf.table_row('comment.published', 'Comentario terminou (POSTED ou ERROR)', '')
pdf.table_row('social-account.created', 'Usuario conectou nova conta', '')
pdf.table_row('social-account.updated', 'Conta mudou (canal removido, desconexao)', '')
pdf.table_row('social-account.deleted', 'Conta desconectada/removida', '')
pdf.table_row('team.created', 'Novo team criado', '')
pdf.table_row('team.updated', 'Detalhes do team mudaram', '')
pdf.table_row('team.deleted', 'Team deletado', '')

pdf.subsection('11.2 Estrutura do Payload')
pdf.code_block(
    '{\n'
    '  "type": "post.published",\n'
    '  "data": {\n'
    '    "id": "post_abc123",\n'
    '    "status": "POSTED", // ou "ERROR"\n'
    '    "postDate": "2026-01-15T10:00:00.000Z",\n'
    '    "postedDate": "2026-01-15T10:00:02.341Z",\n'
    '    "teamId": "team_xyz",\n'
    '    "organizationId": "org_123",\n'
    '    "data": { "INSTAGRAM": { ... } },\n'
    '    "error": null,\n'
    '    "errorsVerbose": null,\n'
    '    "externalData": {\n'
    '      "INSTAGRAM": {\n'
    '        "id": "17900000000000000",\n'
    '        "permalink": "https://instagram.com/p/example/"\n'
    '      }\n'
    '    },\n'
    '    "retryCount": 0,\n'
    '    "uploads": [...],\n'
    '    "socialAccounts": [...]\n'
    '  }\n'
    '}'
)

pdf.subsection('11.3 Headers Enviados')
pdf.table_row('Header', 'Valor', '', header=True)
pdf.table_row('Content-Type', 'application/json', '')
pdf.table_row('User-Agent', 'bundlesocial', '')
pdf.table_row('x-signature', 'HMAC-SHA256 (verificar com Signing Secret)', '')

pdf.subsection('11.4 Delivery e Retries')
pdf.table_row('Configuracao', 'Valor', '', header=True)
pdf.table_row('Timeout', '15 segundos por request', '')
pdf.table_row('Max tentativas', '3 (inicial + 2 retries)', '')
pdf.table_row('Backoff', 'Exponencial, comecando em 30s', '')
pdf.table_row('Concorrencia', 'Ate 50 deliveries simultaneos', '')
pdf.table_row('Auto-disable', '7 dias sem sucesso = desativado', '')

# ============ SISTEMA DE ERROS ============
pdf.add_page()
pdf.section_title('12. SISTEMA DE ERROS PADRONIZADO')

pdf.subsection('12.1 Estrutura')
pdf.code_block(
    '{\n'
    '  "errorsVerbose": {\n'
    '    "INSTAGRAM": {\n'
    '      "code": "META:190",\n'
    '      "userFacingMessage": "Seu token expirou. Reconecte.",\n'
    '      "errorMessage": "OAuthException: Validate permission failed.",\n'
    '      "isTransient": false\n'
    '    },\n'
    '    "TIKTOK": null // Sucesso!\n'
    '  }\n'
    '}'
)

pdf.subsection('12.2 Prefixos por Plataforma')
pdf.table_row('Prefixo', 'Plataforma', '', header=True)
pdf.table_row('META', 'Instagram, Facebook, Threads', '')
pdf.table_row('TT', 'TikTok', '')
pdf.table_row('LI', 'LinkedIn', '')
pdf.table_row('YT', 'YouTube', '')
pdf.table_row('HTTP', 'Erros genericos de API', '')

pdf.subsection('12.3 Transient vs Non-Transient')
pdf.body(
    'Transient (true): Rate limits, timeouts. Acao: retry com backoff exponencial.\n'
    'Non-Transient (false): Auth errors, validacao. Acao: pedir usuario para corrigir.'
)

pdf.subsection('12.4 Erros Canonicos Comuns (Meta)')
pdf.table_row('Error key', 'Causa', '', header=True)
pdf.table_row('account_connection_expired', 'Token/sessao invalidado', '')
pdf.table_row('page_or_target_inaccessible', 'Page nao acessivel', '')
pdf.table_row('media_fetch_failed', 'Crawler bloqueado (403)', '')
pdf.table_row('account_authorization_revoked', 'App authorization removida', '')
pdf.table_row('posting_rate_limited', 'Limite de frequencia/spam', '')
pdf.table_row('identity_confirmation_required', 'Confirmar identidade no app', '')
pdf.table_row('missing_platform_permission', 'Permissoes de Page revogadas', '')
pdf.table_row('account_security_limited', 'Conta limitada por seguranca', '')
pdf.table_row('platform_login_required', 'Checkpoint de login', '')

# ============ DATA RETENTION ============
pdf.section_title('13. DATA RETENTION')
pdf.table_row('Tipo de dado', 'Retencao', '', header=True)
pdf.table_row('Analytics (parsed + raw)', '30 dias', '')
pdf.table_row('Webhook events', '7 dias', '')
pdf.table_row('Uploads deletados', '7 dias apos delecao', '')
pdf.table_row('Uploads nao usados', 'Soft-delete 90 dias + 7 dias', '')
pdf.table_row('Posts importados', '30 dias', '')
pdf.body('REGRA DE OURO: Se precisa de historico longo, armazene voce mesmo. Cron job diario que busca analytics e salva no seu banco.')

# ============ BLUEPRINT ============
pdf.add_page()
pdf.section_title('14. BLUEPRINT PARA CONSTRUIR ALTERNATIVA SUPERIOR')

pdf.subsection('14.1 Stack Recomendada')
pdf.table_row('Camada', 'bundle.social', 'Recomendado (superior)', header=True)
pdf.table_row('Backend', 'Node.js + Express/Nest', 'Node.js + NestJS + Fastify')
pdf.table_row('Linguagem', 'TypeScript', 'TypeScript (strict mode)')
pdf.table_row('Banco', 'PostgreSQL', 'PostgreSQL 16 + Prisma/Drizzle')
pdf.table_row('Cache', 'Redis', 'Redis 7 + Upstash (serverless)')
pdf.table_row('Fila', 'BullMQ/SQS', 'BullMQ + Redis ou Temporal')
pdf.table_row('Storage', 'S3-compativel', 'Cloudflare R2 (zero egress) ou MinIO')
pdf.table_row('Frontend', 'Next.js', 'Next.js 15 + App Router + Server Components')
pdf.table_row('Auth', 'API Key', 'API Key + JWT opcional + RBAC granular')
pdf.table_row('Docs', 'Mintlify/custom', 'Mintlify ou Fuma (com llms.txt)')
pdf.table_row('Spec', 'OpenAPI 3.0', 'OpenAPI 3.1 + Zod schemas')
pdf.table_row('SDK', 'TypeScript', 'TS + Python + Go (gerar de OpenAPI)')
pdf.table_row('Monitoring', 'BetterStack', 'Grafana + Loki + Prometheus')
pdf.table_row('Deploy', 'Desconhecido', 'Docker + Coolify ou Kubernetes')
pdf.table_row('CDN', 'Cloudflare', 'Cloudflare (free tier)')
pdf.table_row('MCP', 'Sim', 'Sim + A2A (Agent-to-Agent)')

pdf.subsection('14.2 Modelo de Dados PostgreSQL')
pdf.code_block(
    '-- Hierarquia: Organization > Team > SocialAccount\n\n'
    'CREATE TABLE organizations (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'org_\' || gen_random_uuid(),\n'
    '  name TEXT NOT NULL,\n'
    '  plan TEXT DEFAULT \'FREE\',\n'
    '  subscription_status TEXT,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE teams (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'team_\' || gen_random_uuid(),\n'
    '  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,\n'
    '  name TEXT NOT NULL,\n'
    '  avatar_url TEXT,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE api_keys (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'key_\' || gen_random_uuid(),\n'
    '  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,\n'
    '  key_hash TEXT NOT NULL, -- bcrypt/sha256 do pk_live_...\n'
    '  prefix TEXT, -- pk_live_xxxx (identificacao)\n'
    '  last_used_at TIMESTAMPTZ,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE social_accounts (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'sa_\' || gen_random_uuid(),\n'
    '  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,\n'
    '  type TEXT NOT NULL, -- INSTAGRAM, TIKTOK, etc\n'
    '  username TEXT, display_name TEXT, external_id TEXT,\n'
    '  access_token TEXT, -- ENCRYPTADO!\n'
    '  refresh_token TEXT, -- ENCRYPTADO!\n'
    '  token_expires_at TIMESTAMPTZ,\n'
    '  channel_id TEXT, channel_data JSONB,\n'
    '  status TEXT DEFAULT \'ACTIVE\',\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE posts (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'post_\' || gen_random_uuid(),\n'
    '  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,\n'
    '  title TEXT, status TEXT DEFAULT \'DRAFT\',\n'
    '  post_date TIMESTAMPTZ, posted_date TIMESTAMPTZ,\n'
    '  data JSONB NOT NULL, -- { INSTAGRAM: {...}, TIKTOK: {...} }\n'
    '  external_data JSONB, error TEXT, errors_verbose JSONB,\n'
    '  retry_count INT DEFAULT 0,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW(),\n'
    '  updated_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE uploads (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'upload_\' || gen_random_uuid(),\n'
    '  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,\n'
    '  file_name TEXT NOT NULL, mime_type TEXT NOT NULL,\n'
    '  size BIGINT, storage_path TEXT NOT NULL,\n'
    '  status TEXT DEFAULT \'ACTIVE\', deleted_at TIMESTAMPTZ,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE webhooks (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'wh_\' || gen_random_uuid(),\n'
    '  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,\n'
    '  url TEXT NOT NULL, signing_secret TEXT NOT NULL,\n'
    '  status TEXT DEFAULT \'ACTIVE\', last_success_at TIMESTAMPTZ,\n'
    '  failure_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE webhook_events (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'ev_\' || gen_random_uuid(),\n'
    '  webhook_id TEXT REFERENCES webhooks(id) ON DELETE CASCADE,\n'
    '  type TEXT NOT NULL, payload JSONB NOT NULL,\n'
    '  status TEXT, response_code INT, attempts INT DEFAULT 0,\n'
    '  next_retry_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE analytics_snapshots (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'an_\' || gen_random_uuid(),\n'
    '  social_account_id TEXT REFERENCES social_accounts(id) ON DELETE CASCADE,\n'
    '  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,\n'
    '  platform_type TEXT NOT NULL, metrics JSONB NOT NULL,\n'
    '  raw JSONB, forced BOOLEAN DEFAULT FALSE,\n'
    '  fetched_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n\n'
    'CREATE TABLE usage_counters (\n'
    '  id TEXT PRIMARY KEY DEFAULT \'uc_\' || gen_random_uuid(),\n'
    '  organization_id TEXT REFERENCES organizations(id),\n'
    '  team_id TEXT REFERENCES teams(id),\n'
    '  counter_type TEXT NOT NULL, -- posts|comments|uploads|imports\n'
    '  period TEXT NOT NULL, -- 2026-01 ou 2026-01-15\n'
    '  used INT DEFAULT 0,\n'
    '  UNIQUE(team_id, counter_type, period)\n'
    ');'
)

# ============ PUBLISHING PIPELINE ============
pdf.add_page()
pdf.section_title('15. PUBLISHING PIPELINE (roteamento)')
pdf.body(
    'O coracao do produto. Um post pode ir para N plataformas simultaneamente,\n'
    'cada uma com seu proprio fluxo, timeout e modo de falha.\n\n'
    'FLUXO:\n'
    '1. [Cliente] POST /api/v1/post/ -> valida API key, rate limit (3 camadas)\n'
    '2. [Post Service] salva no DB como SCHEDULED\n'
    '3. [Scheduler (BullMQ)] agenda job para postDate\n'
    '4. (quando postDate chega) [Publisher Worker]\n'
    '   Para cada plataforma em data: (PARALELO, cada um independente)\n'
    '   +-- Instagram Publisher -> Meta Graph API -> sucesso/erro\n'
    '   +-- TikTok Publisher -> TikTok Content API -> sucesso/erro\n'
    '   +-- YouTube Publisher -> YouTube Data API v3 -> sucesso/erro\n'
    '   +-- ... (15 adapters)\n'
    '5. [Resultado agregado]\n'
    '   +-- atualiza post.status (POSTED se todos OK, ERROR se algum falhou)\n'
    '   +-- salva externalData (IDs/permalinks retornados)\n'
    '   +-- dispara webhook post.published\n'
    '   +-- se erro transient -> agenda retry\n'
    '   +-- se erro non-transient -> marca ERROR, notifica'
)

pdf.subsection('15.1 Interface PlatformAdapter (padrao Strategy)')
pdf.code_block(
    'interface PlatformAdapter {\n'
    '  getAuthUrl(state: string, options?: OAuthOptions): string;\n'
    '  handleCallback(code: string): Promise<TokenSet>;\n'
    '  refreshToken(refreshToken: string): Promise<TokenSet>;\n'
    '  getChannels(tokenSet: TokenSet): Promise<Channel[]>;\n'
    '  publish(post: PostData, account: SocialAccount): Promise<PublishResult>;\n'
    '  getAnalytics(account: SocialAccount, postId?: string): Promise<Analytics>;\n'
    '  validateConnection(account: SocialAccount): Promise<boolean>;\n'
    '}\n\n'
    '// Implementacoes necessarias:\n'
    '// - InstagramAdapter (Meta Graph API)\n'
    '// - FacebookAdapter (Meta Graph API, Page token)\n'
    '// - TikTokAdapter (TikTok Content API)\n'
    '// - YouTubeAdapter (YouTube Data API v3)\n'
    '// - LinkedInAdapter (LinkedIn Marketing API)\n'
    '// - TwitterAdapter (X API v2)\n'
    '// - ThreadsAdapter (Threads API)\n'
    '// - BlueskyAdapter (AT Protocol)\n'
    '// - MastodonAdapter (Mastodon API, instancia custom)\n'
    '// - PinterestAdapter (Pinterest API v5)\n'
    '// - RedditAdapter (Reddit API)\n'
    '// - DiscordAdapter (webhook URL)\n'
    '// - SlackAdapter (webhook URL)\n'
    '// - GoogleBusinessAdapter (Google My Business API)\n'
    '// - SnapchatAdapter (Snapchat Marketing API)'
)

pdf.subsection('15.2 Rate Limiter (3 camadas com Redis)')
pdf.code_block(
    'async function rateLimiter(req, reply, done) {\n'
    '  const tracker = req.headers[\'x-api-key\'] || req.ip;\n'
    '  const endpoint = `${req.method}:${req.routeOptions.url}`;\n'
    '  const now = Date.now();\n'
    '  const windows = [\n'
    '    { key: `${tracker}:${endpoint}:1s`, limit: 100, ttl: 1 },\n'
    '    { key: `${tracker}:${endpoint}:10s`, limit: 500, ttl: 10 },\n'
    '    { key: `${tracker}:${endpoint}:60s`, limit: 2000, ttl: 60 },\n'
    '  ];\n'
    '  for (const w of windows) {\n'
    '    const count = await redis.incr(w.key);\n'
    '    if (count === 1) await redis.expire(w.key, w.ttl);\n'
    '    if (count > w.limit) {\n'
    '      return reply.code(429).send({\n'
    '        error: \'RATE_LIMITED\',\n'
    '        window: w.ttl + \'s\',\n'
    '        limit: w.limit\n'
    '      });\n'
    '    }\n'
    '  }\n'
    '  done();\n'
    '}'
)

# ============ WEBHOOK WORKER ============
pdf.add_page()
pdf.section_title('16. WEBHOOK DELIVERY WORKER')
pdf.code_block(
    'async function webhookWorker(event: WebhookEvent) {\n'
    '  const webhook = await getWebhook(event.webhookId);\n'
    '  if (webhook.status === \'DISABLED\') return;\n'
    '  const payload = JSON.stringify({ type: event.type, data: event.payload });\n'
    '  const signature = hmacSHA256(payload, webhook.signing_secret);\n'
    '  try {\n'
    '    const res = await fetch(webhook.url, {\n'
    '      method: \'POST\',\n'
    '      headers: {\n'
    '        \'Content-Type\': \'application/json\',\n'
    '        \'User-Agent\': \'yourapp\',\n'
    '        \'x-signature\': signature\n'
    '      },\n'
    '      body: payload,\n'
    '      signal: AbortSignal.timeout(15000) // 15s timeout\n'
    '    });\n'
    '    if (res.ok) {\n'
    '      await markDelivered(event.id);\n'
    '      await resetFailureCount(webhook.id);\n'
    '    } else { throw new Error(`HTTP ${res.status}`); }\n'
    '  } catch (err) {\n'
    '    await incrementAttempts(event.id);\n'
    '    if (event.attempts < 3) {\n'
    '      const delay = 30 * Math.pow(3, event.attempts - 1);\n'
    '      await scheduleRetry(event.id, delay);\n'
    '    } else {\n'
    '      await markFailed(event.id);\n'
    '      await incrementFailureCount(webhook.id);\n'
    '      if (daysSinceLastSuccess(webhook.id) >= 7) {\n'
    '        await disableWebhook(webhook.id);\n'
    '        await notifyOwner(webhook.organizationId);\n'
    '      }\n'
    '    }\n'
    '  }\n'
    '}'
)

# ============ CRON JOBS ============
pdf.section_title('17. CRON JOBS NECESSARIOS')
pdf.table_row('Job', 'Frequencia', 'Funcao', header=True)
pdf.table_row('Analytics refresh', 'A cada 24h', 'Buscar analytics de todas as contas')
pdf.table_row('Connection check (Meta)', 'A cada 6h', 'Validar tokens Meta (FB, IG, Threads)')
pdf.table_row('Token refresh', 'Proativo', 'Renovar tokens prestes a expirar')
pdf.table_row('Stale upload cleanup', 'Diario', 'Soft-delete uploads nao usados ha 90 dias')
pdf.table_row('Deleted upload purge', 'Diario', 'Remover fisicamente uploads deletados ha 7 dias')
pdf.table_row('Analytics purge', 'Diario', 'Deletar analytics com 30 dias')
pdf.table_row('Webhook events purge', 'Diario', 'Deletar eventos com 7 dias')
pdf.table_row('Imported posts purge', 'Diario', 'Deletar posts importados com 30 dias')
pdf.table_row('Monthly counter reset', 'Dia 1 (UTC)', 'Zerar contadores mensais de uso')
pdf.table_row('Webhook auto-disable check', 'Diario', 'Desativar webhooks sem sucesso ha 7 dias')

# ============ MELHORIAS ============
pdf.add_page()
pdf.section_title('18. MELHORIAS PARA SUPERAR BUNDLE.SOCIAL')
pdf.table_row('Area', 'bundle.social', 'Sua versao (superior)', header=True)
pdf.table_row('Retencao analytics', '30 dias (limite duro)', 'Configuravel: 30/90/365/infinito')
pdf.table_row('Webhook retries', '3 tentativas, 30s backoff', '5 tentativas + dead-letter queue')
pdf.table_row('Webhook auto-disable', '7 dias sem sucesso', 'Configuravel + alertas antes')
pdf.table_row('SDKs', 'TypeScript apenas', 'TS + Python + Go + PHP + Ruby')
pdf.table_row('MCP', 'Sim (Claude/Cursor)', 'MCP + A2A + OpenAI function calling')
pdf.table_row('Rate limit headers', 'Nao documentado', 'X-RateLimit-Limit/Remaining/Reset')
pdf.table_row('Dashboard', 'Web only', 'Web + mobile app (React Native)')
pdf.table_row('Analytics historico', 'Cliente que se vire', 'Data warehouse (ClickHouse)')
pdf.table_row('Multi-idioma', 'Ingles', 'PT-BR, EN, ES nativo no OAuth')
pdf.table_row('White-label', 'Menciona mas nao detalha', 'Full: dominio proprio, logo, cores')
pdf.table_row('Storage', 'S3 (com egress)', 'Cloudflare R2 (zero egress) ou MinIO')
pdf.table_row('Observabilidade', 'BetterStack externo', 'Grafana + Loki + Prometheus')
pdf.table_row('Pricing', '4 tiers fixos', '4 tiers + pay-as-you-go + self-hosted')
pdf.table_row('Compliance', 'Nao mencionado', 'LGPD/GDPR + data residency')
pdf.table_row('AI agents', 'MCP server', 'MCP + webhooks + batch AI posting')
pdf.table_row('Bulk operations', 'CSV apenas', 'CSV + JSON + API batch + webhook-triggered')
pdf.table_row('Real-time', 'Webhooks apenas', 'WebSocket + SSE + webhooks (3 opcoes)')
pdf.table_row('Self-host', 'Nao', 'Docker compose + Coolify')

# ============ ROADMAP ============
pdf.add_page()
pdf.section_title('19. PLANO DE EXECUCAO (roadmap)')

pdf.subsection('Fase 1 - Fundacao (semanas 1-3)')
pdf.body(
    '1. Setup: Node.js + NestJS + Fastify + Prisma + PostgreSQL + Redis\n'
    '2. Schema do banco + migracoes\n'
    '3. Auth: API keys com hash bcrypt, middleware de validacao\n'
    '4. CRUD: organizations, teams, api_keys\n'
    '5. Rate limiting (3 camadas com Redis)\n'
    '6. Health endpoint (/api/v1)'
)

pdf.subsection('Fase 2 - Plataformas iniciais (semanas 4-7)')
pdf.body(
    '1. Interface PlatformAdapter (padrao Strategy)\n'
    '2. 3 plataformas: Instagram, Facebook, X/Twitter\n'
    '3. Fluxo OAuth hosted (connect-link) + custom UI\n'
    '4. Channel selection (set-channel para Meta)\n'
    '5. Publisher worker (BullMQ) - publica em paralelo\n'
    '6. Sistema de erros padronizado (code, userFacingMessage, isTransient)'
)

pdf.subsection('Fase 3 - Midia e publishing (semanas 8-10)')
pdf.body(
    '1. Upload simple (multipart/form-data)\n'
    '2. Upload direct (presigned URL)\n'
    '3. Upload multipart (chunks de 64MiB, retryable)\n'
    '4. Upload from-url (fetch server-side)\n'
    '5. Mais 4 plataformas: TikTok, YouTube, LinkedIn, Threads\n'
    '6. Scheduler de posts (agenda para postDate)'
)

pdf.subsection('Fase 4 - Analytics e webhooks (semanas 11-13)')
pdf.body(
    '1. Analytics adapter por plataforma (metrics normalizadas)\n'
    '2. Raw analytics (payload bruto)\n'
    '3. Force refresh (rate limited: teams x 5)\n'
    '4. Cron de refresh automatico (24h)\n'
    '5. Webhooks: cadastro, signing secret, HMAC-SHA256\n'
    '6. Webhook delivery worker (3 retries, backoff, auto-disable)\n'
    '7. Eventos: post.published, comment.published, social-account.*, team.*'
)

pdf.subsection('Fase 5 - Restante + extras (semanas 14-18)')
pdf.body(
    '1. 8 plataformas: Pinterest, Reddit, Discord, Slack, Mastodon, Bluesky, Google Business, Snapchat\n'
    '2. Comments API (importar e criar)\n'
    '3. Post history import (async job)\n'
    '4. Bulk post from CSV\n'
    '5. Link in bio\n'
    '6. Calendar view no dashboard'
)

pdf.subsection('Fase 6 - Dashboard + SDK + docs (semanas 19-22)')
pdf.body(
    '1. Dashboard Next.js 15: org, teams, contas, posts, calendar, analytics\n'
    '2. Dark mode + multi-idioma (PT-BR, EN, ES)\n'
    '3. SDK TypeScript (openapi-ts)\n'
    '4. SDK Python + Go\n'
    '5. CLI (JSON in/out)\n'
    '6. MCP server (Claude/Cursor)\n'
    '7. Docs (Mintlify + llms.txt + Swagger UI)'
)

pdf.subsection('Fase 7 - Deploy e operacao (semanas 23-24)')
pdf.body(
    '1. Docker compose para self-host\n'
    '2. Deploy em VPS (Coolify) ou Kubernetes\n'
    '3. Cloudflare (CDN + WAF + SSL)\n'
    '4. Storage: Cloudflare R2 (zero egress)\n'
    '5. Monitoring: Grafana + Loki + Prometheus\n'
    '6. Status page publico\n'
    '7. Backup automatico do PostgreSQL\n'
    '8. Testes E2E + load testing'
)

# ============ INFRA ============
pdf.add_page()
pdf.section_title('20. INFRAESTRUTURA E CUSTO')

pdf.subsection('20.1 Custo Estimado Mensal (self-host)')
pdf.table_row('Componente', 'Opcao', 'Custo/mes', header=True)
pdf.table_row('VPS (backend+workers)', 'Hetzner CX32 (8vCPU, 16GB)', '~$15')
pdf.table_row('VPS (PostgreSQL)', 'Hetzner CX22 (4vCPU, 8GB)', '~$10')
pdf.table_row('Redis', 'Upstash free ou self-host', '$0-10')
pdf.table_row('Storage midia', 'Cloudflare R2 (10GB free + $0.015/GB)', '~$0-15')
pdf.table_row('CDN/DNS', 'Cloudflare free', '$0')
pdf.table_row('Status page', 'BetterStack free ou Uptime Kuma', '$0')
pdf.table_row('Email transacional', 'Resend free (3000/mes)', '$0')
pdf.table_row('Dominio', '.com ou .social', '~$1-3')
pdf.table_row('Monitoring', 'Grafana self-host', '$0')
pdf.table_row('Backup', 'B2 Backblaze ($0.006/GB)', '~$2-5')
pdf.table_row('TOTAL', '', '~$28-58/mes')

pdf.subsection('20.2 API Keys Necessarias por Plataforma')
pdf.table_row('Plataforma', 'Onde registrar', 'Custo', header=True)
pdf.table_row('Facebook/Instagram', 'developers.facebook.com', 'Gratis (review p/ prod)')
pdf.table_row('X/Twitter', 'developer.x.com', 'Free limitado; pago p/ volume')
pdf.table_row('TikTok', 'developers.tiktok.com', 'Gratis')
pdf.table_row('YouTube', 'Google Cloud Console', 'Gratis (10.000 units/dia)')
pdf.table_row('LinkedIn', 'developer.linkedin.com', 'Gratis (review Marketing API)')
pdf.table_row('Threads', 'developers.threads.com', 'Gratis')
pdf.table_row('Pinterest', 'developers.pinterest.com', 'Gratis')
pdf.table_row('Reddit', 'reddit.com/prefs/apps', 'Gratis')
pdf.table_row('Discord', 'discord.com/developers', 'Gratis (webhook)')
pdf.table_row('Slack', 'api.slack.com/apps', 'Gratis (webhook)')
pdf.table_row('Mastodon', 'Cada instancia ou self-host', 'Gratis')
pdf.table_row('Bluesky', 'bsky.social/settings/app-password', 'Gratis')
pdf.table_row('Google Business', 'Google Cloud Console (GMB API)', 'Gratis')
pdf.table_row('Snapchat', 'snapkit.com', 'Gratis (review)')

# ============ SCAN VULNSTRIKE ============
pdf.add_page()
pdf.section_title('21. DADOS DO SCAN VULNSTRIKE (25/08/2026)')

pdf.subsection('21.1 Fingerprinting')
pdf.body(
    'Alvo: https://bundle.social\n'
    'WAF: Cloudflare (confirmado via Nmap + fingerprinting)\n'
    'DBMS: Desconhecido (backend protegido pelo Cloudflare)\n'
    'Tech Stack: Next.js (confirmado via _next/static/chunks)\n'
    'Server: Cloudflare http proxy\n'
    'Confianca DBMS: 0.0'
)

pdf.subsection('21.2 Nmap (40s)')
pdf.body(
    'Porta 80/tcp - http Cloudflare http proxy\n'
    'Porta 443/tcp - http Cloudflare http proxy\n'
    'Porta 8080/tcp - http Cloudflare http proxy\n'
    'Porta 8443/tcp - http Cloudflare http proxy\n'
    'Total: 4 portas abertas'
)

pdf.subsection('21.3 Spider (28s)')
pdf.body(
    '1 URL descoberta (https://bundle.social)\n'
    '0 com parametros | 0 forms | 1 arquivo exposto (robots.txt)\n'
    'BUG: Browser Spider quebrou (coroutine object has no attribute get)\n'
    'BUG: Deteccao CMS quebrou (mesmo erro)\n'
    'Auto-auth: nenhuma pagina de login encontrada'
)

pdf.subsection('21.4 Fuzzing (19s) - 364 paths')
pdf.body(
    'BASELINE 404: 65394 bytes | BASELINE HOME: 401763 bytes\n\n'
    'ENDPOINTS ENCONTRADOS (200/307):\n'
    '- openapi.json (307) - api_docs\n'
    '- sitemap.xml (200)\n'
    '- robots.txt (200)\n'
    '- .well-known/security.txt (200)\n\n'
    '403 RESTRITO (10 paths):\n'
    '- wp-config.php, wp-config.php.bak/.old/.orig\n'
    '- bootstrap/cache/config.php\n'
    '- wp-content/uploads, wp-content/debug.log, wp-content/backup\n'
    '- .aws/credentials, administrator/index.php\n\n'
    'FALSOS POSITIVOS FILTRADOS: 52 redirects -> 404\n'
    'Status codes: {308: 52, 404: 298, 403: 10, 307: 1, 200: 3}'
)

pdf.subsection('21.5 Active Scan (1s)')
pdf.body(
    '0 URLs parametrizadas, 0 forms\n'
    '1 vuln: Missing Security Headers\n'
    '  - Content-Security-Policy ausente\n'
    '  - X-XSS-Protection ausente\n'
    '  - X-Content-Type-Options ausente\n'
    '  - X-Frame-Options ausente\n'
    'Payloads injetados em headers ocultos: 0 testes'
)

pdf.subsection('21.6 JS Secret Scanning (40s)')
pdf.body(
    '2 paginas HTML coletadas | 12 scripts JS | 23 arquivos analisados\n'
    '42 segredos "basic_auth_url" encontrados (FALSO POSITIVO)\n'
    'Todos em polyfills/webpack do Next.js, nao em codigo do site\n\n'
    'Arquivos com "segredos":\n'
    '1. https://bundle.social (raiz)\n'
    '2. https://bundle.social/dashboard\n'
    '3. /_next/static/chunks/polyfills-78c92fac7aa8fdd8.js\n'
    '4. /_next/static/chunks/71ac0852-8b9b6165fea74bda.js\n'
    '5. /_next/static/chunks/d562bf09-a3075e53e89fda6f.js\n'
    '6. /_next/static/chunks/webpack-b6c2bb44fa24ae37.js\n'
    '7. /_next/static/chunks/main-app-02462e8c6ad6f0f6.js\n'
    '8. /_next/static/chunks/65708-ae84061b18020e98.js'
)

pdf.subsection('21.7 Fases que NAO rodaram (scan morreu na fase 8)')
pdf.body(
    'BUG em arquivos_expostos.py: cannot access local variable validation\n'
    'Scan parou na fase vuln_scanner (fase 8 de 15)\n\n'
    'NAO RODARAM:\n'
    '- credential_cascade\n'
    '- validacao_inteligente\n'
    '- vuln_scanner_ext (57 tipos)\n'
    '- nuclei_cve\n'
    '- sistemas_legados\n'
    '- graphql_fuzzing\n'
    '- relatorio_forense\n\n'
    'CONCLUSAO: VulnStrike nao consegue lidar com SPA/Next.js + Cloudflare.\n'
    'So acha falso positivo em site moderno. Feito para sites tradicionais (PHP, WordPress).'
)

# ============ CHECKLIST ============
pdf.add_page()
pdf.section_title('22. CHECKLIST DE IMPLEMENTACAO')
checklist = [
    'Definir stack: NestJS + Fastify + Prisma + PG + Redis',
    'Criar schema do banco (orgs, teams, keys, accounts, posts, uploads, webhooks)',
    'Sistema de API keys (hash bcrypt, validacao, rotacao)',
    'Rate limiting 3 camadas (Redis: 1s/100, 10s/500, 60s/2000)',
    'Interface PlatformAdapter + 3 adapters iniciais (IG, FB, X)',
    'Fluxo OAuth hosted (connect-link) + callback handling',
    'Channel selection (set-channel para Meta platforms)',
    'Upload: simple + direct (presigned) + multipart (64MiB chunks)',
    'Publisher worker (BullMQ) - publica em paralelo por plataforma',
    'Sistema de erros padronizado (code, userFacingMessage, isTransient)',
    'Scheduler de posts (agenda para postDate)',
    'Webhooks: cadastro, HMAC-SHA256, delivery worker (3 retries)',
    'Analytics: adapter por plataforma + refresh 24h + force (rate limited)',
    'Comments API (importar + criar)',
    'Post history import (async job)',
    'Bulk post from CSV',
    'Adicionar 12 plataformas restantes',
    'Dashboard Next.js 15 (org, teams, contas, posts, calendar, analytics)',
    'Dark mode + multi-idioma (PT-BR, EN, ES)',
    'SDK TypeScript (openapi-ts) + Python + Go',
    'CLI (JSON in/out) + MCP server',
    'Docs (Mintlify + llms.txt + Swagger UI)',
    'Cron jobs (analytics refresh, token refresh, cleanup, purge)',
    'Docker compose + deploy (Coolify ou K8s)',
    'Cloudflare (CDN + WAF + SSL) + R2 (storage)',
    'Monitoring (Grafana + Loki + Prometheus) + status page',
    'Backup automatico PG + testes E2E + load testing',
    'Registrar apps em todas as 15 plataformas (API keys)',
]
for i, item in enumerate(checklist, 1):
    pdf.body(f'{i}. [ ] {item}')

# ============ NOTA FINAL ============
pdf.ln(5)
pdf.section_title('NOTA FINAL')
pdf.body(
    'Este documento combina:\n'
    '1. OpenAPI spec real (114 endpoints) extraida de https://api.bundle.social/swagger-json\n'
    '2. Schemas completos de POST /post para todas as 15 plataformas\n'
    '3. Dados do scan VulnStrike (25/08/2026) - fingerprinting, nmap, fuzzing, JS secret\n'
    '4. Blueprint arquitetural com modelo de dados PostgreSQL\n'
    '5. Pipeline de publishing, rate limiting, webhooks, cron jobs\n'
    '6. Roadmap de 7 fases (24 semanas)\n'
    '7. Analise de custo de infraestrutura (~$28-58/mes self-host)\n\n'
    'O codigo backend de bundle.social e privado e nao foi acessado.\n'
    'Tecnologias marcadas como (inferido) sao estimativas baseadas em evidencias.\n'
    'Use este blueprint como ponto de partida e adapte conforme sua infraestrutura.'
)

# Salvar
output_path = 'C:/Users/lfeli/Desktop/RELATORIO_TECNICO_COMPLETO.pdf'
pdf.output(output_path)
print(f'PDF gerado: {output_path}')
print(f'Paginas: {pdf.page_no()}')
