-- StackPost — Migration 004
-- Fundação do painel admin: superuser, controle de planos, créditos, configurações e permissões.

-- 1. Usuários: admin, status e auditoria
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS login_count BIGINT DEFAULT 0;

-- 2. Organizações: controle de assinatura e ciclo
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- 3. Planos e limites flexíveis
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  interval TEXT DEFAULT 'month', -- month, year, lifetime
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  trial_days INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value BIGINT NOT NULL,
  UNIQUE(plan_id, key)
);

CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  UNIQUE(plan_id, key)
);

-- 4. Subscrições
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  plan_slug TEXT,
  status TEXT DEFAULT 'active', -- active, past_due, canceled, trialing, paused
  payment_provider TEXT, -- mercadopago, stripe, manual
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- 5. Transações de créditos
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  platform TEXT,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL, -- purchase, usage, refund, manual_adjustment, expiration, bonus
  description TEXT,
  reference_id TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Configurações do sistema
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

-- 7. Permissões granulares de admin
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_superuser BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, admin_role_id)
);

-- 8. Logs de auditoria (já existe, mas garantir campos)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
  END IF;
END $$;

-- 9. Seed de papéis admin padrão
INSERT INTO public.admin_roles (slug, name, description, permissions, is_superuser)
VALUES
  ('superuser', 'Super Admin', 'Acesso total', '[]', TRUE),
  ('admin', 'Admin', 'Gerenciamento geral, exceto finanças e configurações críticas', '["users.read","users.write","teams.read","teams.write","posts.read","posts.write","comments.read","comments.write","accounts.read","accounts.write","webhooks.read","webhooks.write","cron.read","cron.write","analytics.read","audit_logs.read","audit_logs.write"]', FALSE),
  ('finance', 'Financeiro', 'Planos, pagamentos, créditos e faturas', '["billing.read","billing.write","plans.read","plans.write","credits.read","credits.write","analytics.read"]', FALSE),
  ('support', 'Suporte', 'Visualização e suporte a usuários', '["users.read","teams.read","posts.read","comments.read","accounts.read","webhooks.read","audit_logs.read"]', FALSE),
  ('viewer', 'Visualizador', 'Somente leitura', '["users.read","teams.read","posts.read","comments.read","accounts.read","analytics.read","audit_logs.read"]', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- 10. Seed de planos padrão
INSERT INTO public.plans (slug, name, description, price_cents, interval, sort_order)
VALUES
  ('free', 'Free', 'Gratuito para começar', 0, 'month', 0),
  ('starter', 'Inicial', 'Ideal para iniciar', 3900, 'month', 1),
  ('growth', 'Crescimento', 'Para crescer', 8900, 'month', 2),
  ('scale', 'Escala', 'Para times maiores', 19700, 'month', 3),
  ('business', 'Empresarial', 'Para empresas', 49700, 'month', 4)
ON CONFLICT (slug) DO NOTHING;

-- 11. Limites padrão
DO $$
BEGIN
  -- Free
  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_day', 3 FROM public.plans p WHERE p.slug = 'free';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_month', 30 FROM public.plans p WHERE p.slug = 'free';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'uploads_per_month', 10 FROM public.plans p WHERE p.slug = 'free';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'team_members', 2 FROM public.plans p WHERE p.slug = 'free';

  -- Starter
  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_day', 10 FROM public.plans p WHERE p.slug = 'starter';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_month', 300 FROM public.plans p WHERE p.slug = 'starter';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'uploads_per_month', 100 FROM public.plans p WHERE p.slug = 'starter';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'team_members', 5 FROM public.plans p WHERE p.slug = 'starter';

  -- Growth
  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_day', 30 FROM public.plans p WHERE p.slug = 'growth';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_month', 1000 FROM public.plans p WHERE p.slug = 'growth';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'uploads_per_month', 500 FROM public.plans p WHERE p.slug = 'growth';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'team_members', 15 FROM public.plans p WHERE p.slug = 'growth';

  -- Scale
  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_day', 100 FROM public.plans p WHERE p.slug = 'scale';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_month', 5000 FROM public.plans p WHERE p.slug = 'scale';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'uploads_per_month', 2500 FROM public.plans p WHERE p.slug = 'scale';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'team_members', 50 FROM public.plans p WHERE p.slug = 'scale';

  -- Business
  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_day', 9999 FROM public.plans p WHERE p.slug = 'business';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'posts_per_month', 999999 FROM public.plans p WHERE p.slug = 'business';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'uploads_per_month', 999999 FROM public.plans p WHERE p.slug = 'business';

  INSERT INTO public.plan_limits (plan_id, key, value)
  SELECT p.id, 'team_members', 9999 FROM public.plans p WHERE p.slug = 'business';
END $$;

-- 12. RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('plans','plan_limits','plan_features','subscriptions','credit_transactions','admin_settings','admin_roles','admin_user_roles')
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = format('allow_service_%s', t)
    ) THEN
      EXECUTE format(
        'CREATE POLICY allow_service_%I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        t, t
      );
    END IF;
  END LOOP;
END $$;
