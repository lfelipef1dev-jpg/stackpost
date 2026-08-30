-- StackPost — Migration 008
-- Expiração de créditos: credit_transactions e x_credit_balances

ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;

ALTER TABLE public.x_credit_balances ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_credit_transactions_expires ON public.credit_transactions(expires_at)
  WHERE expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_x_credit_balances_expires ON public.x_credit_balances(expires_at);
