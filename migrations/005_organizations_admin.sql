-- StackPost — Migration 005
-- Ajusta organizations para admin (slug, created_at, status)

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.organizations SET status = 'active' WHERE status IS NULL;
UPDATE public.organizations SET created_at = now() WHERE created_at IS NULL;
UPDATE public.organizations SET updated_at = now() WHERE updated_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'allow_service_organizations'
  ) THEN
    CREATE POLICY allow_service_organizations ON public.organizations
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
