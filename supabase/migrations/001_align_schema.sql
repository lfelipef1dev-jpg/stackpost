-- StackPost — Migration 001: Alinhar schema com codigo
-- Executar no Supabase SQL Editor do projeto stackpost
-- NAO deleta dados, apenas adiciona colunas faltantes

-- social_accounts: colunas usadas pelo codigo mas ausentes do schema original
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS platform_account_id TEXT;
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS platform_metadata JSONB DEFAULT '{}';
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- webhooks: colunas usadas pelo deliver e cron auto-disable
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS consecutive_failures INT DEFAULT 0;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS disabled_reason TEXT;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS events TEXT[] DEFAULT '{}';

-- webhook_events: codigo usa event_type mas schema tem type
-- Renomear type -> event_type (se existir type)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_events' AND column_name = 'type') THEN
    ALTER TABLE public.webhook_events RENAME COLUMN type TO event_type;
  END IF;
END $$;

-- webhook_events: delivered_at so em sucesso
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- posts: codigo usa post_date em alguns lugares (cron publish-scheduled corrigido para scheduled_at)
-- Nenhuma alteracao necessaria - scheduled_at ja existe

-- uploads: codigo referencia post_id
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- imported_posts: tabela para imports de postagens (usada em 002)
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

ALTER TABLE public.imported_posts ENABLE ROW LEVEL SECURITY;

-- usage_monthly: tabela para o cron monthly-usage-reset
CREATE TABLE IF NOT EXISTS public.usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  posts_count INT DEFAULT 0,
  uploads_count INT DEFAULT 0,
  api_calls BIGINT DEFAULT 0,
  reset_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id)
);

ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;

-- RLS na nova tabela
-- (service role bypassa RLS, igual ao padrao)
