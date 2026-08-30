-- StackPost — Migration 006
-- Corrige stackpost_processed_payments com colunas de valor, status e reembolso

ALTER TABLE public.stackpost_processed_payments ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE public.stackpost_processed_payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';
ALTER TABLE public.stackpost_processed_payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.stackpost_processed_payments ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER DEFAULT 0;
ALTER TABLE public.stackpost_processed_payments ADD COLUMN IF NOT EXISTS gateway_raw JSONB;

-- Garantir RLS (já deveria estar ativo)
ALTER TABLE public.stackpost_processed_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stackpost_processed_payments' AND policyname = 'allow_service'
  ) THEN
    CREATE POLICY allow_service ON public.stackpost_processed_payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
