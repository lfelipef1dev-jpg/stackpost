-- StackPost — Migration 002: OAuth login support
-- Adiciona colunas para login com Google/Discord (sem senha)
-- NAO deleta dados, apenas adiciona colunas

-- users: provider (google/discord/email), avatar_url, e password_hash nullable
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- password_hash precisa ser nullable para usuarios de OAuth (sem senha)
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- status ja existe no banco real, mas garantir default
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'active';
