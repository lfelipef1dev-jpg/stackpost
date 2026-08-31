# Plano do Painel Admin — StackPost

> Documento de planejamento para aprovação. NENHUM código será escrito antes deste plano ser aprovado.

---

## 1. RESUMO DO RAIO-X ATUAL

### O que já existe no StackPost

| Área | Onde está hoje | Status |
|---|---|---|
| **Dashboard do usuário** | `/dashboard` | Resumo pessoal/team: posts, contas, uso do plano. |
| **Time / Usuários** | `/team` e aba `team` em `/settings` | Convite, troca de papel, remoção. |
| **Contas sociais** | `/accounts` | Conectar/desconectar/refresh 15 plataformas. |
| **Criar post** | `/composer` | Texto, mídia, agendamento, IA, preview. |
| **Calendário** | `/calendar` | Visual mensal/lista, filtros, drag visual. |
| **Analytics** | `/analytics` | Totais, gráfico 30 dias, posts por plataforma. |
| **Billing** | `/billing` e aba em `/settings` | Planos, upgrade, checkout Mercado Pago. |
| **Webhooks** | `/webhooks` e aba em `/settings` | Registrar, selecionar eventos, copiar/deletar. |
| **API Keys** | Aba em `/settings` | Criar/revogar/copiar chaves. |
| **Configurações** | `/settings` (9 abas) | Perfil, org, time, billing, segurança, notificações. |
| **Aprovação de posts** | `/api/posts/approve` | Workflow DRAFT → REVIEW → APPROVED → SCHEDULED. |
| **Audit logs** | `/api/audit-logs` | **Tabela existe, mas NÃO há UI.** |

### O que está faltando para um admin de verdade

1. **Não existe `/admin` dedicado.** Tudo está dentro de `/settings` (de-facto admin center).
2. **Não existe admin global/superuser.** Nenhum usuário consegue ver todas as organizações, times e usuários do sistema.
3. **Não há visualizador de audit logs.** Endpoint existe, mas nenhuma página consome.
4. **Não há gerenciamento de planos e limites por admin.** Planos são hard-coded no front.
5. **Não há painel de pagamentos/assinaturas.** Só checkout e webhook.
6. **Não há controle de agendamentos em lote/falhas.** Só calendário pessoal.
7. **Não há gerenciamento de configurações do sistema.** Sem feature flags, sem manutenção.
8. **Não há painel de plataformas/integrações.** Sem ver status de saúde das APIs.

### Conflitos identificados

| Conflito | Impacto | Como resolver no plano |
|---|---|---|
| RBAC: `owner/admin/editor/viewer` na UI vs `admin/member/viewer` no Zod | Bug real: `editor` e `owner` serão rejeitados no convite | Padronizar para `owner/admin/editor/viewer` no schema + adicionar `is_superuser` no `users` |
| Billing: Mercado Pago (atual) vs Stripe (plano) | Decisão de negócio | Manter Mercado Pago para admin de assinaturas, documentar como BRL/PIX |
| Planos: 5 tiers atuais vs 4 do plano | Divergência de nomenclatura | Manter 5 tiers atuais no admin, com opção de editar nomes/preços |
| Settings: abas únicas vs sub-páginas do plano | IA diferente | Criar `/admin` com sub-rotas específicas de admin |

---

## 2. PROPOSTA — PAINEL ADMIN `/admin`

### 2.1 Estrutura de rotas

```
/admin
  ├── /dashboard              (visão geral do sistema)
  ├── /users                  (todos os usuários)
  ├── /teams                  (todos os times)
  ├── /organizations          (todas as organizações)
  ├── /posts                  (todos os posts do sistema)
  ├── /comments               (todos os comentários)
  ├── /accounts               (todas as contas conectadas)
  ├── /billing                (planos, assinaturas, pagamentos)
  ├── /credits                (créditos X e histórico)
  ├── /analytics              (métricas agregadas do sistema)
  ├── /audit-logs             (logs de auditoria)
  ├── /webhooks               (webhooks cadastrados, entregas)
  ├── /cron                   (jobs agendados, histórico, falhas)
  ├── /platforms              (status das integrações sociais)
  └── /settings               (feature flags, manutenção, config)
```

### 2.2 Novos campos no banco (migrations)

```sql
-- users.is_superuser
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- active, suspended, pending
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- organizations.plan + plan_status
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active'; -- active, past_due, canceled, trialing
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;

-- admin_settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

-- credit_transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- purchase, usage, refund, manual_adjustment
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);
```

### 2.3 Middleware e permissão

- Criar `requireSuperuser(req)` em `lib/rbac.ts`.
- Middleware `/admin/*` redireciona para `/dashboard` se o usuário não tiver `is_superuser = true`.
- Novo header admin opcional: `x-admin-token` para futura automação.

---

## 3. TELAS E FUNCIONALIDADES DETALHADAS

### 📊 3.1 Dashboard Admin (`/admin/dashboard`)

**Objetivo:** visão geral do sistema em tempo real.

**Widgets (cards):**
- Total de usuários ativos / suspensos / novos hoje
- Total de organizações / times
- Total de posts criados hoje / agendados / publicados / com erro
- Total de contas conectadas por plataforma
- Receita do dia / mês (Mercado Pago)
- Créditos X vendidos / consumidos
- Webhooks ativos / falhas
- Jobs CRON executados / falhos

**Gráficos:**
- Posts por dia (últimos 30 dias)
- Usuários novos por dia
- Receita por dia
- Contas conectadas por plataforma (pizza/barra)

**Tabela rápida:**
- Últimos 10 posts com erro
- Últimos 10 pagamentos
- Últimos 10 usuários cadastrados

**Vem de qual raio-x:** Dashboard atual (`/dashboard`) + `analytics` + `lib/logger` + `audit_logs`.

---

### 👤 3.2 Usuários (`/admin/users`)

**Objetivo:** gerenciar todos os usuários do sistema.

**Campos da tabela:**
- Nome, email, status, papel, superuser, último login, criado em
- Time/Organização atual
- Ações: ver, editar, suspender, reativar, resetar senha, deletar

**Filtros:**
- Status (active, suspended, pending)
- Papel (owner, admin, editor, viewer)
- Superuser (sim/não)
- Email, nome
- Data de cadastro

**Ações em lote:**
- Suspender / reativar
- Alterar papel
- Enviar email

**Tela de detalhe (`/admin/users/[id]`):**
- Perfil
- Times que pertence
- Posts criados
- Pagamentos
- Audit logs do usuário
- Ações: impersonate (logar como), editar, suspender

**Vem de:** `/team` + `/settings` (team tab) + `users` table.

---

### 🏢 3.3 Times e Organizações (`/admin/teams` e `/admin/organizations`)

**Objetivo:** gerenciar workspaces.

**Tabela de organizações:**
- Nome, plano, status da assinatura, vencimento, número de times, número de usuários, criado em
- Ações: ver, editar plano, suspender, deletar

**Tabela de times:**
- Nome, organização, owner, número de membros, posts, créditos
- Ações: ver, transferir ownership, deletar

**Tela de detalhe:**
- Membros
- Posts
- Contas conectadas
- Faturas
- Créditos
- Audit logs

**Vem de:** `organizations` table + `teams` table + `team` page.

---

### 📝 3.4 Posts (`/admin/posts`)

**Objetivo:** ver e gerenciar todo o conteúdo do sistema.

**Tabela:**
- Título/conteúdo resumido, autor, time, plataformas, status, agendado para, publicado em, erro
- Filtros: status, plataforma, time, usuário, data, erro

**Ações:**
- Ver detalhe
- Reagendar
- Republicar
- Deletar
- Aprovar/rejeitar (workflow)

**Vem de:** `/dashboard` + `/calendar` + `/api/posts`.

---

### 💬 3.5 Comentários e Contas (`/admin/comments`, `/admin/accounts`)

**Comentários:**
- Tabela com post, plataforma, autor, status, texto, data
- Filtros por plataforma, status, time

**Contas conectadas:**
- Usuário, time, plataforma, username, status, expira em, ações (refresh, desconectar)
- Filtros por plataforma, status, time

**Vem de:** `/comments` + `/accounts`.

---

### 💰 3.6 Planos, Limites e Cobrança (`/admin/billing`)

**Objetivo:** controle financeiro e de planos.

**Planos (`/admin/billing/plans`):**
- Lista de planos: nome, preço, posts/mês, uploads/mês, contas, usuários, recursos
- Ações: editar, criar, ativar/desativar

**Assinaturas (`/admin/billing/subscriptions`):**
- Organização, plano, status, início, fim, valor
- Ações: alterar plano, cancelar, renovar, estender trial

**Pagamentos (`/admin/billing/payments`):**
- ID, organização, valor, status, gateway (Mercado Pago), data
- Filtros: status, data, gateway
- Ações: reembolsar manual, marcar pago

**Créditos X (`/admin/credits`):**
- Saldo por time/plataforma
- Histórico de transações
- Ação: adicionar/retirar créditos manualmente

**Vem de:** `/billing` + `/plans` + `mercadopago.ts` + `x-credits.ts`.

---

### 📅 3.7 Agendamento e Jobs (`/admin/schedule` e `/admin/cron`)

**Agendamento:**
- Calendário global com todos os posts agendados
- Filtro por plataforma, time, usuário
- Ação: reagendar em massa, pausar, publicar agora

**Jobs CRON (`/admin/cron`):**
- Lista de jobs: nome, última execução, próxima execução, status, log
- Ações: executar agora, pausar, habilitar
- Histórico de execuções

**Vem de:** `/calendar` + `/api/cron/*`.

---

### 🌐 3.8 Webhooks e Integrações (`/admin/webhooks` e `/admin/platforms`)

**Webhooks:**
- Todos os webhooks cadastrados no sistema
- Entregas: status, retries, última entrega
- Replay de eventos

**Plataformas:**
- Status de saúde de cada integração social
- Taxa de erro, última publicação, rate limits
- Ação: desabilitar plataforma globalmente

**Vem de:** `/webhooks` + `lib/adapters` + `lib/platforms.ts`.

---

### ⚙️ 3.9 Configurações do Sistema (`/admin/settings`)

**Objetivo:** controle operacional.

**Feature flags:**
- Habilitar/desabilitar cadastro, login social, agendamento, IA, etc.

**Manutenção:**
- Modo manutenção global
- Mensagem de manutenção

**Configurações de email:**
- `EMAIL_FROM`, template de boas-vindas, notificações

**Rate limits:**
- Ajustar limites de requisições

**Integrações:**
- Chaves de API de plataformas sociais
- Webhook Mercado Pago

**Vem de:** `/settings` (Security, Notifications) + `.env.example`.

---

## 4. O QUE É NOVO VS O QUE JÁ EXISTE

| Funcionalidade | Já existe | Novo no admin |
|---|---|---|
| Dashboard resumo | Sim (`/dashboard`) | Sim, mas agregado de TODO o sistema |
| Gerenciar time | Sim (`/team`, `/settings`) | Sim, mas todos os times/orgs |
| Convidar usuário | Sim | Sim, com admin global e superuser |
| Contas sociais | Sim (`/accounts`) | Sim, visualização global |
| Criar post | Sim (`/composer`) | Não — admin não cria post, só gerencia |
| Analytics | Sim (`/analytics`) | Sim, agregado por todo o sistema |
| Billing | Sim (`/billing`) | Sim, gerenciamento de planos/assinaturas/pagamentos |
| Webhooks | Sim (`/webhooks`) | Sim, todas as entregas e replay |
| Audit logs | API existe, sem UI | Sim, UI completa |
| CRON jobs | API existe, sem UI | Sim, monitor de jobs |
| Feature flags | Não existe | Sim, tabela `admin_settings` |
| Plataforma health | Não existe | Sim, painel de integrações |

---

## 5. FLUXOS DE USO

### Fluxo 1 — Suspendere usuário
1. Admin vai em `/admin/users`
2. Busca email
3. Clica em "Suspender"
4. Status muda para `suspended`
5. Usuário não consegue mais logar (middleware verifica `status = 'active'`)

### Fluxo 2 — Alterar plano de uma organização
1. Admin vai em `/admin/organizations`
2. Clica na organização
3. Aba "Assinatura"
4. Seleciona novo plano e data de vencimento
5. Salva → `organizations.plan` e `plan_status` atualizados
6. Audit log registrado

### Fluxo 3 — Reembolsar pagamento
1. Admin vai em `/admin/billing/payments`
2. Busca pagamento
3. Clica "Reembolsar"
4. Mercado Pago chamado para devolução
5. `stackpost_processed_payments` atualizado

### Fluxo 4 — Executar job manual
1. Admin vai em `/admin/cron`
2. Clica no job
3. Clica "Executar agora"
4. Endpoint `/api/cron/<job>` chamado com `CRON_SECRET`
5. Resultado exibido

---

## 6. REUTILIZAÇÃO DE COMPONENTES

| Componente existente | Onde reusar no admin |
|---|---|
| `Header.tsx` | Header admin com links `/admin/*` |
| `Footer.tsx` | Manter em páginas admin públicas |
| `Breadcrumb.tsx` | Navegação aninhada `/admin/users/[id]` |
| `PlatformIcon.tsx` | Lista de contas/plataformas |
| `SEOPage.tsx` | Documentação interna do admin |
| `animations.tsx` | Animações nas páginas |

**Componentes a serem criados (após aprovação):**
- `AdminLayout.tsx`
- `AdminSidebar.tsx`
- `DataTable.tsx`
- `StatCard.tsx`
- `Filters.tsx`
- `Badge.tsx`
- `ModalConfirm.tsx`
- `Toast.tsx`
- `LineChart.tsx` / `BarChart.tsx`

---

## 7. MIGRAÇÕES NECESSÁRIAS

1. `004_admin_users.sql` — adicionar `is_superuser`, `status`, `last_login_at` em `users`
2. `005_admin_organizations.sql` — adicionar `plan_status`, `plan_expires_at`, `plan_started_at` em `organizations`
3. `006_admin_settings.sql` — criar `admin_settings`
4. `007_credit_transactions.sql` — criar `credit_transactions`
5. `008_admin_indexes.sql` — índices para busca rápida

---

## 8. CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Aprovar este plano
- [ ] Definir se superuser será flag na tabela `users` ou role separada
- [ ] Confirmar manter Mercado Pago (não Stripe)
- [ ] Confirmar 5 tiers de plano
- [ ] Aprovar rotas `/admin/*`
- [ ] Aprovar tabelas/migrações
- [ ] Decidir se admin terá design dark igual ao dashboard ou tema separado

---

**Próximo passo:** após aprovação, criar `lib/admin.ts`, middleware `requireSuperuser`, rotas `/api/admin/*`, e páginas `/admin/*`.
