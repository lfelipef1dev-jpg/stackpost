# Manual de Bots - Regras Gerais para Qualquer Rede Social

> Sistema inteligente de bots para redes sociais.
> Cada bot faz BIOS + growth. StackPost faz postagem (imagem/video/texto).
> Bots NAO postam. StackPost posta.

---

## 1. PRINCIPIO FUNDAMENTAL

### O que o BOT faz:
- BIOS (perfil): nome, headline, bio, banner, foto
- Growth: visitar, seguir, curtir, comentar, compartilhar
- Manter sessao logada
- Mapear fluxos e travar

### O que o BOT NAO faz:
- Postar imagem
- Postar video
- Postar texto
- Agendar posts

### O que o STACKPOST faz:
- Cadastrar posts (texto + imagem + video)
- Converter media pro tamanho de cada plataforma
- Agendar posts
- Publicar automatico (cron Cloudflare)
- Postar o mesmo texto em todas as redes ao mesmo tempo

---

## 2. ESTRUTURA DE PASTAS

Cada rede social tem sua propria pasta:

```
C:\Users\lfeli\Desktop\
├── LinkedIn_Bot\          (ja existe)
├── Instagram_Bot\         (ja existe - bot de growth)
├── Facebook_Bot\          (criar)
├── TikTok_Bot\            (criar)
├── YouTube_Bot\           (criar)
├── Twitter_Bot\           (criar)
├── Threads_Bot\           (criar)
├── Pinterest_Bot\         (criar)
├── Reddit_Bot\            (criar)
├── Bluesky_Bot\           (criar)
├── Mastodon_Bot\          (criar)
└── StackPost\             (ja existe - publicador)
```

### Arquivos obrigatorios de cada bot:

```
{Rede}_Bot\
├── AGENTS.md                    # Regras do bot
├── {rede}_state.json            # Sessao Playwright
├── {rede}_core.py               # Nucleo (abrir/fechar navegador)
├── MAPEAMENTO_COMPLETO.json     # Fluxos travados
├── LIMITES_{REDE}.json          # Limites de acao por dia
├── PROSPECTS_LISTA.json         # Lista de prospects (growth)
├── CHECKLIST_POSTAGENS.txt      # Historico (nao repetir)
├── executor.py                  # Executor de fluxos
├── executor_growth.py           # Executor de growth
├── fazer_bios.py                # Script de BIOS (perfil)
├── mapear_*.py                  # Scripts de mapeamento
└── imagens_expostacker\         # Assets da marca
    ├── banner\
    ├── logo\
    └── posts\
```

---

## 3. ETAPAS PARA CRIAR UM BOT NOVO

### ETAPA 1 - Criar pasta e estrutura
1. Criar pasta `{Rede}_Bot` no Desktop
2. Criar `AGENTS.md` com regras
3. Criar `{rede}_core.py` (abrir/fechar navegador)
4. Criar `LIMITES_{REDE}.json` (limites da plataforma)

### ETAPA 2 - Login e sessao
1. Abrir Chromium (Playwright, sem channel="chrome")
2. Fazer login na rede social
3. Salvar sessao em `{rede}_state.json`
4. Verificar sessao: abrir pagina, confirmar logado

### ETAPA 3 - Mapear e fazer BIOS
1. Mapear pagina de edicao de perfil
2. Mapear campos: nome, headline/bio, foto, banner
3. Executar BIOS:
   - **Nome:** ExpoStacker Studio (ou nome da marca)
   - **Headline/Bio:** igual ao Instagram e LinkedIn
   - **Foto:** logo da ExpoStacker
   - **Banner:** banner da ExpoStacker (1584x396 ou tamanho da plataforma)
4. Verificar BIOS aplicada
5. Travamento de fluxo em `MAPEAMENTO_COMPLETO.json`

### ETAPA 4 - Mapear growth
1. Mapear busca de prospects (ICP)
2. Mapear visitar perfil
3. Mapear seguir perfil
4. Mapear curtir post
5. Mapear comentar post
6. Mapear compartilhar/repostar
7. Mapear seguir empresa/page
8. Travamento de cada fluxo

### ETAPA 5 - Conectar no StackPost
1. Criar app de desenvolvedor na plataforma
2. Configurar OAuth (client_id, client_secret, redirect_uri)
3. Adicionar redirect URI: `https://stackpost.expostacker.com.br/api/oauth/{rede}/callback`
4. Solicitar scopes necessarios
5. Verificar Company Page (se aplicavel)
6. Implementar adapter em `apps/web/src/lib/adapters/{rede}-api.ts`
7. Implementar callback em `apps/web/src/app/api/oauth/{rede}/callback/route.ts`
8. Adicionar adapter em `apps/web/src/lib/adapters/index.ts`
9. Deploy via git push
10. Autorizar conexao pelo StackPost
11. Confirmar conta aparece em `/api/accounts`
12. Testar publicacao real

### ETAPA 6 - Travamento final
1. Documentar todos os fluxos em `MAPEAMENTO_COMPLETO.json`
2. Documentar limites em `LIMITES_{REDE}.json`
3. Documentar regras em `AGENTS.md`
4. Testar end-to-end: BIOS + growth + StackPost publica

---

## 4. REGRA DE BIOS (PERFIL)

### Padronizacao obrigatoria:

| Campo | Valor |
|-------|-------|
| Nome | ExpoStacker Studio (ou permitido pela plataforma) |
| Headline/Bio | ExpoStacker \| Software e IA no Brasil \| Nexus IA: 19 modelos de IA em um so lugar \| Claude, GPT, Gemini, Grok, Mistral \| PT-BR, PIX \| Teste gratis abaixo |
| Foto | Logo ExpoStacker (quadrado, min 400x400) |
| Banner | Banner ExpoStacker (tamanho da plataforma) |
| Website | expostacker.com.br |

### PROIBIDO em BIOS:
- Numeros de produtos ("12 produtos", "10 produtos")
- Nome pessoal (Luiz Felipe Ferro) - deixar se a plataforma exigir
- Referencias a portfolio antigo
- Referencias a Felipe Web Solution
- Textos diferentes entre plataformas

### Tamanhos de banner por plataforma:

| Plataforma | Tamanho banner | Proporcao |
|------------|----------------|-----------|
| LinkedIn | 1584x396 | 4:1 |
| Instagram (highlight cover) | 1080x1080 | 1:1 |
| Facebook (cover) | 820x312 | 2.63:1 |
| Twitter/X | 1500x500 | 3:1 |
| YouTube | 2560x1440 | 16:9 |
| TikTok | 200x200 (avatar) | 1:1 |
| Pinterest | 800x600 (board cover) | 4:3 |

---

## 5. REGRA DE GROWTH

### ICP (Ideal Customer Profile):
- Empreendedores brasileiros
- Donos de pequenas empresas
- Desenvolvedores
- Startups
- Agencias de marketing

### Acoes de growth (bot):
1. Buscar prospects por ICP
2. Visitar perfil (warmup)
3. Seguir perfil
4. Curtir post recente
5. Comentar post (texto relevante, nao generico)
6. Compartilhar/repostar
7. Seguir empresa do prospect

### Limites (90% do teto da plataforma):
- Delay aleatorio: 30-90s entre acoes
- Horario: 8h-18h Brasil
- Fim de semana: reduzir 60%
- Variar numero todo dia (nunca fixo)
- Pausa longa a cada 20-30 acoes (15-30 min)
- Nunca repetir prospect
- Nunca repetir comentario
- Status: "novo" -> "visitado" -> "seguido"

---

## 6. REGRA DE SESSAO

### Navegador (TRAVADO - NAO MUDAR):
- SEMPRE usar Chromium do Playwright (sem channel="chrome")
- NUNCA usar channel="chrome"
- Sessao salva em `{rede}_state.json`
- Args: `["--disable-blink-features=AutomationControlled"]`
- Headless: False (visivel)

### Fechar navegador:
- NUNCA matar processos globais (Get-Process, taskkill)
- SEMPRE usar `browser.close()` e `context.close()`
- So fechar o navegador/contexto do bot atual

---

## 7. REGRA DE FLUXOS TRAVADOS

### Regra Zero:
ANTES de fazer qualquer acao, ler `MAPEAMENTO_COMPLETO.json`.

### Se fluxo existe:
- Usar EXATAMENTE como documentado
- Nao criar versoes novas (v2, v3, v4)
- Nao modificar seletores sem testar

### Se fluxo nao existe:
1. Mapear a pagina (mapear_*.py)
2. Testar a acao
3. Confirmar resultado
4. Documentar em `MAPEAMENTO_COMPLETO.json`
5. Marcar como "TRAVADO - TESTADO"

### Formato de travamento:
```json
{
  "FLUXO_XX_NOME": {
    "url": "https://...",
    "seletores": ["button[aria-label='...']"],
    "passos": ["1. Clicar em X", "2. Esperar Y", "3. Digitar Z"],
    "status": "TRAVADO - TESTADO",
    "data": "2026-08-27",
    "observacoes": "..."
  }
}
```

---

## 8. REGRA ANTI-REPETICAO

### Posts (StackPost):
- NUNCA repetir texto de postagem
- NUNCA repetir imagem de postagem
- NUNCA repetir video de postagem
- Verificar historico antes de cadastrar

### Growth (Bot):
- NUNCA visitar o mesmo prospect duas vezes
- NUNCA comentar o mesmo texto duas vezes
- NUNCA seguir o mesmo perfil duas vezes
- Lista de prospects em `PROSPECTS_LISTA.json`

---

## 9. REGRA DE STACKPOST (PUBLICADOR)

### O StackPost e o UNICO publicador:
- Bots nao postam
- StackPost converte media pro tamanho de cada plataforma
- StackPost agenda e publica automatico (cron Cloudflare)
- Mesmo texto + mesma imagem em todas as redes

### Fluxo de publicacao:
1. Criar/obter imagem ou video original
2. Upload no StackPost
3. Validar midia
4. Gerar derivadas por plataforma (instagram_4x5, linkedin_1x1, etc)
5. Compor post (texto + midia + plataformas)
6. Agendar
7. Cron publica automatico no horario

### Adapter por plataforma:
- `apps/web/src/lib/adapters/{rede}-api.ts`
- Funcao `publishTo{Rede}(account, content, imageUrl)`
- Salvar `external_id` no OAuth (person ID da plataforma)
- Usar `external_id` no publish (nao chamar /me toda vez)

---

## 10. CHECKLIST PARA NOVO BOT

```
[ ] 1. Pasta criada: {Rede}_Bot\
[ ] 2. AGENTS.md criado
[ ] 3. {rede}_core.py criado
[ ] 4. Login feito e sessao salva
[ ] 5. BIOS mapeada
[ ] 6. BIOS aplicada (nome, headline, foto, banner)
[ ] 7. Growth mapeado (buscar, visitar, seguir, curtir, comentar, compartilhar)
[ ] 8. Fluxos travados em MAPEAMENTO_COMPLETO.json
[ ] 9. Limites definidos em LIMITES_{REDE}.json
[ ] 10. App de desenvolvedor criado na plataforma
[ ] 11. OAuth configurado (client_id, secret, redirect_uri)
[ ] 12. Scopes solicitados e aprovados
[ ] 13. Adapter implementado em StackPost
[ ] 14. Callback implementado em StackPost
[ ] 15. Adapter registrado em index.ts
[ ] 16. Deploy feito (git push)
[ ] 17. Conta conectada no StackPost
[ ] 18. Teste de publicacao real (texto + imagem)
[ ] 19. Cron automatico funcionando
[ ] 20. End-to-end validado
```

---

## 11. BOTS JA EXISTENTES

| Bot | BIOS | Growth | StackPost | Status |
|-----|------|--------|-----------|--------|
| LinkedIn_Bot | OK | OK | OK | COMPLETO |
| Instagram_Bot | OK | OK | OK | COMPLETO |
| Facebook_Bot | - | - | - | CRIAR |
| TikTok_Bot | - | - | - | CRIAR |
| YouTube_Bot | - | - | - | CRIAR |
| Twitter_Bot | - | - | - | CRIAR |
| Threads_Bot | - | - | - | CRIAR |
| Pinterest_Bot | - | - | - | CRIAR |
| Reddit_Bot | - | - | - | CRIAR |
| Bluesky_Bot | - | - | - | CRIAR |
| Mastodon_Bot | - | - | - | CRIAR |

---

## 12. ORDEM DE PRIORIDADE

1. Facebook_Bot (proximo)
2. TikTok_Bot
3. YouTube_Bot
4. Twitter/X_Bot
5. Threads_Bot
6. Pinterest_Bot
7. Reddit_Bot
8. Bluesky_Bot
9. Mastodon_Bot
