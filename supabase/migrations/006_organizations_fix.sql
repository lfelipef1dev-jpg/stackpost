-- StackPost — Migration 006
-- Corrige organizations com colunas faltantes

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.organizations SET status = 'active' WHERE status IS NULL;
UPDATE public.organizations SET plan_status = 'active' WHERE plan_status IS NULL;
UPDATE public.organizations SET updated_at = now() WHERE updated_at IS NULL;
