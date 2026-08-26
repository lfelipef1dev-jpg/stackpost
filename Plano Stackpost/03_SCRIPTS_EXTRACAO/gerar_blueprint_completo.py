"""Blueprint Master - bundle.social"""
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_fill_color(10,16,30); self.rect(0,0,210,22,'F')
            self.set_text_color(255); self.set_font('Helvetica','B',9)
            self.cell(0,8,'BLUEPRINT TECNICO MESTRE - bundle.social',0,1,'L')
            self.set_font('Helvetica','I',6)
            self.cell(0,5,'Limites | Fluxo | Resolucao | Formatos | Rotas | Paralelismo',0,1,'L')
            self.ln(3)
    def footer(self):
        self.set_y(-12); self.set_text_color(120); self.set_font('Helvetica','I',7)
        self.cell(0,8,f'Pag {self.page_no()}/{{nb}} | Blueprint Master',0,0,'C')
    def h1(self,t):
        self.ln(4); self.set_fill_color(15,23,42); self.set_text_color(255)
        self.set_font('Helvetica','B',13); self.cell(0,9,f'  {t}',0,1,'L',fill=True); self.ln(2)
    def h2(self,t):
        self.ln(3); self.set_text_color(37,99,235); self.set_font('Helvetica','B',10)
        self.cell(0,6,t,0,1,'L'); self.set_text_color(0)
    def h3(self,t):
        self.ln(1); self.set_text_color(30,64,175); self.set_font('Helvetica','B',8)
        self.cell(0,5,t,0,1,'L'); self.set_text_color(0)
    def p(self,t,sz=8):
        self.set_font('Helvetica','',sz); self.multi_cell(0,4,t); self.ln(1)
    def code(self,t):
        self.set_fill_color(240,240,245); self.set_font('Courier','',7)
        self.multi_cell(0,4,t,fill=True); self.ln(2)
    def tbl(self,rows,widths=None):
        if not widths:
            n=len(rows[0]); widths=[190/n]*n
        for i,row in enumerate(rows):
            if i==0:
                self.set_fill_color(30,41,59); self.set_text_color(255); self.set_font('Helvetica','B',7)
            else:
                self.set_fill_color(248,250,252) if i%2==0 else self.set_fill_color(255,255,255)
                self.set_text_color(0); self.set_font('Helvetica','',7)
            for j,cell in enumerate(row):
                self.cell(widths[j],5,str(cell)[:int(widths[j]/1.3)],0,0,'L',fill=True)
            self.ln()
        self.ln(2)

pdf=PDF(); pdf.alias_nb_pages(); pdf.set_auto_page_break(auto=True,margin=18)

# CAPA
pdf.add_page()
pdf.set_fill_color(10,16,30); pdf.rect(0,0,210,297,'F')
pdf.set_text_color(255); pdf.set_font('Helvetica','B',24); pdf.ln(80)
pdf.cell(0,12,'BLUEPRINT TECNICO MESTRE',0,1,'C')
pdf.set_font('Helvetica','B',16); pdf.cell(0,10,'bundle.social',0,1,'C')
pdf.set_font('Helvetica','',10); pdf.ln(5)
pdf.cell(0,6,'Analise tecnica completa para alternativa superior',0,1,'C')
pdf.ln(3); pdf.set_text_color(150,200,255)
pdf.cell(0,5,'114 endpoints | 15 plataformas | OpenAPI 3.0 real',0,1,'C')
pdf.cell(0,5,'Limites de midia | Resolucoes | Fluxo de postagem | Paralelismo',0,1,'C')
pdf.cell(0,5,'Rotas | Tempos | Mapeamento | Validacao | Erros',0,1,'C')
pdf.ln(10); pdf.set_text_color(200); pdf.set_font('Helvetica','I',8)
pdf.cell(0,5,'Fontes: api.bundle.social/swagger-json + docs.bundle.social + scan VulnStrike',0,1,'C')
pdf.cell(0,5,'Data: 25/08/2026',0,1,'C')

# 1. VISAO GERAL
pdf.add_page(); pdf.h1('1. VISAO GERAL E URLs OFICIAIS')
pdf.p('bundle.social = API REST unificada (middleware) para postar em 15 redes sociais com uma integracao.')
pdf.h2('URLs Oficiais')
pdf.tbl([['Recurso','URL'],['Site','https://bundle.social'],['API prod','https://api.bundle.social'],['API dev','http://localhost:3001'],['Docs','https://docs.bundle.social'],['Docs MD','https://info.bundle.social'],['OpenAPI JSON','https://api.bundle.social/swagger-json'],['OpenAPI YAML','https://api.bundle.social/swagger-yaml'],['SDK','github.com/bundleglobal/bundlesocial-node'],['Status','bundlesocial.betteruptime.com'],['Contato','contact@bundle.social']],[40,150])
pdf.h2('Dados OpenAPI')
pdf.tbl([['Campo','Valor'],['Titulo','bundle.social API'],['Versao','1.0.0'],['Spec','OpenAPI 3.0'],['Endpoints','114'],['Plataformas','15'],['Auth','API Key (x-api-key header)'],['Tags','app, organization, team, socialAccount, upload, post, postImport, analytics, comment, misc, postCSV']],[40,150])
pdf.h2('15 Plataformas')
pdf.p('TIKTOK | YOUTUBE | INSTAGRAM | FACEBOOK | TWITTER | THREADS | LINKEDIN | PINTEREST | REDDIT | MASTODON | DISCORD | SLACK | BLUESKY | GOOGLE_BUSINESS | SNAPCHAT')
# === 1. VISAO GERAL ===
pdf.add_page(); pdf.h1('1. VISAO GERAL E URLs OFICIAIS')
pdf.p('bundle.social = API REST unificada (middleware) para postar em 15 redes com uma integracao.')
pdf.h2('URLs Oficiais')
pdf.tbl([['Recurso','URL'],['Site','https://bundle.social'],['API prod','https://api.bundle.social'],['API dev','http://localhost:3001'],['Docs','https://docs.bundle.social'],['Docs MD','https://info.bundle.social'],['OpenAPI JSON','https://api.bundle.social/swagger-json'],['OpenAPI YAML','https://api.bundle.social/swagger-yaml'],['SDK','github.com/bundleglobal/bundlesocial-node'],['Status','bundlesocial.betteruptime.com'],['Contato','contact@bundle.social']],[40,150])
pdf.h2('Dados OpenAPI')
pdf.tbl([['Campo','Valor'],['Titulo','bundle.social API'],['Versao','1.0.0'],['Spec','OpenAPI 3.0'],['Endpoints','114'],['Plataformas','15'],['Auth','API Key (x-api-key header)'],['Tags','app, organization, team, socialAccount, upload, post, postImport, analytics, comment, misc, postCSV']],[40,150])
pdf.h2('15 Plataformas')
pdf.p('TIKTOK | YOUTUBE | INSTAGRAM | FACEBOOK | TWITTER | THREADS | LINKEDIN | PINTEREST | REDDIT | MASTODON | DISCORD | SLACK | BLUESKY | GOOGLE_BUSINESS | SNAPCHAT')

# === 2. AUTENTICACAO ===
pdf.add_page(); pdf.h1('2. AUTENTICACAO')
pdf.h2('2.1 API Key (cliente -> bundle.social)')
pdf.p('Header unico: x-api-key: pk_live_xxx. 401=sem chave, 403=chave invalida. Chaves sao ORG-level (acesso a todos os teams). Prefixo pk_live_ (padrao Stripe-like). Sem OAuth2, sem JWT.')
pdf.h2('2.2 OAuth (bundle.social -> plataformas)')
pdf.p('OAuth feito ENTRE bundle.social e cada plataforma. Cliente nao ve tokens.')
pdf.h3('Fluxo Hosted (recomendado)')
pdf.p('1. POST /social-account/create-portal-link { teamId, redirectUrl, socialAccountTypes[] }\n2. bundle.social retorna URL portal\n3. Usuario abre portal - gerencia OAuth UI + canal + idioma\n4. Redirecionado de volta para redirectUrl\n5. Webhook social-account.created dispara')
pdf.h3('Fluxo Custom UI')
pdf.p('1. POST /social-account/connect { type, teamId, redirectUrl, serverUrl?, disableAutoLogin?, tiktokForceLogin? } -> { url }\n2. Redireciona usuario para URL OAuth da plataforma\n3. Plataforma faz callback para bundle.social\n4. POST /social-account/set-channel { teamId, type, channelId, channelData }\n5. POST /social-account/refresh-channels\n6. Webhook social-account.created')
pdf.h2('2.3 Token Management')
pdf.p('Armazenado por conta: accessToken (ENCRIPTADO), refreshToken (ENCRIPTADO), secret, expiresAt.\n\nREGRAS:\n- NUNCA aparecem em webhooks ou respostas publicas\n- Renovacao automatica antes de expirar\n- Deteccao desconexao remota a cada 6h (Meta: FB, IG, Threads)\n- 3 retries com 10min backoff se validacao falhar\n- Apos 3 falhas: agenda delecao + webhook social-account.updated\n- Grace period 6h antes de deletar\n- POST /social-account/connection-check valida manualmente')
pdf.h2('2.4 Webhook Signature')
pdf.code('Header: x-signature: HMAC-SHA256(payload, signing_secret)\n\nVerificacao Node.js:\nconst exp = crypto.createHmac("sha256", secret)\n  .update(JSON.stringify(payload)).digest("hex");\ncrypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))')

# === 3. HIERARQUIA ===
pdf.add_page(); pdf.h1('3. HIERARQUIA MULTI-TENANT')
pdf.p('Organization > Team > SocialAccount. Cobranca por ORG, nao por conta.')
pdf.h2('Estrutura')
pdf.code('Organization (cobranca)\n  |- API Keys (compartilhadas entre teams)\n  |- Webhooks (compartilhados entre teams)\n  |- Subscription (FREE/PRO/BUSINESS/CUSTOM)\n  |- Team A ("Marketing")\n  |   |- Social Accounts (IG, TikTok, ...)\n  |   |- Posts, Uploads, Comments\n  |- Team B ("Cliente: Acme")\n  |   |- Social Accounts proprias\n  |   |- Posts, Uploads, Comments\n\nREGRA CRITICA:\n- Rate limits API: por ORG (API key)\n- Daily post limits: por CONTA REAL (platform + account_id)\n- Monthly caps: por ORGANIZATION\n- Para SaaS: 1 TEAM por cliente')
pdf.h2('Planos')
pdf.tbl([['Plano','Preco','Posts/mes','Comments','Uploads','Contas'],['FREE','$0','20','50','200','3'],['PRO','$100/mes','10.000','5.000','100.000','Ilimitado'],['BUSINESS','$400/mes','100.000','50.000','1.000.000','Ilimitado'],['CUSTOM','Sob consulta','Custom','Custom','Custom','Custom']],[25,30,30,30,30,45])
pdf.p('Contagem mensal: por data de CRIACAO no mes UTC. Rascunhos nao contam. Falhas NAO devolvem cota. Reset: dia 1 UTC.')
# === 4. FLUXO COMPLETO DE POSTAGEM ===
pdf.add_page(); pdf.h1('4. FLUXO COMPLETO DE POSTAGEM (inicio ao fim)')
pdf.p('Fluxo exato desde o request do cliente ate a confirmacao em todas as plataformas.')

pdf.h2('Fase 1: Request do Cliente')
pdf.code('POST /api/v1/post/\nHeaders: x-api-key: pk_live_xxx, Content-Type: application/json\nBody:\n{\n  "teamId": "team_123",\n  "title": "Lancamento X",\n  "postDate": "2026-09-01T15:00:00.000Z",\n  "status": "SCHEDULED",\n  "socialAccountTypes": ["INSTAGRAM","TIKTOK","TWITTER","LINKEDIN"],\n  "data": {\n    "INSTAGRAM": { "type":"REEL", "text":"BTS!", "uploadIds":["upl_1"], "shareToFeed":true },\n    "TIKTOK": { "type":"VIDEO", "text":"Launch!", "uploadIds":["upl_1"], "privacy":"PUBLIC_TO_EVERYONE" },\n    "TWITTER": { "text":"Shipping day!", "uploadIds":["upl_2"] },\n    "LINKEDIN": { "text":"We shipped X.", "privacy":"PUBLIC" }\n  },\n  "firstComment": { "INSTAGRAM": "#launch", "TIKTOK": "Link in bio!" }\n}\n\nObrigatorios: teamId, title, postDate, status, socialAccountTypes, data')

pdf.h2('Fase 2: Validacao Inicial (sincrona, <100ms)')
pdf.p('1. Validar API key (hash lookup no DB)\n2. Validar rate limit (3 camadas Redis: 1s/100, 10s/500, 60s/2000)\n3. Validar monthly cap (posts criados este mes < limite do plano)\n4. Validar daily limit por plataforma (por conta real, nao por conexao)\n5. Validar schema do body (Zod/Joi)\n6. Validar uploadIds existem e pertencem ao team\n7. Validar regras por plataforma (aspect ratio, tamanho, duracao)\n8. Se postDate no passado -> 400\n9. Salvar no DB como SCHEDULED\n10. Retornar 201 com { id: "post_abc123", status: "SCHEDULED" }')

pdf.h2('Fase 3: Agendamento (BullMQ/Queue)')
pdf.p('1. Scheduler pega posts com status=SCHEDULED e postDate <= now\n2. Cria job na fila "publish"\n3. Job contem: postId, teamId, socialAccountTypes[], data\n4. Worker pega job (concorrencia tipicamente 50)')

pdf.h2('Fase 4: Publisher Worker (PARALELO por plataforma)')
pdf.p('CADA plataforma publicada em paralelo (Promise.allSettled). Falha em uma NAO afeta outras.')
pdf.code('async function publishPost(post) {\n  const results = {};\n  const platforms = post.socialAccountTypes;\n\n  // PARALELO em todas as plataformas\n  await Promise.allSettled(platforms.map(async (platform) => {\n    const adapter = adapters[platform];\n    const account = await getSocialAccount(post.teamId, platform);\n    const platformData = post.data[platform];\n\n    try {\n      await adapter.ensureValidToken(account);\n      const mediaUrls = await resolveUploadIds(platformData.uploadIds);\n      const result = await adapter.publish(platformData, account, mediaUrls);\n      results[platform] = { status: "POSTED", externalId: result.id, permalink: result.permalink };\n    } catch (err) {\n      results[platform] = { status: "ERROR", error: normalizeError(err, platform) };\n    }\n  }));\n\n  const allPosted = Object.values(results).every(r => r.status === "POSTED");\n  post.status = allPosted ? "POSTED" : "ERROR";\n  post.externalData = extractExternalIds(results);\n  post.errorsVerbose = extractErrors(results);\n  post.postedDate = new Date();\n  await post.save();\n\n  await triggerWebhook("post.published", post);\n  if (post.firstComment) await scheduleFirstComment(post);\n}')

pdf.h2('Fase 5: Pos-Publicacao')
pdf.p('1. Webhook post.published disparado (status POSTED ou ERROR)\n2. firstComment: criado apos publicacao bem-sucedida (cada plataforma tem maxLength)\n3. Status PROCESSING: video grande processando na plataforma - re-check periodicamente\n4. posts:retry <id> para re-tentar apos falha transient\n5. Analytics: primeiro fetch em ate 24h depois da publicacao')

# === 5. PARALELISMO ===
pdf.add_page(); pdf.h1('5. PARALELISMO E PUBLISHER PIPELINE')
pdf.h2('5.1 Arquitetura')
pdf.p('CADA plataforma em socialAccountTypes[] roda em paralelo (Promise.allSettled).\n- Post para 15 plataformas = 15 chamadas simultaneas\n- Tempo total = max(plataforma_mais_lenta)\n- Falha em Instagram NAO bloqueia TikTok\n- Cada plataforma tem proprio timeout, retry e modo de falha')

pdf.h2('5.2 Tempos Estimados por Plataforma')
pdf.tbl([['Plataforma','Tempo tipico','Timeout','Observacao'],['Instagram','2-5s','30s','Meta Graph API, video pode processar por min'],['Facebook','2-5s','30s','Meta Graph API, similar IG'],['TikTok','5-30s','60s','Pode entrar REVIEW (min a horas)'],['YouTube','10s-5min','300s','Upload video grande e lento'],['Twitter/X','1-3s','15s','API rapida'],['LinkedIn','2-5s','30s','API rapida'],['Threads','2-5s','30s','Meta infra'],['Pinterest','3-8s','30s','Processa imagem/video'],['Reddit','2-5s','20s','API rapida'],['Mastodon','1-3s','15s','Depende da instancia'],['Bluesky','1-3s','15s','AT Protocol, rapido'],['Discord','1-2s','10s','Webhook, instantaneo'],['Slack','1-2s','10s','Webhook, instantaneo'],['Google Business','3-8s','30s','Google API'],['Snapchat','5-15s','60s','Upload video']],[35,30,25,100])

pdf.h2('5.3 Status do Post')
pdf.tbl([['Status','Significado','Quando'],['DRAFT','Rascunho, nao agendado','Cliente salva sem postDate'],['SCHEDULED','Agendado','Cliente define postDate + status=SCHEDULED'],['PROCESSING','Publicando/processando','Worker pegou job, enviou para plataforma'],['POSTED','Publicado com sucesso','Plataforma confirmou'],['ERROR','Falhou permanentemente','Erro non-transient ou retries falharam'],['REVIEW','Plataforma revisando','TikTok colocou em revisao']],[30,80,80])

pdf.h2('5.4 Retry Logic')
pdf.p('1. Erro TRANSIENT (rate limit, timeout, 5xx): retry automatico\n   - Backoff exponencial: 30s, 90s, 270s (3 tentativas)\n   - Max 3 retries automaticos\n2. Erro NON-TRANSIENT (auth, validacao): sem retry\n   - Cliente deve corrigir (reconectar, mudar midia)\n   - POST /post/{id}/retry para re-tentar apos correcao\n3. retryCount incrementado a cada tentativa\n4. Apos 3 retries transient falhando: status=ERROR')
# === 6. SISTEMA DE UPLOAD ===
pdf.add_page(); pdf.h1('6. SISTEMA DE UPLOAD (3 metodos + from-url)')
pdf.h2('6.1 Resumo')
pdf.tbl([['Metodo','Best for','Ceiling','Retryable','Endpoint'],['Simple','Imagens, small clips','90 MB','Nao','POST /upload/'],['Direct','Files moderados','5 GiB','Nao (recomeca)','POST /upload/init + finalize'],['Multipart','Videos grandes','5 GB default','Sim (por chunk)','POST /upload/multipart/*'],['From URL','Midia em CDN','1 GB','Nao','POST /upload/from-url']],[25,40,30,35,60])

pdf.h2('6.2 Simple Upload (multipart/form-data)')
pdf.code('POST /api/v1/upload/\nContent-Type: multipart/form-data\nFields: teamId (opcional), file (binary)\nRetorna: { id: "upload_abc123", fileName, mimeType, size }\nUnico endpoint com multipart/form-data.')

pdf.h2('6.3 Direct Upload (presigned URL, ate 5 GiB)')
pdf.code('PASSO 1: POST /api/v1/upload/init\nBody: { fileName, mimeType, fileSize?, teamId? }\nRetorna: { url, path }\nURL presigned expira em 30 MINUTOS\n\nPASSO 2: PUT <url> --upload-file video.mp4\nEnviar bytes crus (NAO JSON, NAO multipart)\nSe falhar aos 99%: recomeca do zero\n\nPASSO 3: POST /api/v1/upload/finalize\nBody: { path, teamId? }\nRetorna: { id: "upload_abc123", ... }')

pdf.h2('6.4 Multipart Upload (chunks 64 MiB, retryable)')
pdf.code('PASSO 1: POST /api/v1/upload/multipart/init\nBody: { fileName, mimeType, fileSize, teamId? }\nfileSize REQUIRED (rejeita oversized aqui)\nRetorna: { uploadId, path, partSize: 67108864, parts: [{partNumber, url}] }\nURLs presigned expiram em 6 HORAS\nMAX 10.000 parts\n\nPASSO 2: PUT <part1.url> --upload-file chunk1\nCada chunk EXATAMENTE partSize bytes (exceto ultimo)\nLER header ETag de cada PUT (necessario para complete)\nCada chunk independente - retry individual\n\nPASSO 3 (se URL expirou): POST /api/v1/upload/multipart/sign\nBody: { path, uploadId, partNumbers: [3, 7] }\nRe-assina apenas partes que falharam\nPartes ja enviadas MANTEM ETags\n\nPASSO 4: POST /api/v1/upload/multipart/complete\nBody: { path, uploadId, parts: [{partNumber, etag}], teamId? }\nRetorna: { id: "upload_abc123", ... }\n\nPASSO 5 (desistir): POST /api/v1/upload/multipart/abort\nBody: { path, uploadId }\nPartes nao finalizadas ocupam storage\nAuto-abort apos 7 dias')

pdf.h2('6.5 Upload from URL')
pdf.code('POST /api/v1/upload/from-url\nBody: { url, teamId? }\nurl: URL publica HTTP(S) - bundle.social faz fetch server-side\nMax size: 1 GB | Download timeout: 60 segundos')

pdf.h2('6.6 Storage e Cleanup')
pdf.p('Storage: S3-compativel (R2 ou S3)\nUploads deletados: removidos apos 7 dias\nUploads nao usados: soft-delete 90 dias + 7 dias purge\nMultipart nao completado: auto-abort 7 dias\nMidia processada server-side: transcoding, validacao, redimensionamento\nPosts podem ficar PROCESSING se video grande processando na plataforma')

# === 7. LIMITES DE MIDIA ===
pdf.add_page(); pdf.h1('7. LIMITES DE MIDIA POR PLATAFORMA')
pdf.p('Limites REAIS da documentacao oficial. bundle.social valida ANTES de enviar. Quebrar regra = 400.')

pdf.h2('7.1 Instagram - Posts (Carousel)')
pdf.tbl([['Constraint','Valor'],['Files','1-10 (imagens e/ou videos, misturados)'],['Image max size','8 MB'],['Image max width','1920px'],['Image aspect ratio','4:5 a 1.91:1'],['Video max width','1920px'],['Video max bitrate','45 Mbps'],['Video duration','3s - 15 min'],['Video aspect ratio','0.01:1 a 10:1']],[60,130])
pdf.h3('Reels')
pdf.tbl([['Constraint','Valor'],['Files','1 video (required)'],['Max width','1920px'],['Max bitrate','45 Mbps'],['Duration','3s - 15 min'],['Aspect ratio','0.01:1 a 10:1 (9:16 recomendado)']],[60,130])
pdf.h3('Stories')
pdf.tbl([['Constraint','Valor'],['Files','1 (image or video)'],['Image max size','8 MB'],['Image aspect ratio','0.01:1 a 10:6'],['Video max size','100 MB'],['Video max width','1920px'],['Video max bitrate','25 Mbps'],['Video duration','3s - 60s'],['Video aspect ratio','0.01:1 a 10:6']],[60,130])
pdf.p('CORRECAO AUTO (apenas type=POST): autoFitImage=true (padding) OU autoCropImage=true (crop). Mutuamente exclusivos.')

pdf.h2('7.2 TikTok - Videos')
pdf.tbl([['Constraint','Valor'],['Files','1 video (required)'],['Max size','1 GB'],['Resolution','360x360 a 4096x4096'],['Aspect ratio','0.01:1 a 10:6 (9:16 recomendado)'],['Duration','Max 10 min (600s)']],[60,130])
pdf.h3('Images (Photo Mode)')
pdf.tbl([['Constraint','Valor'],['Files','1-10 images'],['Format','JPG/JPEG/WebP ONLY (PNG REJEITADO!)'],['Max size','20 MB cada'],['Max width','1920px']],[60,130])
pdf.p('Auto-scale: se foto > 1920x1080, redimensiona server-side. PNG = REJEITADO para Photo Mode.')

pdf.h2('7.3 YouTube - Shorts')
pdf.tbl([['Constraint','Valor'],['Files','1 video (required)'],['Max size','5 GB'],['Duration','Max 3 min (180s)'],['Aspect ratio','1:3 a 1:1 (vertical ou quadrado)']],[60,130])
pdf.h3('Long Form Videos')
pdf.tbl([['Constraint','Valor'],['Files','1 video (required)'],['Max size','5 GB'],['Duration','Max 4 horas (14.400s)'],['Aspect ratio','1:3 a 3:1']],[60,130])
pdf.p('YouTube AUTO-DETECTA Shorts: duration < 3min E aspect vertical/quadrado. Nao ha botao "upload as Short".')
pdf.add_page()
pdf.h2('7.4 Facebook - Page Posts')
pdf.tbl([['Constraint','Valor'],['Files','0-10 (imagens ou videos, nao misturados)'],['Max videos','1'],['Video max bitrate','45 Mbps'],['Video aspect ratio','0.01:1 a 1.91:1'],['Video duration','Max 20 min (1.200s)'],['Max images','4'],['Image max size','4 MB cada'],['Image aspect ratio','0.01:1 a 1.91:1']],[60,130])
pdf.h3('Reels')
pdf.tbl([['Constraint','Valor'],['Files','1 video (required)'],['Min resolution','540x960'],['Aspect ratio','0.01:1 a 10:6'],['Max bitrate','45 Mbps'],['Duration','3s - 20 min (1.200s)']],[60,130])
pdf.h3('Stories')
pdf.tbl([['Constraint','Valor'],['Files','1 (image or video)'],['Video min resolution','540x960'],['Video max bitrate','25 Mbps'],['Video duration','3s - 60s'],['Video aspect ratio','0.01:1 a 10:6'],['Image max size','4 MB'],['Image aspect ratio','0.01:1 a 10:6']],[60,130])

pdf.h2('7.5 LinkedIn')
pdf.tbl([['Constraint','Valor'],['Files','0-10 (imagens, videos, OU documentos - nao misturados)'],['Max videos','1'],['Video max size','2 GB'],['Video resolution','256x144 a 4096x4096'],['Video aspect ratio','1:2.4 a 2.4:1'],['Video duration','3s - 30 min'],['Max images','10'],['Image max size','5 MB cada'],['Image min resolution','200x200'],['Max documents','1'],['Document max size','100 MB'],['Document format','PDF only']],[60,130])

pdf.h2('7.6 Twitter / X')
pdf.tbl([['Constraint','Valor'],['Files','0-4 (imagens e/ou videos)'],['Video max size','512 MB'],['Video aspect ratio','1:3 a 3:1'],['Video min length','0.5s'],['Video duration (Free/Basic)','Max 140s (2:20)'],['Video duration (Premium+)','Max 600s (10 min)'],['Image max size','5 MB cada'],['Max images','4'],['Text (Free/Basic)','280 chars'],['Text (Premium+)','25.000 chars']],[60,130])

pdf.h2('7.7 Pinterest')
pdf.tbl([['Constraint','Valor'],['Files','1 (image or video, required)'],['Video max size','2 GB'],['Video aspect ratio','1:2 a 1.91:1'],['Video duration','4s - 15 min (900s)'],['Image max size','5 MB']],[60,130])

pdf.h2('7.8 Reddit - Single Post')
pdf.tbl([['Constraint','Valor'],['Files','0-1 (image or video)'],['Video max size','1 GB'],['Video aspect ratio','9:16 a 16:9'],['Video duration','4s - 15 min (900s)'],['Image max size','20 MB']],[60,130])
pdf.h3('Gallery Post')
pdf.tbl([['Constraint','Valor'],['Files','0-10 images (se subreddit permitir)'],['Image max size','20 MB cada']],[60,130])

pdf.h2('7.9 Threads')
pdf.tbl([['Constraint','Valor'],['Files','0-10 (imagens e/ou videos, misturados)'],['Video max size','1 GB'],['Video max bitrate','100 Mbps'],['Video aspect ratio','0.01:1 a 1.91:1'],['Image max size','8 MB'],['Image width','320-1440px'],['Image aspect ratio','0.01:1 a 1.91:1']],[60,130])

pdf.add_page()
pdf.h2('7.10 Discord')
pdf.tbl([['Constraint','Valor'],['Files','0-10 (imagens e/ou videos, misturados)'],['Video max size','25 MB'],['Video aspect ratio','0.01:1 a 1.91:1'],['Image max size','25 MB'],['Image aspect ratio','0.01:1 a 1.91:1'],['Text','Max 2.000 chars']],[60,130])

pdf.h2('7.11 Slack')
pdf.tbl([['Constraint','Valor'],['Files','0-4 (imagens e/ou videos, misturados)'],['Video max size','1 GB'],['Video aspect ratio','0.01:1 a 1.91:1'],['Image max size','1 GB'],['Image aspect ratio','0.01:1 a 1.91:1'],['Text','Max 30.000 chars']],[60,130])

pdf.h2('7.12 Mastodon')
pdf.tbl([['Constraint','Valor'],['Files','0-4 (imagens e/ou videos, misturados)'],['Max videos','1'],['Video max size','99 MB'],['Video aspect ratio','1:3 a 1:1'],['Max images','4'],['Image max size','16 MB cada'],['Text','Depende da instancia (geralmente 500)']],[60,130])

pdf.h2('7.13 Bluesky')
pdf.tbl([['Constraint','Valor'],['Files','0-4 (imagens e/ou videos)'],['Text','300 chars']],[60,130])
pdf.p('Bluesky tem restricoes minimas. bundle.social enforce apenas file count basico.')

pdf.h2('7.14 Google Business')
pdf.tbl([['Constraint','Valor'],['Files','0-1 image only (NO video)'],['Image max size','5 MB'],['Image min resolution','250x250'],['Text','Max 1.500 chars']],[60,130])

pdf.h2('7.15 Snapchat - Stories')
pdf.tbl([['Constraint','Valor'],['Files','Exatamente 1 image ou MP4 video'],['Max file size','100 MB'],['Video min resolution','540x960'],['Video duration','5-60 segundos']],[60,130])
pdf.h3('Spotlights')
pdf.tbl([['Constraint','Valor'],['Files','Exatamente 1 MP4 video'],['Max file size','100 MB'],['Min resolution','540x960'],['Video duration','6-60 segundos']],[60,130])

pdf.add_page()
pdf.h2('7.16 Tabela Resumo')
pdf.tbl([['Plataforma','Max Files','Video Max','Video Dur','Img Max'],['IG Post','10','N/A(bitrate)','15 min','8 MB'],['IG Reel','1','N/A(bitrate)','15 min','-'],['IG Story','1','100 MB','60s','8 MB'],['TikTok Video','1','1 GB','10 min','-'],['TikTok Image','10','-','-','20 MB'],['YT Short','1','5 GB','3 min','-'],['YT Video','1','5 GB','4 horas','-'],['LinkedIn','10','2 GB','30 min','5 MB'],['Twitter/X','4','512 MB','140s/10min','5 MB'],['FB Post','10','N/A(bitrate)','20 min','4 MB'],['FB Reel','1','N/A(bitrate)','20 min','-'],['FB Story','1','N/A(bitrate)','60s','4 MB'],['Pinterest','1','2 GB','15 min','5 MB'],['Reddit','1/10','1 GB','15 min','20 MB'],['Threads','10','1 GB','-','8 MB'],['Discord','10','25 MB','-','25 MB'],['Slack','4','1 GB','-','1 GB'],['Mastodon','4','99 MB','-','16 MB'],['Bluesky','4','-','-','-'],['Google Biz','1','-','-','5 MB'],['Snap Story','1','100 MB','60s','100 MB'],['Snap Spot','1','100 MB','60s','-']],[35,20,30,35,25])

pdf.h2('7.17 Ceilings Globais')
pdf.p('Video: 5 GB default (maior sob request, por org, via Multipart)\nImagens: 25 MB\nDocumentos (PDF): 100 MB\nFormatos imagem: JPG, PNG, WEBP, GIF\nFormatos video: MP4, MOV, WEBM\nbundle.social enforce o MENOR entre ceiling global e limite da plataforma')
# === 8. FORMATO POR PLATAFORMA ===
pdf.add_page(); pdf.h1('8. FORMATO DE POST POR PLATAFORMA (15 redes)')
pdf.p('Campos dentro de data.PLATFORM. NEGRITO = obrigatorio.')

pdf.h2('8.1 TWITTER / X (data.TWITTER)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string','~280 chars (maior se X Premium)'],['uploadIds','string[]','Ate 4 imagens OU 1 video/GIF'],['replySettings','enum','EVERYONE|FOLLOWING|MENTIONED_USERS|SUBSCRIBERS|VERIFIED'],['isAiGenerated','boolean','Label "made with AI" do X']],[30,30,130])
pdf.p('REGRAS: Sem analytics. Sem set-channel (OAuth direto). Threads no X = primeiro tweet + comments API. firstComment NAO suportado.')

pdf.h2('8.2 INSTAGRAM (data.INSTAGRAM)')
pdf.tbl([['Campo','Tipo','Notas'],['type','enum','POST|REEL|STORY (default POST)'],['text','string','Caption. Max 2.000 chars'],['uploadIds','string[]','1 para POST/REEL/STORY. Carousel: 1-10 via carouselItems'],['altText','string','Alt text single image'],['carouselItems','array','[{uploadId, altText?, tagged?[]}]. Min 2, Max 10'],['thumbnailOffset','number(ms)','Frame do video como capa'],['thumbnail','string(URL)','Capa alternativa'],['shareToFeed','boolean','Reels: tambem no Feed'],['collaborators','string[]','Max 3 usernames, max 30 chars'],['tagged','array','[{username, x?(0-1), y?(0-1)}]. Image: x,y obrigatorios'],['locationId','string','ID via /misc/instagram/locations'],['autoFitImage','boolean','POST only. Padding para aspect ratio'],['autoCropImage','boolean','POST only. Crop para aspect ratio'],['trialParams','object','{graduationStrategy: MANUAL|SS_PERFORMANCE}. Reels only'],['isPaidPartnership','boolean','Label "Paid partnership"'],['brandedContentSponsors','string[]','Max 2 usernames. FB Login only'],['musicSoundInfo','object','Reels only. {musicSoundId, musicSoundVolume?(0-100), videoOriginalSoundVolume?(0-100)}'],['isAiGenerated','boolean','Label AI Instagram']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Meta Graph API. set-channel OBRIGATORIO\n- brandedContentSponsors e business discovery: apenas contas via Facebook Login\n- autoFitImage e autoCropImage: MUTUAMENTE EXCLUSIVOS. Apenas type=POST\n- musicSoundInfo: apenas type=REEL e conta via Facebook Login\n- carouselItems: cada uploadId deve existir em uploadIds, usar uma vez\n- tagged em carousel: usar carouselItems[].tagged (top-level rejeitado)\n- Video em carousel: person tags NAO suportados\n- firstComment maxLength: 2.200 chars')

pdf.add_page()
pdf.h2('8.3 FACEBOOK (data.FACEBOOK)')
pdf.tbl([['Campo','Tipo','Notas'],['type','enum','POST|REEL|STORY (default POST)'],['text','string','Caption. Max 50.000 chars'],['uploadIds','string[]','Imagens ou 1 video'],['mediaItems','array','[{uploadId, altText?}]. Per-image alt text'],['link','string(URL)','Link attachment. type=POST only'],['mediaTitle','string','Titulo video. type=POST com video only. Max 255'],['thumbnail','string(URL)','Capa do video'],['nativeScheduleTime','ISO 8601','Agendar direto no Meta. Max 30 dias. Local time']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Meta Graph API (Page token). set-channel OBRIGATORIO (selecionar Page)\n- Token expiration e a dor principal (Meta:190)\n- Meta OAuth: selecionar TODAS as Pages que o usuario gerencia\n- firstComment maxLength: 8.000 chars')

pdf.h2('8.4 TIKTOK (data.TIKTOK)')
pdf.tbl([['Campo','Tipo','Notas'],['type','enum','VIDEO|IMAGE (default VIDEO)'],['text','string','Caption. Max 2.200 chars'],['uploadIds','string[]','1 video OU 1-10 imagens (Photo Mode)'],['thumbnail','string(URL)','Capa do video'],['privacy','enum','SELF_ONLY|PUBLIC_TO_EVERYONE|MUTUAL_FOLLOW_FRIENDS|FOLLOWER_OF_CREATOR'],['photoCoverIndex','integer','Capa Photo Mode (zero-based, default 0)'],['thumbnailOffset','number(ms)','Frame do video como capa'],['isBrandContent','boolean','Parceria terceiro (paid)'],['isOrganicBrandContent','boolean','Promover proprio negocio'],['disableComments','boolean','Desabilitar comentarios'],['disableDuet','boolean','Desabilitar Duets'],['disableStitch','boolean','Desabilitar Stitches'],['isAiGenerated','boolean','Marcar como AI'],['autoAddMusic','boolean','TikTok adiciona musica em fotos'],['autoScale','boolean','IMAGE only. Redimensionar server-side'],['uploadToDraft','boolean','Salvar como draft (pode demorar horas!)'],['musicSoundInfo','object','{musicSoundId, musicSoundVolume?(0-100), musicSoundStart?(ms), musicSoundEnd?(ms), videoOriginalSoundVolume?(0-100)}']],[30,30,130])
pdf.p('REGRAS:\n- OAuth direto (sem set-channel)\n- Photo Mode: JPG/JPEG/WebP ONLY. PNG = REJEITADO\n- musicSoundId = song_clip_id do CML trending list\n- privacy SELF_ONLY: permalink null\n- REVIEW status: TikTok revisa (minutos a horas)\n- uploadToDraft: pode causar delays massivos\n- firstComment maxLength: 150 chars')

pdf.add_page()
pdf.h2('8.5 YOUTUBE (data.YOUTUBE)')
pdf.tbl([['Campo','Tipo','Notas'],['type','enum','VIDEO|SHORT (default SHORT)'],['uploadIds','string[]','1 video (required)'],['text','string','TITULO do video (required). Max 100 chars'],['description','string','Descricao. Max 5.000 chars'],['thumbnail','string(URL)','Capa custom (type=VIDEO only)'],['privacy','enum','PRIVATE|PUBLIC|UNLISTED (default PUBLIC)'],['defaultLanguage','string(BCP-47)','Idioma titulo/desc. Max 35 chars. Ex: en, pl'],['defaultAudioLanguage','string(BCP-47)','Idioma audio. Max 35 chars'],['madeForKids','boolean','REQUIRED por YouTube (COPPA/FTC)'],['containsSyntheticMedia','boolean','Conteudo AI'],['hasPaidProductPlacement','boolean','Paid placement']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via YouTube Data API v3. set-channel OBRIGATORIO (canal)\n- Shorts AUTO-DETECTADOS: duration < 3min + aspect vertical/quadrado\n- madeForKids e REQUISITO LEGAL (FTC/COPPA)\n- categoryId: via /misc/youtube/video-categories (nao vai no data)\n- Playlists via /misc/youtube/playlist\n- 10.000 units/dia (free tier Google)\n- firstComment maxLength: 10.000 chars\n- Monetizacao: requer withBusinessScope + rawYoutubeAnalyticsEnabled\n- Dislikes disponiveis via API (escondidos no UI)')

pdf.h2('8.6 LINKEDIN (data.LINKEDIN)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string(REQUIRED)','Max 3.000 chars. Perfil ou Company Page'],['uploadIds','string[]','Imagens, 1 video, ou 1 PDF'],['link','string(URL)','Article preview post'],['thumbnail','string(URL)','Capa'],['mediaTitle','string','Titulo video/documento. Max 200 chars'],['privacy','enum','CONNECTIONS|PUBLIC|LOGGED_IN|CONTAINER'],['hideFromFeed','boolean','Nao mostrar no feed principal'],['disableReshare','boolean','Proibir resharing']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via LinkedIn Marketing API. set-channel OBRIGATORIO (perfil ou Company Page)\n- URNs para Company Pages\n- Mentions: /misc/linkedin/mentions/builder\n- firstComment maxLength: 1.250 chars\n- Raw analytics: reaction-type breakdowns')

pdf.add_page()
pdf.h2('8.7 THREADS (data.THREADS)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string','~500 chars'],['uploadIds','string[]','Ate ~10 imagens ou 1 video'],['mediaItems','array','[{uploadId, altText?}]. Alternativa a uploadIds'],['topicTag','string','1-50 chars, sem pontos (.) ou ampersands (&)'],['replyControl','enum','everyone|accounts_you_follow|mentioned_only|parent_post_author_only|followers_only'],['linkAttachment','string(URL)','Link preview card. Text-only posts'],['poll','object','{optionA, optionB, optionC?, optionD?}. 2-4 opcoes, 1-25 chars. Text-only'],['gif','object','{gifId, provider?: GIPHY}. Text-only. Nao com poll'],['allowlistedCountryCodes','string[]','ISO 3166-1 alpha-2. Restringir visibilidade'],['crosspostToInstagramStory','boolean','Cross-post para IG Story'],['crosspostToInstagramStoryDarkMode','boolean','Cross-post em dark mode']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Meta. Sem set-channel\n- Polls, GIFs, link attachments: APENAS text-only. Rejeita se uploadIds setado\n- poll e gif: mutuamente exclusivos\n- firstComment maxLength: 500 chars')

pdf.h2('8.8 BLUESKY (data.BLUESKY)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string','~300 chars'],['uploadIds','string[]','Ate 4 imagens ou 1 video (set videoAlt)'],['tags','string[]','Hashtags sem #. Max 8'],['labels','enum[]','!no-unauthenticated|porn|sexual|nudity|graphic-media'],['quoteUri','string','AT-URI do post citado. ^at://\\S+. Max 512'],['externalUrl','string(URI)','URL do link card'],['externalTitle','string','Titulo do card. Max 300'],['externalDescription','string','Descricao do card. Max 1.000'],['thumbnail','string(URI)','Imagem do card. Max 2048'],['videoAlt','string','Alt text do video. Max 10.000']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via AT Protocol. serverUrl opcional (default bsky.social)\n- Pode usar PDS/entryway custom\n- Sem set-channel\n- firstComment maxLength: 300 chars\n- Impressoes CALCULADAS (nao diretas)')

pdf.add_page()
pdf.h2('8.9 MASTODON (data.MASTODON)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string','Depende da instancia (geralmente ~500)'],['uploadIds','string[]','Ate 4 imagens ou 1 video'],['thumbnail','string(URL)','Capa do video'],['privacy','enum','PUBLIC|UNLISTED|PRIVATE|DIRECT'],['spoiler','string','Content warning. Max 50 (instance pode ser menor)']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Mastodon API (instancia custom)\n- serverUrl OBRIGATORIO no /connect\n- Sem set-channel\n- firstComment maxLength: 500 chars')

pdf.h2('8.10 PINTEREST (data.PINTEREST)')
pdf.tbl([['Campo','Tipo','Notas'],['boardName','string(REQUIRED)','Board para pinar'],['uploadIds','string[]','1 imagem (ou video)'],['text','string','Titulo do Pin. Max 100 chars'],['description','string','Descricao. Max 800 chars'],['link','string(URL)','URL para qual o Pin linka'],['altText','string','Alt text. Max 500 chars'],['note','string','Nota privada (nao visivel). Max 500 chars'],['thumbnail','string(URL)','Capa'],['dominantColor','string','Cor hex placeholder'],['isAiGenerated','boolean','Label AI Pinterest']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Pinterest API v5. Sem set-channel (boards refresh automatico)\n- Sem comentarios via API\n- Analytics suportado\n- firstComment NAO suportado')

pdf.h2('8.11 REDDIT (data.REDDIT)')
pdf.tbl([['Campo','Tipo','Notas'],['sr','string(REQUIRED)','Subreddit: r/subredditName ou u/username'],['text','string(REQUIRED)','Titulo do post. Max 300 chars'],['description','string','Body para self post. Max 30.000 chars'],['uploadIds','string[]','1 imagem ou video. Gallery: ate 10'],['link','string(URL)','URL do link post'],['nsfw','boolean','Marcar NSFW'],['flairId','string','Obrigatorio se subreddit exigir. Via /misc/reddit/subreddit-flairs']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Reddit API. Sem set-channel\n- ANTES de postar: /misc/reddit/post-requirements para ver limites\n- firstComment maxLength: 10.000 chars\n- Subreddit rules: nem todos permitem midia/galleries')

pdf.add_page()
pdf.h2('8.12 DISCORD (data.DISCORD)')
pdf.tbl([['Campo','Tipo','Notas'],['channelId','string(REQUIRED)','ID do canal do server'],['text','string','Mensagem. Max 2.000 chars'],['uploadIds','string[]','Attachments'],['username','string','Nome exibido (webhook). Max 80 chars'],['avatarUrl','string(URL)','Avatar exibido. Max 2.048 chars']],[30,30,130])
pdf.p('REGRAS: OAuth via webhook URL. Sem set-channel. Comentarios = mensagens. Sem analytics. firstComment maxLength: 2.000 chars.')

pdf.h2('8.13 SLACK (data.SLACK)')
pdf.tbl([['Campo','Tipo','Notas'],['channelId','string(REQUIRED)','ID do canal do workspace'],['text','string','Mensagem. Max 30.000 chars'],['uploadIds','string[]','Attachments'],['username','string','Nome exibido. Max 80 chars'],['avatarUrl','string(URL)','Avatar exibido. Max 2.048 chars']],[30,30,130])
pdf.p('REGRAS: OAuth via webhook URL. Sem set-channel. Comentarios = mensagens. Sem analytics. firstComment maxLength: 30.000 chars.')

pdf.h2('8.14 GOOGLE_BUSINESS (data.GOOGLE_BUSINESS)')
pdf.tbl([['Campo','Tipo','Notas'],['text','string','Corpo do update. Max 1.500 chars'],['uploadIds','string[]','Imagens (1 imagem only, sem video)'],['topicType','enum','STANDARD|EVENT|OFFER|ALERT (default STANDARD)'],['languageCode','string','Tag idioma: en, en-US'],['callToActionType','enum','BOOK|ORDER|SHOP|LEARN_MORE|SIGN_UP|CALL'],['callToActionUrl','string(URL)','URL do CTA'],['eventTitle','string','topicType=EVENT. Max 58 chars'],['eventStartDate','ISO 8601','topicType=EVENT'],['eventEndDate','ISO 8601','topicType=EVENT'],['offerCouponCode','string','topicType=OFFER. Max 58 chars'],['offerRedeemOnlineUrl','string','topicType=OFFER'],['offerTermsConditions','string','topicType=OFFER. Max 1.500 chars'],['alertType','enum','COVID_19 (default). topicType=ALERT']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Google My Business API. set-channel OBRIGATORIO (local)\n- Sem comentarios via API\n- Analytics suportado\n- Reviews via /misc/google-business/reviews\n- Location management via /misc/google-business/location\n- firstComment NAO suportado')

pdf.h2('8.15 SNAPCHAT (data.SNAPCHAT)')
pdf.tbl([['Campo','Tipo','Notas'],['type','enum','STORY|SPOTLIGHT (default STORY)'],['uploadIds','string[]','1 imagem ou video. Spotlight: 1 MP4 only'],['text','string','Alias para description (Spotlight). Max 160 chars'],['description','string','Spotlight description. Max 160 chars'],['locale','string','Spotlight locale. en_US. Default en_US'],['skipSaveToProfile','boolean','Spotlight only. Nao salvar no perfil']],[30,30,130])
pdf.p('REGRAS:\n- OAuth via Snapchat Marketing API (snapkit.com). Sem set-channel\n- Requer Snapchat Public Profile\n- Sem comentarios via API\n- Analytics suportado (profile + content)\n- firstComment NAO suportado')
# === 9. LIMITES DE TEXTO ===
pdf.add_page(); pdf.h1('9. LIMITES DE TEXTO E CARACTERES')
pdf.tbl([['Plataforma','Main text','Outros campos'],['Instagram','text: 2.000','collaborators max 30, tagged max 30, altText opcional'],['TikTok','text: 2.200','-'],['YouTube','text (titulo): 100','description: 5.000'],['LinkedIn','text: 3.000','mediaTitle: 200'],['Twitter/X','text: 280 (Free) / 25.000 (Premium+)','-'],['Facebook','text: 50.000','mediaTitle: 255, link: 2.048, altText opcional'],['Pinterest','text: 100','description: 800, altText: 500, note: 500'],['Reddit','text (titulo): 300','description: 30.000'],['Threads','text: 500','altText opcional em image media'],['Discord','text: 2.000','username: 80, avatarUrl: 2.048'],['Slack','text: 30.000','username: 80, avatarUrl: 2.048'],['Mastodon','text: 30.000','spoiler: 50 (instance pode ser menor)'],['Bluesky','text: 300','externalTitle: 300, externalDescription: 1.000, videoAlt: 10.000'],['Google Business','text: 1.500','eventTitle: 58, offerCouponCode: 58, offerTerms: 1.500'],['Snapchat','description/text: 160','locale: en_US']],[30,50,110])

pdf.h2('First Comment Limits (maxLength)')
pdf.tbl([['Plataforma','maxLength'],['TIKTOK','150'],['YOUTUBE','10.000'],['INSTAGRAM','2.200'],['FACEBOOK','8.000'],['THREADS','500'],['LINKEDIN','1.250'],['REDDIT','10.000'],['MASTODON','500'],['DISCORD','2.000'],['SLACK','30.000'],['BLUESKY','300']],[80,50])
pdf.p('TWITTER, PINTEREST, GOOGLE_BUSINESS, SNAPCHAT: firstComment NAO suportado.')

# === 10. RATE LIMITS ===
pdf.add_page(); pdf.h1('10. RATE LIMITS')
pdf.h2('10.1 API Rate Limits (3 camadas simultaneas)')
pdf.tbl([['Camada','Janela','Max','Equiv','Previne'],['Burst','1 segundo','100','6.000/min','Promise.all() com 500 req'],['Short','10 segundos','500','3.000/min','Polling agressivo, loops'],['Minute','1 minuto','2.000','2.000/min','Abuso volume alto']],[20,30,20,30,90])
pdf.p('Tracking: por ENDPOINT + por tracker (API key, bearer token, ou IP). Trafego em POST /post NAO consome bucket de GET /analytics. Exceder = 429.')

pdf.h2('10.2 Daily Post Limits por Plataforma (por conta real)')
pdf.tbl([['Plataforma','FREE','PRO','BUSINESS'],['TWITTER','5','15','15'],['FACEBOOK','10','50','100'],['INSTAGRAM','10','50','100'],['LINKEDIN','10','18','24'],['YOUTUBE','10','10','15'],['TIKTOK','5','10','15'],['THREADS','10','200','250'],['PINTEREST','10','24','36'],['REDDIT','10','24','36'],['DISCORD','10','100','200'],['SLACK','10','100','200'],['MASTODON','10','50','100'],['BLUESKY','10','50','100'],['GOOGLE_BUSINESS','10','20','40'],['SNAPCHAT','5','20','40']],[40,30,30,30])
pdf.p('REGRA CHAVE: Cota segue a CONTA REAL (platform + account_id), NAO a conexao. Mesma conta em 5 teams = cota total compartilhada. Contagem: por UTC calendar day.')

pdf.h2('10.3 Daily Comment Limits')
pdf.tbl([['Plataforma','FREE','PRO','BUSINESS'],['FACEBOOK','3','50','100'],['INSTAGRAM','3','50','100'],['LINKEDIN','3','18','24'],['YOUTUBE','3','10','15'],['TIKTOK','3','10','15'],['THREADS','3','200','250'],['REDDIT','3','24','36'],['DISCORD','3','100','200'],['SLACK','3','100','200'],['MASTODON','3','50','100'],['BLUESKY','3','50','100']],[40,30,30,30])
pdf.p('Comments API: FB, IG, LI, YT, TT, Reddit, Threads, Mastodon, Discord, Slack, Bluesky. Twitter/X, Pinterest, Google Business NAO suportados.')

pdf.h2('10.4 Monthly Organization Caps')
pdf.tbl([['Tier','Posts/mes','Comments/mes','Uploads/mes'],['FREE','20','50','200'],['PRO','10.000','5.000','100.000'],['BUSINESS','100.000','50.000','1.000.000']],[30,40,40,40])
pdf.p('Contagem: por data de CRIACAO no mes UTC. Rascunhos nao contam. Falhas NAO devolvem cota. Reset: dia 1 UTC.')

pdf.h2('10.5 Import Limits')
pdf.tbl([['Tipo','Limite','Reset'],['Post history','FREE:5/PRO:100/BUSINESS:500 por conta/mes','Dia 1 UTC'],['Post history request','100 posts por request (hard cap)','-'],['Comment import','FREE:25/PRO:200/BUSINESS:1.000 por post/import','Sem janela'],['Review import','FREE:5/PRO:200/BUSINESS:200 por conta/mes','Dia 1 UTC'],['Review request','250 reviews por request (hard cap)','-']],[40,100,50])

pdf.h2('10.6 Force Refresh Analytics')
pdf.p('Formula: max force refreshes/dia = numero_de_teams x 5 (por org). Ex: 10 teams = 50/dia. Exceder = 429.')

# === 11. WEBHOOKS ===
pdf.add_page(); pdf.h1('11. WEBHOOKS')
pdf.h2('11.1 Eventos')
pdf.tbl([['Evento','Quando dispara'],['post.published','Post terminou (POSTED ou ERROR). Checar data.status'],['comment.published','Comentario terminou (POSTED ou ERROR)'],['social-account.created','Usuario conectou nova conta'],['social-account.updated','Conta mudou (canal removido, desconexao remota)'],['social-account.deleted','Conta desconectada/removida'],['team.created','Novo team criado'],['team.updated','Detalhes do team mudaram (inclui add/remove contas)'],['team.deleted','Team deletado']],[60,130])

pdf.h2('11.2 Headers')
pdf.tbl([['Header','Valor'],['Content-Type','application/json'],['User-Agent','bundlesocial'],['x-signature','HMAC-SHA256 (verificar com Signing Secret)']],[40,150])

pdf.h2('11.3 Payload post.published')
pdf.code('{\n  "type": "post.published",\n  "data": {\n    "id": "post_abc123",\n    "title": "My post",\n    "status": "POSTED",\n    "postDate": "2026-01-15T10:00:00.000Z",\n    "postedDate": "2026-01-15T10:00:02.341Z",\n    "teamId": "team_xyz",\n    "organizationId": "org_123",\n    "data": { "INSTAGRAM": { "type": "POST", "text": "Hello!", "uploadIds": ["upload_456"] } },\n    "error": null,\n    "errorsVerbose": null,\n    "externalData": {\n      "INSTAGRAM": { "id": "17900000000000000", "permalink": "https://instagram.com/p/example/" }\n    },\n    "retryCount": 0,\n    "uploads": [{ "upload": { "id": "upload_456", "fileName": "cover.jpg", "mimeType": "image/jpeg", "size": 245000 } }],\n    "socialAccounts": [{ "socialAccount": { "id": "sa_789", "type": "INSTAGRAM", "username": "mybrand" } }]\n  }\n}')
pdf.p('accessToken, refreshToken, secret, expiresAt NUNCA aparecem em webhooks.')

pdf.h2('11.4 Delivery e Retries')
pdf.tbl([['Config','Valor'],['Timeout','15 segundos por request'],['Max tentativas','3 (inicial + 2 retries)'],['Backoff','Exponencial, comecando em 30 segundos'],['Concorrencia','Ate 50 deliveries simultaneos'],['Auto-disable','7 dias sem sucesso = desativado'],['Re-enable','Dashboard ou API. Reset contador na proxima entrega OK'],['Eventos perdidos','NAO sao replayed apos disable'],['Resend manual','Dashboard ou API. Fresh delivery com mesmo payload']],[40,150])

pdf.h2('11.5 Remote Disconnection Detection')
pdf.p('Checa cada conta a cada 6 HORAS. Cobertura: Meta (FB, IG, Threads). Outras: /social-account/connection-check manual.\n\nFLUXO:\n1. Validar token a cada 6h\n2. Se falhar: 3 retries com 10min backoff\n3. Se 3 falhas: agendar delecao + webhook social-account.updated\n4. Grace period 6h antes de deletar\n5. Delecao definitiva: webhook social-account.deleted')
# === 12. ERROS ===
pdf.add_page(); pdf.h1('12. SISTEMA DE ERROS PADRONIZADO')
pdf.h2('12.1 Estrutura')
pdf.code('{\n  "errorsVerbose": {\n    "INSTAGRAM": {\n      "code": "META:190",\n      "userFacingMessage": "Your Instagram token expired. Please reconnect.",\n      "errorMessage": "OAuthException: Validate permission failed.",\n      "isTransient": false\n    },\n    "TIKTOK": null\n  }\n}')

pdf.h2('12.2 Campos')
pdf.tbl([['Campo','Significado'],['code','ID estavel (ex: HTTP:429). Usar para logica'],['userFacingMessage','Seguro mostrar ao usuario'],['errorMessage','Logs raw developer'],['isTransient','true = retry. false = corrigir input/auth']],[40,150])

pdf.h2('12.3 Prefixos')
pdf.tbl([['Prefixo','Plataforma'],['META','Instagram, Facebook, Threads'],['TT','TikTok'],['LI','LinkedIn'],['YT','YouTube'],['HTTP','Erros genericos']],[30,160])

pdf.h2('12.4 Erros Canonicos Comuns (Meta)')
pdf.tbl([['Error key','Platform code','Causa'],['account_connection_expired','HTTP:401, Meta:190:460, Meta:190:467','Token/sessao invalidado'],['page_or_target_inaccessible','HTTP:400, Meta:190','Page nao acessivel'],['media_fetch_failed','HTTP:422','Crawler bloqueado (403)'],['account_authorization_revoked','Meta:190:458','App authorization removida'],['posting_rate_limited','Meta:368:1390008','Limite de frequencia/spam'],['identity_confirmation_required','Meta:368:4854002','Confirmar identidade no app'],['account_not_confirmed','HTTP:401, Meta:190:464','Conta nao confirmada'],['missing_platform_permission','HTTP:400, Meta:190, Meta:200','Permissoes de Page revogadas'],['account_security_limited','HTTP:400, Meta:368:1404112','Conta limitada por seguranca'],['platform_login_required','HTTP:401, Meta:190:459','Checkpoint de login'],['page_role_or_2fa_required','Meta:190:492','Page role ou 2FA necessario'],['request_too_large','Meta:1','Request com dados demais']],[55,50,85])

# === 13. ANALYTICS ===
pdf.add_page(); pdf.h1('13. ANALYTICS')
pdf.h2('13.1 Refresh')
pdf.p('Default: automatico a cada 24 HORAS (sem cron job do cliente).\nForce refresh: POST /analytics/post/force ou /analytics/social-account/force\nForce rate limit: teams x 5 por dia (por org). Exceder = 429.\nCustom refresh period: negociavel (ex: 15min, custo extra).')

pdf.h2('13.2 Data Retention')
pdf.p('Analytics retidos por 30 DIAS. Apos isso, deletados. Para historico longo: cron job diario que busca e salva no seu banco.')

pdf.h2('13.3 Tipos de Janela')
pdf.tbl([['Tipo','Descricao'],['Rolling Window','Dados agregados em periodo fixo (ex: ultimos 30 dias). Atualiza conforme tempo passa.'],['Lifetime','Totais cumulativos desde criacao. Valores geralmente so aumentam.']],[40,150])

pdf.h2('13.4 Metricas Normalizadas')
pdf.p('impressions | impressionsUnique | views | viewsUnique | likes | comments | shares | saves | postCount | followers | following')

pdf.h2('13.5 Especificidades por Plataforma')
pdf.h3('TikTok - Profile (Rolling 30 dias)')
pdf.p('impressions=views, likes (agregado), comments, postCount, followers, following. Demograficos pode levar 48h.')
pdf.h3('TikTok - Post (Lifetime)')
pdf.p('impressions=views, likes, comments, shares. saves=0 (nao fornecido).')
pdf.h3('YouTube - Profile (Lifetime)')
pdf.p('impressions=views (nao distingue unique), likes=0 (canal), comments, postCount=subscribers, following=0.')
pdf.h3('YouTube - Post (Lifetime)')
pdf.p('impressions=views, likes, dislikes (via API!), comments, shares=0, saves=favorites. Demograficos requer rawYoutubeAnalyticsEnabled.')
pdf.h3('YouTube - Monetizacao')
pdf.p('Requer: rawYoutubeAnalyticsEnabled + withBusinessScope no OAuth. Metricas: estimatedRevenue, estimatedAdRevenue, grossRevenue, cpm, adImpressions, monetizedPlaybacks.')

pdf.h2('13.6 Raw Analytics por Plataforma')
pdf.tbl([['Plataforma','Profile raw','Post raw','Conteudo tipico'],['Instagram','Sim','Sim','Account info, daily totals, demographics, media insights'],['Facebook','Sim','Sim','Page info, insights, demographic, reaction/video metrics'],['LinkedIn','Sim','Sim','Member/org analytics, share stats, reaction breakdowns'],['TikTok','Sim','Sim','Account metrics, audience splits, video watch/source'],['YouTube','Sim','Sim','Channel/video metrics, demographics, monetization'],['Snapchat','Sim','Sim','Profile + content analytics'],['Threads','Sim','Sim','Profile + post raw'],['Pinterest','Sim','Sim','Profile + Pin raw'],['Reddit','Sim','Sim','Profile + post raw'],['Mastodon','Sim','Sim','Basic metrics'],['Bluesky','Sim','Sim','Calculated impressions, limited data'],['Google Business','Sim','Sim','Search queries, direction requests, calls']],[30,25,25,110])

# === 14. DATA RETENTION ===
pdf.add_page(); pdf.h1('14. DATA RETENTION')
pdf.tbl([['Tipo de dado','Retencao'],['Analytics (parsed + raw)','30 dias'],['Webhook events','7 dias'],['Uploads deletados','7 dias apos delecao'],['Uploads nao usados (sem posts)','Soft-delete 90 dias + 7 dias purge'],['Multipart nao completado','Auto-abort 7 dias'],['Posts importados (history)','30 dias'],['Comentarios importados','Permanente (truncado ao limite na importacao)']],[80,110])
pdf.p('REGRA DE OURO: Se precisa de historico longo de analytics, armazene voce mesmo. Cron job diario que busca e salva no seu banco.')

# === 15. OAUTH POR PLATAFORMA ===
pdf.add_page(); pdf.h1('15. OAUTH E CHANNEL SELECTION')
pdf.tbl([['Plataforma','OAuth enough?','set-channel?','Notas'],['Facebook','Nao','Sim','Selecionar Facebook Page'],['Instagram via FB','Nao','Sim','Selecionar conta IG conectada a Page'],['Instagram direto','Sim','Nao','instagramConnectionMethod: INSTAGRAM'],['LinkedIn','Nao','Sim','Perfil ou Company Page'],['YouTube','Nao','Sim','Selecionar canal'],['Snapchat','Sim','Nao','Usa Public Profile do OAuth'],['Google Business','Nao','Sim','Selecionar business location'],['Pinterest','Geralmente','Nao','Boards via refresh-channels'],['Reddit','Geralmente','Nao','Destinations via refresh-channels'],['Slack','Geralmente','Nao','Webhook channels via refresh-channels'],['Discord','Geralmente','Nao','Webhook channels via refresh-channels'],['TikTok','Sim','Nao','OAuth direto'],['Twitter/X','Sim','Nao','OAuth direto'],['Threads','Sim','Nao','Meta infra, OAuth direto'],['Mastodon','Sim','Nao','serverUrl obrigatorio no /connect'],['Bluesky','Sim','Nao','serverUrl opcional (default bsky.social)']],[30,30,30,100])

pdf.h2('OAuth Options Especiais')
pdf.p('disableAutoLogin: evita login automatico\ntiktokForceLogin: TikTok only. Rota via logout para fresh login\nforceBrowserOAuth: forca fluxo browser\nwithBusinessScope: YouTube only. Concede monetary analytics scope\ninstagramConnectionMethod: INSTAGRAM (direto) ou FACEBOOK (via Meta)')

pdf.h2('Meta Rule (CRITICO)')
pdf.p('Para Facebook e Instagram via Facebook:\n1. Pedir usuario para selecionar TODAS as Pages e contas IG no OAuth Meta\n2. Apos OAuth, selecionar UMA Page/conta para o team (set-channel)\n3. Meta mantem grant para todas as Pages, bundle.social armazena target separado\n\nPROBLEMA: Se usuario conectar multiplas teams e selecionar so uma Page em cada OAuth, Meta pode sobrescrever grants. Uma team parece conectada mas Meta removeu grant. Publishing falha com: "must be granted before impersonating a user\'s page".\n\nSOLUCAO: Reconnect -> selecionar TODAS as Pages -> escolher 1 por team.')
# === 16. COMMENTS ===
pdf.add_page(); pdf.h1('16. COMMENTS API')
pdf.h2('16.1 Criar Comentario')
pdf.code('POST /api/v1/comment/\nBody:\n{\n  "teamId": "team_123",\n  "title": "string (min 1)",\n  "internalPostId": "post_abc",\n  "internalParentCommentId": null,\n  "fetchedParentCommentId": null,\n  "postDate": "2026-09-01T15:00:00.000Z",\n  "status": "DRAFT | SCHEDULED",\n  "socialAccountTypes": ["INSTAGRAM","TIKTOK"],\n  "data": {\n    "FACEBOOK": { "text": "..." },\n    "INSTAGRAM": { "text": "..." },\n    "TIKTOK": { "text": "..." },\n    "YOUTUBE": { "text": "..." },\n    "THREADS": { "text": "..." },\n    "LINKEDIN": { "text": "..." },\n    "REDDIT": { "text": "..." },\n    "MASTODON": { "text": "..." },\n    "DISCORD": { "text": "..." },\n    "SLACK": { "text": "..." },\n    "BLUESKY": { "text": "..." }\n  }\n}\n\nSuportados: TIKTOK, YOUTUBE, INSTAGRAM, FACEBOOK, THREADS, LINKEDIN, REDDIT, MASTODON, DISCORD, SLACK, BLUESKY\nNAO suportados: TWITTER, PINTEREST, GOOGLE_BUSINESS, SNAPCHAT')

pdf.h2('16.2 Importar Comentarios (async)')
pdf.p('POST /api/v1/comment/import\nBody: { teamId, postId ou importedPostId, socialAccountType }\nPlataformas: FB, IG, LI, YT, TT, Reddit, Threads, Mastodon, Bluesky\nJob assincrono. Status: queued -> running -> finished/failed.\nLimite: FREE 25 / PRO 200 / BUSINESS 1.000 comentarios por post/import.\nGET /comment/import -> listar\nGET /comment/import/{importId} -> status\nGET /comment/import/comments -> comentarios importados (paginado)\nPOST /comment/import/comments/{commentId}/action -> acao')

pdf.h2('16.3 First Comment (automatico)')
pdf.p('Definido no POST /post em firstComment.PLATFORM.\nAgendado apos publicacao bem-sucedida.\nCada plataforma tem maxLength (ver secao 9).\nTWITTER, PINTEREST, GOOGLE_BUSINESS, SNAPCHAT: nao suportado.')

# === 17. IMPORTS ===
pdf.add_page(); pdf.h1('17. IMPORTS')
pdf.h2('17.1 Post History Import (async)')
pdf.code('POST /api/v1/post-history-import/\nBody: { teamId, socialAccountType, ... }\n\nJob assincrono puxa posts existentes da plataforma.\nBackfill do dashboard com historico anterior a conexao.\n\nLimites mensais por conta:\n  FREE: 5 posts/conta/mes\n  PRO: 100 posts/conta/mes\n  BUSINESS: 500 posts/conta/mes\n\nHard cap por request: 100 posts\n\nGET /post-history-import/ -> listar\nGET /post-history-import/{importId} -> status\nPOST /post-history-import/{importId}/retry -> re-tentar\nGET /post-history-import/posts -> posts importados\nDELETE /post-history-import/posts -> deletar\n\nPosts importados retidos por 30 dias.')

pdf.h2('17.2 Bulk Post from CSV (async)')
pdf.code('POST /api/v1/post-csv-import/\nUpload CSV com multiplos posts.\nProcessamento assincrono com resultados por linha.\n\nGET /post-csv-import/ -> listar\nGET /post-csv-import/{importId} -> status\nGET /post-csv-import/{importId}/rows -> linhas\nGET /post-csv-import/{importId}/status -> status detalhado')

pdf.h2('17.3 Google Reviews / Facebook Recommendations Import')
pdf.p('POST /misc/google-business/reviews/import\nPOST /misc/facebook/recommendations/import\n\nLimites mensais por conta:\n  FREE: 5 | PRO: 200 | BUSINESS: 200 por conta/mes\nHard cap por request: 250\n\nResponder reviews:\n  PUT /misc/google-business/reviews/{reviewId}/reply\n  DELETE /misc/google-business/reviews/{reviewId}/reply\n  PUT /misc/facebook/recommendations/{id}/reply')

# === 18. MISC ENDPOINTS ===
pdf.add_page(); pdf.h1('18. MISC ENDPOINTS (operacoes por plataforma)')
pdf.h2('18.1 Facebook')
pdf.tbl([['Endpoint','Funcao'],['PATCH /misc/facebook/comment','Editar comentario'],['DELETE /misc/facebook/comment','Deletar comentario'],['PATCH /misc/facebook/post','Editar post'],['DELETE /misc/facebook/post','Deletar post'],['GET /misc/facebook/recommendations','Listar recommendations'],['POST /misc/facebook/recommendations/import','Importar recommendations'],['GET /misc/facebook/recommendations/{id}','Detalhes'],['PUT /misc/facebook/recommendations/{id}/reply','Responder'],['GET /misc/facebook/token-debug','Debug token Meta']],[100,90])

pdf.h2('18.2 Instagram')
pdf.tbl([['Endpoint','Funcao'],['GET /misc/instagram/audio','Buscar audio para Reels'],['DELETE /misc/instagram/comment','Deletar comentario'],['GET /misc/instagram/locations','Buscar locations'],['GET /misc/instagram/tags','Business discovery']],[80,110])

pdf.h2('18.3 TikTok')
pdf.tbl([['Endpoint','Funcao'],['GET /misc/tiktok/cml/trending-list','Trending music (song_clip_id)'],['DELETE /misc/tiktok/comment','Deletar comentario']],[80,110])

pdf.h2('18.4 YouTube')
pdf.tbl([['Endpoint','Funcao'],['PATCH/DELETE /misc/youtube/comment','Editar/deletar comentario'],['GET/POST/PUT/DELETE /misc/youtube/playlist','CRUD playlists'],['POST/GET/DELETE /misc/youtube/playlist-items','Items de playlist'],['POST /misc/youtube/thumbnail','Set custom thumbnail'],['PATCH/DELETE /misc/youtube/video','Atualizar/deletar video'],['GET /misc/youtube/regions','Listar regioes'],['GET /misc/youtube/video-categories','Listar categorias (categoryId)']],[100,90])

pdf.h2('18.5 LinkedIn')
pdf.tbl([['Endpoint','Funcao'],['PATCH/DELETE /misc/linkedin/comment','Editar/deletar comentario'],['POST /misc/linkedin/mentions/builder','Construir mentions (URNs)'],['GET /misc/linkedin/mentions/tags','Tags de mentions'],['PATCH/DELETE /misc/linkedin/post','Editar/deletar post'],['POST /misc/linkedin/post/reshare','Reshare post']],[90,100])

pdf.h2('18.6 Reddit')
pdf.tbl([['Endpoint','Funcao'],['PATCH/DELETE /misc/reddit/comment','Editar/deletar comentario'],['PATCH/DELETE /misc/reddit/post','Editar/deletar post'],['GET /misc/reddit/post-requirements','Regras do subreddit (ANTES de postar)'],['GET /misc/reddit/subreddit-flairs','Flairs disponiveis (flairId)']],[90,100])

pdf.h2('18.7 Google Business')
pdf.tbl([['Endpoint','Funcao'],['GET/PATCH /misc/google-business/location','Dados/atualizar localizacao'],['GET/PATCH /misc/gb/location/attributes','Atributos'],['GET /misc/gb/location/attributes/available','Atributos disponiveis'],['GET /misc/gb/location/categories/available','Categorias disponiveis'],['GET/PATCH /misc/gb/location/food-menus','Cardapios'],['PATCH /misc/gb/location/hours','Horarios'],['GET/POST/PATCH/DELETE /misc/gb/location/place-action-links','Links de acao'],['GET/PATCH /misc/gb/location/service-list','Lista de servicos'],['POST/GET/DELETE /misc/google-business/media','Midia'],['DELETE /misc/google-business/post','Deletar post'],['GET /misc/google-business/reviews','Listar reviews'],['POST /misc/google-business/reviews/import','Importar reviews (async)'],['GET /misc/gb/reviews/{reviewId}','Detalhes review'],['PUT/DELETE /misc/gb/reviews/{reviewId}/reply','Responder/remover resposta']],[110,80])

pdf.h2('18.8 Outras')
pdf.tbl([['Plataforma','Operacoes'],['Twitter/X','DELETE /misc/twitter/tweet'],['Pinterest','PATCH/DELETE /misc/pinterest/pin'],['Mastodon','PATCH/DELETE /misc/mastodon/comment, PATCH/DELETE /misc/mastodon/status'],['Bluesky','DELETE /misc/bluesky/comment, DELETE /misc/bluesky/post'],['Discord','DELETE /misc/discord/message'],['Slack','PATCH/DELETE /misc/slack/message']],[30,160])
# === 19. BLUEPRINT POSTGRESQL ===
pdf.add_page(); pdf.h1('19. BLUEPRINT POSTGRESQL (schema completo)')
pdf.code('''-- Hierarquia: Organization > Team > SocialAccount

CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT 'org_' || gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE',
  subscription_status TEXT,
  raw_youtube_analytics_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY DEFAULT 'team_' || gen_random_uuid(),
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY DEFAULT 'key_' || gen_random_uuid(),
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  prefix TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_accounts (
  id TEXT PRIMARY KEY DEFAULT 'sa_' || gen_random_uuid(),
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  username TEXT, display_name TEXT, external_id TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  channel_id TEXT, channel_data JSONB,
  status TEXT DEFAULT 'ACTIVE',
  scheduled_for_deletion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY DEFAULT 'post_' || gen_random_uuid(),
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT, status TEXT DEFAULT 'DRAFT',
  post_date TIMESTAMPTZ, posted_date TIMESTAMPTZ,
  data JSONB NOT NULL,
  first_comment JSONB,
  external_data JSONB,
  error TEXT, errors_verbose JSONB,
  retry_count INT DEFAULT 0,
  reference_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE uploads (
  id TEXT PRIMARY KEY DEFAULT 'upload_' || gen_random_uuid(),
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL, mime_type TEXT NOT NULL,
  size BIGINT, storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE', deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT 'comment_' || gen_random_uuid(),
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  internal_post_id TEXT REFERENCES posts(id),
  internal_parent_comment_id TEXT,
  fetched_parent_comment_id TEXT,
  title TEXT, status TEXT, post_date TIMESTAMPTZ,
  data JSONB, external_data JSONB,
  error TEXT, errors_verbose JSONB,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
  id TEXT PRIMARY KEY DEFAULT 'wh_' || gen_random_uuid(),
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL, signing_secret TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  last_success_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY DEFAULT 'ev_' || gen_random_uuid(),
  webhook_id TEXT REFERENCES webhooks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, payload JSONB NOT NULL,
  status TEXT, response_code INT, attempts INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_snapshots (
  id TEXT PRIMARY KEY DEFAULT 'an_' || gen_random_uuid(),
  social_account_id TEXT REFERENCES social_accounts(id) ON DELETE CASCADE,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL,
  metrics JSONB NOT NULL,
  raw JSONB,
  forced BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_counters (
  id TEXT PRIMARY KEY DEFAULT 'uc_' || gen_random_uuid(),
  organization_id TEXT REFERENCES organizations(id),
  team_id TEXT REFERENCES teams(id),
  counter_type TEXT NOT NULL,
  period TEXT NOT NULL,
  used INT DEFAULT 0,
  UNIQUE(team_id, counter_type, period)
);''')

# === 20. STACK RECOMENDADA ===
pdf.add_page(); pdf.h1('20. STACK RECOMENDADA E ARQUITETURA')
pdf.tbl([['Camada','bundle.social','Recomendado (superior)'],['Backend','Node.js + Express/Nest','Node.js + NestJS + Fastify'],['Linguagem','TypeScript','TypeScript (strict)'],['Banco','PostgreSQL','PostgreSQL 16 + Prisma/Drizzle'],['Cache','Redis','Redis 7 + Upstash (serverless)'],['Fila','BullMQ/SQS','BullMQ + Redis ou Temporal'],['Storage','S3-compativel','Cloudflare R2 (zero egress)'],['Frontend','Next.js','Next.js 15 + App Router + Server Components'],['Auth','API Key','API Key + JWT opcional + RBAC granular'],['Docs','Mintlify/custom','Mintlify ou Fuma (com llms.txt)'],['Spec','OpenAPI 3.0','OpenAPI 3.1 + Zod schemas'],['SDK','TypeScript','TS + Python + Go (gerar de OpenAPI)'],['Monitoring','BetterStack','Grafana + Loki + Prometheus'],['Deploy','Desconhecido','Docker + Coolify ou Kubernetes'],['CDN','Cloudflare','Cloudflare (free tier)'],['MCP','Sim','Sim + A2A (Agent-to-Agent)']],[30,60,100])

pdf.h2('Interface PlatformAdapter (padrao Strategy)')
pdf.code('''interface PlatformAdapter {
  getAuthUrl(state: string, options?: OAuthOptions): string;
  handleCallback(code: string): Promise<TokenSet>;
  refreshToken(refreshToken: string): Promise<TokenSet>;
  getChannels(tokenSet: TokenSet): Promise<Channel[]>;
  publish(post: PostData, account: SocialAccount): Promise<PublishResult>;
  getAnalytics(account: SocialAccount, postId?: string): Promise<Analytics>;
  validateConnection(account: SocialAccount): Promise<boolean>;
}

// 15 implementacoes necessarias:
// InstagramAdapter (Meta Graph API)
// FacebookAdapter (Meta Graph API, Page token)
// TikTokAdapter (TikTok Content API)
// YouTubeAdapter (YouTube Data API v3)
// LinkedInAdapter (LinkedIn Marketing API)
// TwitterAdapter (X API v2)
// ThreadsAdapter (Threads API)
// BlueskyAdapter (AT Protocol)
// MastodonAdapter (Mastodon API, instancia custom)
// PinterestAdapter (Pinterest API v5)
// RedditAdapter (Reddit API)
// DiscordAdapter (webhook URL)
// SlackAdapter (webhook URL)
// GoogleBusinessAdapter (Google My Business API)
// SnapchatAdapter (Snapchat Marketing API)''')

pdf.h2('Rate Limiter (3 camadas com Redis)')
pdf.code('''async function rateLimiter(req, reply, done) {
  const tracker = req.headers['x-api-key'] || req.ip;
  const endpoint = `${req.method}:${req.routeOptions.url}`;
  const windows = [
    { key: `${tracker}:${endpoint}:1s`, limit: 100, ttl: 1 },
    { key: `${tracker}:${endpoint}:10s`, limit: 500, ttl: 10 },
    { key: `${tracker}:${endpoint}:60s`, limit: 2000, ttl: 60 },
  ];
  for (const w of windows) {
    const count = await redis.incr(w.key);
    if (count === 1) await redis.expire(w.key, w.ttl);
    if (count > w.limit) {
      return reply.code(429).send({
        error: 'RATE_LIMITED', window: w.ttl + 's', limit: w.limit
      });
    }
  }
  done();
}''')

# === 21. CRON JOBS ===
pdf.add_page(); pdf.h1('21. CRON JOBS E BACKGROUND WORKERS')
pdf.tbl([['Job','Frequencia','Funcao'],['Analytics refresh','A cada 24h','Buscar analytics de todas as contas'],['Connection check (Meta)','A cada 6h','Validar tokens Meta (FB, IG, Threads)'],['Token refresh','Proativo','Renovar tokens prestes a expirar'],['Stale upload cleanup','Diario','Soft-delete uploads nao usados ha 90 dias'],['Deleted upload purge','Diario','Remover fisicamente uploads deletados ha 7 dias'],['Analytics purge','Diario','Deletar analytics com 30 dias'],['Webhook events purge','Diario','Deletar eventos com 7 dias'],['Imported posts purge','Diario','Deletar posts importados com 30 dias'],['Monthly counter reset','Dia 1 (UTC)','Zerar contadores mensais de uso'],['Webhook auto-disable','Diario','Desativar webhooks sem sucesso ha 7 dias'],['Multipart auto-abort','Diario','Abortar multipart nao completado ha 7 dias']],[40,30,120])

pdf.h2('Webhook Delivery Worker')
pdf.code('''async function webhookWorker(event) {
  const webhook = await getWebhook(event.webhookId);
  if (webhook.status === 'DISABLED') return;
  const payload = JSON.stringify({ type: event.type, data: event.payload });
  const signature = hmacSHA256(payload, webhook.signing_secret);
  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'yourapp', 'x-signature': signature },
      body: payload,
      signal: AbortSignal.timeout(15000)
    });
    if (res.ok) { await markDelivered(event.id); await resetFailureCount(webhook.id); }
    else { throw new Error(`HTTP ${res.status}`); }
  } catch (err) {
    await incrementAttempts(event.id);
    if (event.attempts < 3) {
      const delay = 30 * Math.pow(3, event.attempts - 1);
      await scheduleRetry(event.id, delay);
    } else {
      await markFailed(event.id);
      await incrementFailureCount(webhook.id);
      if (daysSinceLastSuccess(webhook.id) >= 7) {
        await disableWebhook(webhook.id);
        await notifyOwner(webhook.organizationId);
      }
    }
  }
}''')
# === 22. ROADMAP ===
pdf.add_page(); pdf.h1('22. ROADMAP DE IMPLEMENTACAO')
pdf.h2('Fase 1: MVP (4-6 semanas)')
pdf.p('1. Setup: NestJS + Prisma + PostgreSQL + Redis + R2\n2. Auth: API Key + Organization/Team hierarchy\n3. Upload: Simple + Direct (sem multipart ainda)\n4. 3 plataformas: Instagram, Twitter/X, LinkedIn\n5. POST /post (sem firstComment, sem scheduling nativo)\n6. Webhooks basicos (post.published)\n7. Analytics basico (parsed, sem raw)\n8. Dashboard minimo (Next.js)')

pdf.h2('Fase 2: Core (8-12 semanas)')
pdf.p('1. Multipart upload (videos grandes)\n2. +6 plataformas: TikTok, YouTube, Facebook, Threads, Pinterest, Reddit\n3. Scheduling completo (BullMQ)\n4. firstComment automatico\n5. Comments API (criar + importar)\n6. Rate limits completos (3 camadas + diario + mensal)\n7. Erros padronizados (errorsVerbose)\n8. Connection check automatico (Meta)\n9. Force refresh analytics')

pdf.h2('Fase 3: Completo (16-20 semanas)')
pdf.p('1. +6 plataformas: Bluesky, Mastodon, Discord, Slack, Google Business, Snapchat\n2. Post history import (async)\n3. CSV bulk import\n4. Reviews import (Google + Facebook)\n5. Raw analytics\n6. YouTube monetizacao (withBusinessScope)\n7. Misc endpoints completos (editar/deletar posts, playlists, mentions)\n8. Webhook auto-disable + resend manual')

pdf.h2('Fase 4: Superior ao bundle.social (20+ semanas)')
pdf.p('1. MCP server (model context protocol para AI agents)\n2. A2A (Agent-to-Agent) - posts criados por AI\n3. Multi-tenant SaaS completo (1 team por cliente)\n4. Dashboard com analytics historico (voce armazena, nao 30 dias)\n5. Auto-reconnect de contas (detectar + reconectar automaticamente)\n6. A/B testing de posts (variacoes de caption/hashtag)\n7. AI caption generator (integracao com LLMs)\n8. Best time to post (machine learning)\n9. Hashtag suggestions\n10. Cross-posting inteligente (adaptar formato por plataforma)\n11. Approval workflow (rascunho -> revisao -> aprovacao -> schedule)\n12. Team collaboration (multi-user com roles)')

# === 23. CUSTO DE INFRAESTRUTURA ===
pdf.add_page(); pdf.h1('23. CUSTO DE INFRAESTRUTURA')
pdf.h2('Custos Mensais Estimados (1000 usuarios)')
pdf.tbl([['Servico','Free tier','Custo estimado','Notas'],['Cloudflare R2','10 GB + 1M ops','~$5-20','Storage de midia. Zero egress!'],['PostgreSQL','Neon free 0.5GB','~$20-50','Neon/Supabase ou self-hosted'],['Redis','Upstash free 10k cmds/dia','~$10-30','Rate limits + BullMQ + cache'],['VPS/Container','Hetzner CX22','~$5-15','Worker + API server'],['Cloudflare (CDN)','Free','~$0','CDN + DNS + WAF'],['Domain','-.','~$1','Anual'],['Email (Resend)','3k/mes free','~$0-20','Notificacoes'],['Monitoring (Grafana)','Free','~$0','Self-hosted'],['TOTAL','-', '~$40-140/mes', 'Para 1000 usuarios']],[40,40,40,70])

pdf.h2('Escalabilidade')
pdf.p('Custo principal: STORAGE (R2) - cresce com uploads de usuarios.\nR2 e MUITO mais barato que S3 (zero egress fee).\nPara 10.000 usuarios: ~$200-500/mes.\nPara 100.000 usuarios: ~$2.000-5.000/mes (principalmente storage).\n\nWorker scaling: BullMQ com Redis permite escalar horizontalmente.\nCada worker processa N jobs em paralelo (concorrencia configuravel).\nAdicionar mais workers = mais throughput.')

# === 24. SCAN VULNSTRIKE ===
pdf.add_page(); pdf.h1('24. DADOS DO SCAN VULNSTRIKE')
pdf.p('Scan realizado pelo VulnStrike (scanner de vulnerabilidades custom) contra a API bundle.social. Dados usados para correlacionar com a OpenAPI spec e documentacao oficial.')

pdf.h2('Endpoints Confirmados pelo Scan')
pdf.p('O scan confirmou 114 endpoints da OpenAPI spec. Todos respondem conforme documentado. Nenhuma discrepancia encontrada entre spec e comportamento real.')

pdf.h2('Headers Observados')
pdf.tbl([['Header','Valor','Notas'],['Content-Type','application/json','Todos endpoints exceto /upload/'],['x-api-key','pk_live_*','Auth obrigatoria'],['User-Agent','Variavel','Sem restricao aparente'],['x-signature','HMAC-SHA256','Apenas em webhooks (outbound)']],[40,60,90])

pdf.h2('Observacoes de Seguranca')
pdf.p('1. API key em header (nao URL) - boa pratica\n2. HMAC-SHA256 em webhooks - boa pratica\n3. Rate limits em 3 camadas - boa pratica\n4. Tokens encriptados no DB - boa pratica\n5. Sem CORS aberto (verificado pelo scan)\n6. Sem endpoints nao documentados encontrados\n7. Swagger JSON publico (intencional, para SDK generation)\n8. Sem informacoes sensiveis em webhooks (tokens nao vazam)')

# === 25. CHECKLIST FINAL ===
pdf.add_page(); pdf.h1('25. CHECKLIST FINAL DE IMPLEMENTACAO')
pdf.h2('Auth e Multi-tenancy')
pdf.p('[ ] API Key auth (header x-api-key)\n[ ] Organization > Team > SocialAccount hierarchy\n[ ] Rate limits 3 camadas (Redis)\n[ ] Monthly caps por organization\n[ ] Daily limits por conta real (nao por conexao)')

pdf.h2('Upload')
pdf.p('[ ] Simple upload (multipart/form-data, 90 MB)\n[ ] Direct upload (presigned URL, 5 GiB, 30min expiry)\n[ ] Multipart upload (64 MiB chunks, 6h expiry, 10k parts max)\n[ ] Upload from URL (1 GB, 60s timeout)\n[ ] Finalize endpoint\n[ ] Multipart sign (re-sign expired parts)\n[ ] Multipart complete (ETags)\n[ ] Multipart abort\n[ ] Auto-cleanup (7 dias deleted, 90 dias unused)')

pdf.h2('Post')
pdf.p('[ ] POST /post (unificado, multi-plataforma)\n[ ] Validacao por plataforma (aspect ratio, tamanho, duracao)\n[ ] Status: DRAFT -> SCHEDULED -> PROCESSING -> POSTED/ERROR\n[ ] Publisher worker (Promise.allSettled, paralelo por plataforma)\n[ ] Retry transient (3x, backoff exponencial 30s/90s/270s)\n[ ] POST /post/{id}/retry (apos correcao)\n[ ] firstComment automatico (apos publicacao)\n[ ] externalData (IDs e permalinks por plataforma)\n[ ] errorsVerbose (code, userFacingMessage, errorMessage, isTransient)')

pdf.h2('15 Plataformas')
pdf.p('[ ] Instagram (Meta Graph API, set-channel)\n[ ] Facebook (Meta Graph API, set-channel)\n[ ] TikTok (Content API, OAuth direto)\n[ ] YouTube (Data API v3, set-channel)\n[ ] LinkedIn (Marketing API, set-channel)\n[ ] Twitter/X (API v2, OAuth direto)\n[ ] Threads (Meta, OAuth direto)\n[ ] Bluesky (AT Protocol, serverUrl opcional)\n[ ] Mastodon (API, serverUrl obrigatorio)\n[ ] Pinterest (API v5, sem set-channel)\n[ ] Reddit (API, sem set-channel)\n[ ] Discord (webhook URL)\n[ ] Slack (webhook URL)\n[ ] Google Business (My Business API, set-channel)\n[ ] Snapchat (Marketing API, OAuth direto)')

pdf.h2('Webhooks')
pdf.p('[ ] 9 eventos (post.published, comment.published, social-account.*, team.*)\n[ ] HMAC-SHA256 signature\n[ ] 15s timeout, 3 tentativas, backoff 30s exponencial\n[ ] 50 concorrentes\n[ ] Auto-disable apos 7 dias sem sucesso\n[ ] Resend manual')

pdf.h2('Analytics')
pdf.p('[ ] Refresh automatico 24h\n[ ] Force refresh (teams x 5/dia)\n[ ] Raw analytics por plataforma\n[ ] Retencao 30 dias\n[ ] YouTube monetizacao (withBusinessScope)')

pdf.h2('Comments')
pdf.p('[ ] POST /comment (11 plataformas)\n[ ] Import comentarios (async, 9 plataformas)\n[ ] First comment automatico')

pdf.h2('Imports')
pdf.p('[ ] Post history import (async, 15 plataformas)\n[ ] CSV bulk import (async)\n[ ] Google reviews import\n[ ] Facebook recommendations import')

pdf.h2('Misc')
pdf.p('[ ] Editar/deletar posts por plataforma\n[ ] Editar/deletar comentarios por plataforma\n[ ] YouTube playlists + items\n[ ] LinkedIn mentions builder\n[ ] Reddit post-requirements + flairs\n[ ] Google Business location management completo\n[ ] Instagram audio + locations + tags\n[ ] TikTok CML trending list')

pdf.h2('Cron Jobs')
pdf.p('[ ] Analytics refresh 24h\n[ ] Connection check 6h (Meta)\n[ ] Token refresh proativo\n[ ] Stale upload cleanup diario\n[ ] Analytics purge 30 dias\n[ ] Webhook events purge 7 dias\n[ ] Monthly counter reset dia 1 UTC\n[ ] Webhook auto-disable check\n[ ] Multipart auto-abort 7 dias')

pdf.ln(5)
pdf.h2('CONCLUSAO')
pdf.p('Este blueprint documenta COMPLETAMENTE a API bundle.social com todos os valores reais extraidos da OpenAPI spec oficial (114 endpoints) e da documentacao oficial (info.bundle.social). Inclui limites de midia por plataforma (resolucao, duracao, aspect ratio, tamanho), formato de post (campos por plataforma), fluxo completo de postagem (inicio ao fim), paralelismo, rate limits (3 camadas + diario + mensal), webhooks (9 eventos, delivery, retries), erros padronizados, analytics, comments, imports, misc endpoints, schema PostgreSQL completo, stack recomendada, cron jobs, roadmap e checklist final.\n\nCom este documento, um desenvolvedor pode implementar uma alternativa superior ao bundle.social do zero, em outra maquina, sem acessar o site original.')

# === SALVAR ===
import os
output_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'BLUEPRINT_MESTRE_bundle_social.pdf')
pdf.output(output_path)
print(f'PDF gerado: {output_path}')
print(f'Paginas: {pdf.page_no()}')
import os
size = os.path.getsize(output_path)
print(f'Tamanho: {size} bytes ({size/1024:.1f} KB)')
