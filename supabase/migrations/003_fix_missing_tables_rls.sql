-- StackPost — Migration 003
-- Corrige tabelas faltantes, colunas ausentes e adiciona RLS allow_service para todas as tabelas.

-- 1. Tabelas faltantes
CREATE TABLE IF NOT EXISTS public.x_credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  balance BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.imported_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  content TEXT,
  media JSONB,
  imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Colunas faltantes
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT;

-- 3. RLS em tabelas novas
ALTER TABLE public.x_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_posts ENABLE ROW LEVEL SECURITY;

-- 4. Allow service role policies para TODAS as tabelas
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
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
