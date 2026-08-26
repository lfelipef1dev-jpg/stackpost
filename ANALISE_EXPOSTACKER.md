# ANALISE DA ESTRUTURA EXPOSTACKER

## Local
C:\PROJETOS\EXPOSTACKER

## Projetos Encontrados
1. EXPOSTACKER - SITE PRINCIPAL
2. frotamais
3. gordaomod
4. Marken Fassi - Ecossistema de Embaixadores
5. medellin-ecommerce
6. NEXUS-IA
7. sanatto-facilities
8. Seeds
9. sistema-faturamento-saas
10. solmais
11. tigrebet
12. vendamais
13. vivamais

## Stack Principal

### Site Institucional (cases, landing)
- **Astro 4.16.19** (static output)
- **TypeScript**
- **Tailwind CSS 3.4**
- **i18n** PT/EN
- **Deploy:** Cloudflare Pages
- **Build:** `npm run build` -> Astro build + sitemap
- **Deploy automático:** GitHub Actions + Wrangler

### Projetos Full-Stack (Nexus, Seeds, etc)
- **Next.js** (App Router, SSR)
- **Cloudflare Workers** + `@opennextjs/cloudflare`
- **Supabase:** Postgres + Auth + Storage + Realtime
- **Banco:** cada projeto tem seu proprio Supabase
- **Runtime:** Node.js 22+
- **Deploy automático:** GitHub Actions + Wrangler

### Design Tokens
- `brand-bg`: #0A0A0A
- `brand-surface`: #1A1A1A
- `brand-elevated`: #252525
- `brand-border`: rgba(255,255,255,0.12)
- `brand-text`: #E6E6E6
- `brand-text-secondary`: rgba(230,230,230,0.70)
- `brand-accent`: #8AB4F8
- `brand-accent-hover`: #AECBFA

### Tipografia
- Display: Space Grotesk
- Body: Inter
- Mono: JetBrains Mono

### Infraestrutura
- **Cloudflare** para DNS, Pages e Workers
- **Supabase** para banco e auth
- **GitHub** para CI/CD
- **Subdominios automaticos:** `*.expostacker.com.br`
- **Scripts PowerShell** para criar novos projetos automaticamente

### Padrao de Novo Projeto
1. Cada projeto novo fica em `C:\PROJETOS\EXPOSTACKER\[nome]`
2. Ganha subdominio `nome.expostacker.com.br`
3. Script cria: git, GitHub repo, secrets, Cloudflare, CNAME, workflow
4. Projetos estaticos vao para Cloudflare Pages
5. Projetos full-stack vao para Cloudflare Workers

### Regras de Banco
- Cada projeto tem seu proprio Supabase
- RLS obrigatorio em todas as tabelas
- Backup manual antes de alteracoes
- Nunca compartilhar banco entre projetos

### Conclusao para StackPost

StackPost deve seguir o MESMO padrao:
- Next.js + Cloudflare Workers (full-stack)
- Supabase proprio
- Dominio: stackpost.expostacker.com.br
- Design dark com tokens Expostacker
- Fontes Space Grotesk, Inter, JetBrains Mono
- CI/CD via GitHub Actions
- Script de deploy automatico do ecossistema
