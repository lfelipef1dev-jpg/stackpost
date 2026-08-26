-- StackPost — Schema Supabase (PostgreSQL)
-- Projeto: aaynzvvoeufunbpzblwa
-- Organizacao: StackPost Studio
-- Regra: cada projeto é uma ilha — NUNCA compartilhar com NEXUS/SEEDS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  derivatives JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  content TEXT,
  platforms TEXT[] NOT NULL,
  upload_ids UUID[],
  derivatives JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  external_data JSONB,
  errors JSONB,
  first_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  external_url TEXT,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  counter_name TEXT NOT NULL,
  period TEXT NOT NULL,
  value BIGINT DEFAULT 0,
  reset_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT,
  text TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.link_in_bio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  row_count INT DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stackpost_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  team_id UUID,
  plano_escolhido TEXT NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.stackpost_processed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  order_id TEXT,
  team_id UUID,
  plano TEXT,
  processado_em TIMESTAMPTZ DEFAULT now()
);

-- RLS em todas as tabelas (REGRA ABSOLUTA)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_in_bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stackpost_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stackpost_processed_payments ENABLE ROW LEVEL SECURITY;

-- Policy padrao: service role bypassa RLS
-- Nao criamos policies publicas — o app usa service_role key
-- (igual ao padrao do NEXUS-IA)
