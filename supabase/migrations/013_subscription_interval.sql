-- 013: Adiciona coluna interval para suportar cobrança anual
-- stackpost_orders: registra se o checkout foi mensal ou anual
-- subscriptions: registra o intervalo da assinatura ativa

ALTER TABLE public.stackpost_orders
  ADD COLUMN IF NOT EXISTS interval TEXT DEFAULT 'monthly';

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS interval TEXT DEFAULT 'monthly';
