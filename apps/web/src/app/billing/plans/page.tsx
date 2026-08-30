'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Check,
  X,
  Zap,
  Sparkles,
  Building2,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { TiltCard } from '@/components/TiltCard';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

interface PlanFeature {
  label: string;
  value: string | number | boolean;
}

interface Plan {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  price_cents?: number;
  accent?: string;
  popular?: boolean;
  features: PlanFeature[];
  included: string[];
  overage?: { label: string; price: string }[];
}

interface Subscription {
  id?: string;
  plan?: { id: string; slug: string; name: string };
  status?: string;
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  starter: Sparkles,
  growth: Building2,
  scale: Crown,
  business: Crown,
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    slug: 'free',
    name: 'Free',
    tagline: 'Para começar sem pagar',
    monthlyPrice: 0,
    annualPrice: 0,
    accent: '#94A3B8',
    features: [
      { label: 'Posts / mês', value: '50' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Usuários', value: '1' },
      { label: 'Upload de mídia', value: '100 MB' },
      { label: 'AI caption', value: false },
      { label: 'Suporte', value: 'Comunidade' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics básico', 'Calendário'],
    overage: [],
  },
  {
    id: 'starter',
    slug: 'starter',
    name: 'Inicial',
    tagline: 'Para criadores e pequenos times',
    monthlyPrice: 39,
    annualPrice: 33,
    accent: '#22D3EE',
    features: [
      { label: 'Posts / mês', value: '2.000' },
      { label: 'Contas sociais', value: '5' },
      { label: 'Usuários', value: '2' },
      { label: 'Upload de mídia', value: '500 MB' },
      { label: 'AI caption', value: false },
      { label: 'Suporte', value: 'Email' },
    ],
    included: ['Tudo do Free', 'Postagem em massa', 'Link na bio'],
    overage: [{ label: 'Post extra', price: 'R$ 0,02' }],
  },
  {
    id: 'growth',
    slug: 'growth',
    name: 'Crescimento',
    tagline: 'Para agências e SaaS iniciantes',
    monthlyPrice: 89,
    annualPrice: 75,
    accent: '#A78BFA',
    popular: true,
    features: [
      { label: 'Posts / mês', value: '8.000' },
      { label: 'Contas sociais', value: '20' },
      { label: 'Usuários', value: '5' },
      { label: 'Upload de mídia', value: '2 GB' },
      { label: 'AI caption', value: true },
      { label: 'Suporte', value: 'Prioritário' },
    ],
    included: ['Tudo do Inicial', 'AI caption', 'Analytics avançado'],
    overage: [
      { label: 'Post extra', price: 'R$ 0,015' },
      { label: 'Legenda IA', price: 'R$ 0,05' },
    ],
  },
  {
    id: 'scale',
    slug: 'scale',
    name: 'Escala',
    tagline: 'Para SaaS e agências em escala',
    monthlyPrice: 197,
    annualPrice: 167,
    accent: '#60A5FA',
    features: [
      { label: 'Posts / mês', value: '40.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuários', value: '20' },
      { label: 'Upload de mídia', value: '10 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
    ],
    included: ['Tudo do Crescimento', 'MCP server', 'Workspaces múltiplos'],
    overage: [
      { label: 'Post extra', price: 'R$ 0,01' },
      { label: 'Legenda IA', price: 'R$ 0,04' },
    ],
  },
  {
    id: 'business',
    slug: 'business',
    name: 'Empresarial',
    tagline: 'Para grandes operações',
    monthlyPrice: 497,
    annualPrice: 422,
    accent: '#C084FC',
    features: [
      { label: 'Posts / mês', value: '150.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuários', value: 'Ilimitados' },
      { label: 'Upload de mídia', value: '50 GB' },
      { label: 'AI caption', value: true },
      { label: 'Suporte', value: 'Dedicado' },
    ],
    included: ['Tudo do Escala', 'Suporte dedicado', 'SLA garantido'],
    overage: [{ label: 'Sob demanda', price: 'Custom' }],
  },
];

function formatPlanPrice(price: number | null) {
  if (price === null) return 'Custom';
  if (price === 0) return 'R$ 0';
  return currencyFormatter.format(price);
}

export default function BillingPlansPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/plans').then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar planos.');
        return r.json();
      }),
      fetch('/api/billing/subscription').then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar assinatura.');
        return r.json();
      }),
    ])
      .then(([plansData, subData]) => {
        if (Array.isArray(plansData) && plansData.length > 0) {
          // Merge API plans with defaults for features
          const merged = plansData.map((p: any) => {
            const def = DEFAULT_PLANS.find((d) => d.slug === p.slug || d.id === p.slug);
            return {
              ...def,
              ...p,
              id: p.id || p.slug,
              slug: p.slug || p.id,
              monthlyPrice: p.price_cents ? p.price_cents / 100 : def?.monthlyPrice,
              features: def?.features || [],
              included: def?.included || [],
              overage: def?.overage || [],
              accent: def?.accent || '#8AB4F8',
            } as Plan;
          });
          setPlans(merged.length > 0 ? merged : DEFAULT_PLANS);
        }
        setSubscription(subData);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar os planos.'))
      .finally(() => setLoading(false));
  }, []);

  const currentPlanSlug = subscription?.plan?.slug || 'free';

  async function handleConfirmChange() {
    if (!confirmPlan) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_plan', plan_id: confirmPlan.id }),
      });
      if (res.ok) {
        setConfirmPlan(null);
        window.location.href = '/billing';
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao trocar de plano. Tente novamente.');
      }
    } catch {
      alert('Erro de conexão ao trocar de plano. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando planos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="alert">
        <AlertCircle className="w-10 h-10 text-error" aria-hidden="true" />
        <p className="text-brand-text-secondary text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-brand-text hover:border-brand-accent transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toggle mensal/anual */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-brand-surface border border-brand-border">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              !isAnnual ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
              isAnnual ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Anual <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded-full">-15%</span>
          </button>
        </div>
        {isAnnual && (
          <p className="text-xs text-brand-text-secondary mt-3">
            No anual você paga 12x o valor mensal e economiza 2 meses.
          </p>
        )}
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.slug] || Zap;
          const isCurrent = currentPlanSlug === plan.slug;
          const isFree = plan.slug === 'free';
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const oldPrice = isAnnual ? plan.monthlyPrice : null;
          const accent = plan.accent || '#8AB4F8';

          return (
            <TiltCard key={plan.id} className="h-full">
              <SpotlightCard
                className="h-full p-6 flex flex-col"
                spotlightColor={`${accent}26`}
              >
                <div
                  className="flex items-center justify-between mb-4"
                  style={{ borderColor: isCurrent ? `${accent}60` : undefined }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold border border-success/20">
                      Plano atual
                    </span>
                  )}
                  {plan.popular && !isCurrent && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                      style={{ backgroundColor: `${accent}15`, color: accent, borderColor: `${accent}40` }}
                    >
                      Mais popular
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-brand-text-secondary mb-5">{plan.tagline}</p>

                <div className="mb-5">
                  <div className="text-3xl font-bold flex items-baseline gap-2">
                    {formatPlanPrice(price)}
                    <span className="text-sm font-normal text-brand-text-secondary">/mês</span>
                  </div>
                  {isAnnual && oldPrice && (
                    <div className="text-xs text-brand-text-secondary line-through">
                      {formatPlanPrice(oldPrice)}/mês
                    </div>
                  )}
                </div>

                {/* O que está incluído */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide mb-2">
                    Incluído
                  </div>
                  {plan.features.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2 text-xs">
                      {typeof feature.value === 'boolean' ? (
                        feature.value ? (
                          <Check className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-brand-text-secondary" />
                        )
                      ) : (
                        <Check className="w-3.5 h-3.5 text-success" />
                      )}
                      <span
                        className={
                          typeof feature.value === 'boolean' && !feature.value
                            ? 'text-brand-text-secondary'
                            : 'text-brand-text'
                        }
                      >
                        {feature.label}: <span className="font-semibold">{String(feature.value)}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Preço por uso extra */}
                {plan.overage && plan.overage.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-brand-border">
                    <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide mb-2">
                      Uso extra
                    </div>
                    {plan.overage.map((o) => (
                      <div key={o.label} className="flex justify-between text-xs mb-1">
                        <span className="text-brand-text-secondary">{o.label}</span>
                        <span className="font-semibold text-brand-accent">{o.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setConfirmPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full mt-auto px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-brand-elevated border border-brand-border text-brand-text-secondary cursor-not-allowed'
                      : isFree
                      ? 'bg-brand-elevated border border-brand-border text-brand-text hover:border-brand-accent'
                      : 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                  }`}
                >
                  {isCurrent ? (
                    'Plano atual'
                  ) : isFree ? (
                    'Começar grátis'
                  ) : (
                    <>
                      Trocar para este plano <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </SpotlightCard>
            </TiltCard>
          );
        })}
      </div>

      {/* Modal de confirmação */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Confirmar troca de plano</h3>
            <p className="text-sm text-brand-text-secondary mb-6">
              Você está prestes a trocar para o plano{' '}
              <span className="font-semibold text-brand-text">{confirmPlan.name}</span>
              {isAnnual && confirmPlan.annualPrice
                ? ` por ${formatPlanPrice(confirmPlan.annualPrice)}/mês (anual)`
                : confirmPlan.monthlyPrice
                ? ` por ${formatPlanPrice(confirmPlan.monthlyPrice)}/mês (mensal)`
                : ''}
              . A cobrança será ajustada proporcionalmente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPlan(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text font-semibold hover:bg-brand-elevated transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar troca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
