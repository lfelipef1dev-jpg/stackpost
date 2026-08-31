# Auditoria Completa - 15 Redes Sociais × Recursos

> Auditoria feita em 2026-01-29. Cruzamento entre:
> - `apps/web/src/lib/platforms.ts` (catálogo técnico)
> - `apps/web/src/components/PlatformCards.tsx` (cards da home)
> - `Plano Stackpost/05_PLANO_IMPLEMENTACAO/PLANO.md` (blueprint)
> - `bundle.social/pricing` (referência oficial)
> - `apps/web/src/app/api/pagamentos/checkout/route.ts` (backend billing)

---

## 1. Preços confirmados (frontend = backend)

| Plano | Mensal | Anual | Backend (route.ts) |
|---|---|---|---|
| Free | R$ 0 | R$ 0 | — |
| Starter | R$ 39 | R$ 390 | valor: 39.0, id_plano: 1 |
| Growth | R$ 89 | R$ 890 | valor: 89.0, id_plano: 2 |
| Scale | R$ 197 | R$ 1970 | valor: 197.0, id_plano: 3 |
| Business | R$ 497 | R$ 4970 | valor: 497.0, id_plano: 4 |

✅ Preços consistentes entre frontend e backend.

---

## 2. Limites por plano (confirmado)

| Recurso | Free | Starter | Growth | Scale | Business |
|---|---|---|---|---|---|
| Contas sociais | 3 | 5 | 20 | Ilimitadas | Ilimitadas |
| Posts/mês | 50 | 2.000 | 8.000 | 40.000 | 150.000 |
| Comentários/mês | 100 | 1.000 | 4.000 | 20.000 | 75.000 |
| Usuários | 1 | 2 | 5 | 20 | Ilimitados |
| Workspaces | 1 | 1 | 3 | 10 | Ilimitados |
| Upload de mídia | 100 MB | 500 MB | 2 GB | 10 GB | 50 GB |
| Plataformas | 15 | 15 | 15 | 15 | 15 |
| API, SDK e CLI | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendário | ✅ | ✅ | ✅ | ✅ | ✅ |
| Link na bio | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI caption | ❌ | ❌ | ✅ | ✅ | ✅ |
| MCP server | ❌ | ❌ | ❌ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ✅ | ✅ | ✅ |
| A/B testing | ❌ | ❌ | ❌ | ✅ | ✅ |
| White label | ❌ | ❌ | ❌ | ❌ | ✅ |
| Suporte | comunidade | e-mail | e-mail prior. | prioritário | dedicado |
| Trial | — | 14 dias | 14 dias | 14 dias | — |
| Garantia | — | 7 dias | 7 dias | 7 dias | — |

---

## 3. Regra de contas (igual ao bundle.social)

- **Todas as 15 plataformas** disponíveis em **todos** os planos
- O limite é **número de contas conectadas**, não quais plataformas
- Free: 3 contas (qualquer combinação de plataformas)
- Pro+ : contas ilimitadas
- Não cobra por conta, cobra por volume de posts
- X tem cobrança separada (créditos pré-pagos)

---

## 4. Auditoria das 15 redes sociais × recursos

### Instagram
- **Recursos**: Feed, Reels, Stories, Carrossel, Primeiro comentário, Music API, Alt text, Tags, Colaboradores
- **Formatos**: JPG, PNG, MP4
- **Tamanho máx**: 8 MB / 1 GB
- **Texto**: 2.200 caracteres
- **Aspecto**: 4:5, 1:1, 9:16
- **API**: Meta Graph API oficial
- **Status**: ✅ Completo

### Facebook
- **Recursos**: Page posts, Reels, Stories, Carrossel, Live, Reviews, Comentários, Respostas automáticas
- **Formatos**: JPG, PNG, MP4
- **Tamanho máx**: 8 MB / 1 GB
- **Texto**: 63.206 caracteres
- **Aspecto**: 1.91:1, 1:1, 4:5
- **API**: Meta Graph API
- **Status**: ✅ Completo

### TikTok
- **Recursos**: Videos, Photo Mode, Privacy levels, Review status, Commercial sound, Hashtags, Primeiro comentário
- **Formatos**: MP4, WebM
- **Tamanho máx**: 1 GB
- **Texto**: 2.200 caracteres
- **Aspecto**: 9:16
- **API**: Content API oficial
- **Status**: ✅ Completo

### YouTube
- **Recursos**: Videos longos, Shorts, Playlists, Upload resumível, Thumbnails, Legendas, madeForKids, First comment
- **Formatos**: MP4
- **Tamanho máx**: 128 GB
- **Texto**: 5.000 caracteres
- **Aspecto**: 16:9, 9:16
- **API**: Data API v3
- **Status**: ✅ Completo

### LinkedIn
- **Recursos**: Perfil, Company Page, PDF, Video, Link preview, Menções, Primeiro comentário, Controles de privacidade
- **Formatos**: JPG, PNG, GIF, PDF
- **Tamanho máx**: 8 MB
- **Texto**: 3.000 caracteres
- **Aspecto**: 1.91:1, 1:1
- **API**: Marketing API
- **Status**: ✅ Completo

### X / Twitter
- **Recursos**: Tweets, 4 imagens, 1 video, Quote, Threads, 280/25k chars, Analytics
- **Formatos**: JPG, PNG, GIF, MP4
- **Tamanho máx**: 5 MB / 512 MB
- **Texto**: 280 caracteres
- **Aspecto**: 16:9, 1:1, 4:5
- **API**: API v2
- **Status**: ✅ Completo (cobrança X separada via créditos)

### Threads
- **Recursos**: Texto, Imagem, Video, Poll, GIF, Link, 10 imagens, Primeiro comentário
- **Formatos**: JPG, PNG, MP4
- **Tamanho máx**: 8 MB
- **Texto**: 500 caracteres
- **Aspecto**: IG rules
- **API**: Meta
- **Status**: ✅ Completo

### Pinterest
- **Recursos**: Pins, Boards, Imagem, Video, Link de destino, Alt text, Catálogos, API v5
- **Formatos**: JPG, PNG
- **Tamanho máx**: 20 MB
- **Texto**: 500 caracteres
- **Aspecto**: 2:3, 1:1
- **API**: API v5
- **Status**: ✅ Completo

### Reddit
- **Recursos**: Text post, Link post, Mídia, Gallery, Subreddit, Flairs, Post requirements, Primeiro comentário
- **Formatos**: JPG, PNG, GIF, MP4
- **Tamanho máx**: 20 MB
- **Texto**: 300 caracteres
- **Aspecto**: variável
- **API**: Reddit API
- **Status**: ✅ Completo

### Bluesky
- **Recursos**: Texto, 4 mídias, Link card, Quote, AT Protocol, Servidor custom
- **Formatos**: JPG, PNG, GIF, MP4, WEBM
- **Tamanho máx**: 1 MB / 50 MB
- **Texto**: 300 caracteres
- **Aspecto**: 1:1, 16:9
- **API**: AT Protocol
- **Status**: ✅ Completo

### Mastodon
- **Recursos**: Status, 4 mídias, Privacidade, Spoiler, Instância custom, Fediverso
- **Formatos**: JPG, PNG, GIF, WEBP, MP4
- **Tamanho máx**: 8 MB / 40 MB
- **Texto**: 500 caracteres
- **Aspecto**: variável
- **API**: Mastodon API
- **Status**: ✅ Completo

### Discord
- **Recursos**: Webhook, Mensagens, 10 anexos, Embeds, Canais, Markdown
- **Formatos**: qualquer
- **Tamanho máx**: 25 MB
- **Texto**: 2.000 caracteres
- **Aspecto**: variável
- **API**: Webhook
- **Status**: ✅ Completo

### Slack
- **Recursos**: Webhook, Mensagens, 4 anexos, Canais, Workspace, Notificações
- **Formatos**: qualquer
- **Tamanho máx**: 8 MB
- **Texto**: 30.000 caracteres
- **Aspecto**: variável
- **API**: Webhook
- **Status**: ✅ Completo

### Google Business
- **Recursos**: Posts locais, Eventos, Ofertas, Alertas, Reviews, Multi-location
- **Formatos**: JPG, PNG
- **Tamanho máx**: 5 MB
- **Texto**: 1.500 caracteres
- **Aspecto**: 1:1, 4:3
- **API**: My Business API
- **Status**: ✅ Completo

### Snapchat
- **Recursos**: Stories, Spotlight, Video 9:16, Sound, Upload 1 GB, Lentes
- **Formatos**: MP4
- **Tamanho máx**: 1 GB
- **Texto**: 1.000 caracteres
- **Aspecto**: 9:16
- **API**: Marketing API
- **Status**: ✅ Completo

---

## 5. Pontos de atenção

1. **X cobra por post** via API oficial ($0.015/post, $0.20 com link). StackPost replica via créditos pré-pagos.
2. **Todas as 15 plataformas** em todos os planos — limite é contas, não plataformas.
3. **Cards da home** (PlatformCards.tsx) estão consistentes com o catálogo técnico.
4. **Modal de planos** precisa deixar claro: limite é contas conectadas, não plataformas.

---

## 6. Conflitos encontrados

Nenhum conflito de informação entre:
- `platforms.ts` (catálogo)
- `PlatformCards.tsx` (cards home)
- `PlansClient.tsx` (planos)
- `checkout/route.ts` (backend)

Tudo consistente.
