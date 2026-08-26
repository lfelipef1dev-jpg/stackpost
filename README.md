# StackPost

SaaS de publicacao multi-redes sociais da ExpoStacker.

## Stack

- Next.js 15 App Router
- Supabase (Postgres + Auth)
- Cloudflare Workers
- Tailwind CSS
- TypeScript

## Estrutura

```
StackPost/
├── apps/web           # Next.js dashboard
├── packages/shared    # Tipos e schemas compartilhados
├── supabase-schema.sql # Schema do banco
└── docs/              # Documentacao
```

## Telas criadas

- `/` - Landing
- `/login` - Login
- `/dashboard` - Dashboard
- `/composer` - Criar post
- `/calendar` - Calendario
- `/accounts` - Contas conectadas

## Configuracao

```powershell
cd apps/web
cp .env.example .env.local
# preencher Supabase credentials
npm install
npm run dev
```

## Deploy

```powershell
npm run deploy
```

Dominio: `stackpost.expostacker.com.br`
