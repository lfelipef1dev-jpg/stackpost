-- StackPost — Migration 005
-- billing_events: tabela append-only para metering de uso (pay-as-you-go)

CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'post', 'api_call', 'ai_caption', 'x_post_link', 'upload_gb'
  platform TEXT,
  units NUMERIC NOT NULL DEFAULT 1,
  unit_cost_cents INTEGER NOT NULL, -- custo em centavos por unidade
  total_cost_cents INTEGER NOT NULL, -- units * unit_cost_cents
  idempotency_key TEXT UNIQUE, -- previne duplicação
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_team ON public.billing_events(team_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created ON public.billing_events(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_idempotency ON public.billing_events(idempotency_key);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'billing_events' AND policyname = 'allow_service'
  ) THEN
    CREATE POLICY allow_service ON public.billing_events FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
