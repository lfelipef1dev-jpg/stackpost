# PLANO VISUAL - STACKPOST

## Identidade ExpoStacker (base)

### Cores
- Background: #0A0A0A
- Surface: #1A1A1A
- Elevated: #252525
- Border: rgba(255,255,255,0.12)
- Text: #E6E6E6
- Text secondary: rgba(230,230,230,0.70)
- Accent: #8AB4F8
- Accent hover: #AECBFA
- Glow: 0 0 32px rgba(138,180,248,0.35)

### Fontes
- Display: Space Grotesk
- Body: Inter
- Mono: JetBrains Mono

## Visual StackPost (evolucao)

### Conceito
"A cockpit de publicacao social." Dark mode, glassmorphism leve, bordas finas, acentos azuis, dados em tempo real. Nada de cores gritantes. Profissional, serio, poderoso.

### Diferenca das concorrentes
- Bundle.social: UI basica, muito texto, pouco visual
- PostPulse: tecnico, seco
- StackPost: dashboard de IA, cards de redes sociais, preview real, calendario imersivo

### Paleta adicional
- Success: #4ADE80
- Error: #F87171
- Warning: #FBBF24
- Info: #60A5FA
- Instagram: #E4405F (com pouca saturacao)
- LinkedIn: #0A66C2
- X: #FFFFFF
- TikTok: #25F4EE + #FE2C55 (gradiente suave)
- Facebook: #1877F2
- YouTube: #FF0000
- Pinterest: #E60023
- Threads: #FFFFFF
- Bluesky: #0560FF
- Mastodon: #6364FF
- Reddit: #FF4500
- Discord: #5865F2
- Slack: #4A154B
- Snapchat: #FFFC00 (escurecido)
- Google: #4285F4

## Telas (ordem de prioridade)

### 1. Onboarding
- Login/cadastro (email + Google)
- Criar organization
- Criar team
- Gerar API key
- Conectar primeira rede

### 2. Dashboard (overview)
- KPIs: posts publicados, agendados, contas conectadas, engajamento
- Grafico de posts ao longo do tempo
- Ultimos posts
- Proximos agendamentos
- Status de contas conectadas

### 3. Composer
- Editor de texto
- Upload de midia
- Preview por plataforma
- Selecao de contas
- Agendamento
- AI caption
- Variantes por plataforma

### 4. Calendario
- Visual mes/semana/dia
- Drag-and-drop
- Filtro por plataforma
- Status colorido

### 5. Accounts
- Lista de contas conectadas
- Status (active, expired, reconnect)
- Conectar nova
- Refresh channels

### 6. Analytics
- Graficos de engajamento
- Top posts
- Comparacao por plataforma
- Historico

### 7. Settings
- Organization
- Team
- API keys
- Webhooks
- Billing

## Componentes base

1. Sidebar (colapsavel)
2. Header com busca e notificacoes
3. Card de metrica
4. Card de post
5. Platform badge
6. Date picker
7. Status badge
8. Button (primary/secondary/ghost)
9. Input/text area
10. Modal/dialog
11. Toast
12. Skeleton loading
13. Empty state

## Iconografia
- Lucide React (mesma familia ExpoStacker)
- Tamanhos: 16, 20, 24
- Stroke: 1.5

## Espacamento
- Container: max-w-7xl
- Padding: 24px (desktop), 16px (mobile)
- Card padding: 16-20px
- Gap: 12-24px

## Bordas e radius
- Cards: 16px (2xl)
- Buttons: 12px
- Inputs: 10px
- Badges: 6px

## Animacoes
- Transicoes: 200ms ease
- Hover em cards: leve elevacao + glow azul
- Loading: skeleton pulse
- Toasts: slide-in
