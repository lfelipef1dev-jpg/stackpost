-- StackPost — Migration 002: Audit logs e imported_posts metadata
-- Executar no Supabase SQL Editor do projeto stackpost

-- audit_logs: rastreabilidade de acoes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_service_audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- imported_posts: adicionar metadata se nao existir
ALTER TABLE public.imported_posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- comments: adicionar external_id e author se nao existirem
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ;

-- posts: adicionar reference_key se nao existir
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reference_key TEXT;

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_created ON public.audit_logs(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_external_id ON public.comments(external_id);
CREATE INDEX IF NOT EXISTS idx_posts_reference_key ON public.posts(reference_key);
