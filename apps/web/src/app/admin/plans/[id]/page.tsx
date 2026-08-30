'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Save, Crown, CheckCircle2 } from 'lucide-react';

const LIMIT_KEYS = [
  'posts_per_day',
  'posts_per_month',
  'uploads_per_month',
  'team_members',
  'workspaces',
  'credits_per_month',
];
const FEATURE_KEYS = [
  'ai_caption',
  'bulk_posts',
  'webhooks',
  'api_access',
  'comments',
  'analytics',
  'priority_support',
  'sso',
];

const LIMIT_LABELS: Record<string, string> = {
  posts_per_day: 'Publicações por dia',
  posts_per_month: 'Publicações por mês',
  uploads_per_month: 'Uploads por mês',
  team_members: 'Membros da equipe',
  workspaces: 'Workspaces',
  credits_per_month: 'Créditos por mês',
};

const FEATURE_LABELS: Record<string, string> = {
  ai_caption: 'Legendas com IA',
  bulk_posts: 'Publicações em massa',
  webhooks: 'Webhooks',
  api_access: 'Acesso à API',
  comments: 'Resposta de comentários',
  analytics: 'Analytics avançado',
  priority_support: 'Suporte prioritário',
  sso: 'SSO (Single Sign-On)',
};

const INTERVAL_LABELS: Record<string, string> = {
  month: 'Mensal',
  year: 'Anual',
  lifetime: 'Vitalício',
};

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  trial_days: number;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  limits: { key: string; value: number }[];
  features: { key: string; value: boolean }[];
  subscriber_count: number;
  created_at?: string;
}

export default function AdminPlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/admin/plans/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar o plano.');
        return r.json();
      })
      .then(setPlan)
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [id]);

  function limitValue(key: string) {
    return plan?.limits.find((l) => l.key === key)?.value ?? 0;
  }

  function setLimit(key: string, value: number) {
    if (!plan) return;
    const next = plan.limits.filter((l) => l.key !== key);
    next.push({ key, value });
    setPlan({ ...plan, limits: next });
  }

  function featureValue(key: string) {
    const v = plan?.features.find((f) => f.key === key)?.value;
    return typeof v === 'boolean' ? v : false;
  }

  function setFeature(key: string, value: boolean) {
    if (!plan) return;
    const next = plan.features.filter((f) => f.key !== key);
    next.push({ key, value });
    setPlan({ ...plan, features: next });
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          price_cents: plan.price_cents,
          currency: plan.currency,
          interval: plan.interval,
          trial_days: plan.trial_days,
          is_active: plan.is_active,
          is_public: plan.is_public,
          sort_order: plan.sort_order,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetch(`/api/admin/plans/${id}/limits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limits: Object.fromEntries(plan.limits.map((l) => [l.key, l.value])),
          }),
        });
        await fetch(`/api/admin/plans/${id}/features`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features: Object.fromEntries(plan.features.map((f) => [f.key, f.value])),
          }),
        });
        setSuccess('Plano atualizado com sucesso.');
      } else {
        setError(data.error || 'Não foi possível salvar o plano. Tente novamente.');
      }
    } catch {
      setError('Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-label="Carregando plano">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando dados do plano...</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        role="alert"
        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3"
      >
        <AlertCircle className="w-5 h-5" aria-hidden="true" /> Plano não encontrado ou erro ao
        carregar. Verifique o endereço e tente novamente.
      </div>
    );
  }

  const createdLabel = plan.created_at
    ? new Date(plan.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/admin/plans')}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 transition-colors"
        aria-label="Voltar para a lista de planos"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar para planos
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-brand-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-text">{plan.name}</h1>
          <p className="text-brand-text-secondary">
            {plan.slug} • {plan.subscriber_count} assinante{plan.subscriber_count !== 1 ? 's' : ''}
            {createdLabel && ` • Criado em ${createdLabel}`}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSavePlan}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label htmlFor="plan-name" className="text-sm text-brand-text-secondary">
              Nome do plano
            </label>
            <input
              id="plan-name"
              value={plan.name}
              onChange={(e) => setPlan({ ...plan, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              required
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-slug" className="text-sm text-brand-text-secondary">
              Identificador (slug)
            </label>
            <input
              id="plan-slug"
              value={plan.slug}
              onChange={(e) => setPlan({ ...plan, slug: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              required
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-price" className="text-sm text-brand-text-secondary">
              Preço em centavos ({formatBRL(plan.price_cents)})
            </label>
            <input
              id="plan-price"
              type="number"
              min={0}
              value={plan.price_cents}
              onChange={(e) => setPlan({ ...plan, price_cents: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-interval" className="text-sm text-brand-text-secondary">
              Periodicidade
            </label>
            <select
              id="plan-interval"
              value={plan.interval}
              onChange={(e) => setPlan({ ...plan, interval: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            >
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
              <option value="lifetime">Vitalício</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-trial" className="text-sm text-brand-text-secondary">
              Dias de teste gratuito
            </label>
            <input
              id="plan-trial"
              type="number"
              min={0}
              value={plan.trial_days}
              onChange={(e) => setPlan({ ...plan, trial_days: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-order" className="text-sm text-brand-text-secondary">
              Ordem de exibição
            </label>
            <input
              id="plan-order"
              type="number"
              min={0}
              value={plan.sort_order}
              onChange={(e) => setPlan({ ...plan, sort_order: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-brand-text">Limites</h2>
          <p className="text-sm text-brand-text-secondary mb-4">
            Defina as cotas máximas que cada assinante deste plano pode utilizar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIMIT_KEYS.map((k) => (
              <div key={k} className="space-y-2">
                <label htmlFor={`limit-${k}`} className="text-sm text-brand-text-secondary">
                  {LIMIT_LABELS[k] ?? k.replace(/_/g, ' ')}
                </label>
                <input
                  id={`limit-${k}`}
                  type="number"
                  min={0}
                  value={limitValue(k)}
                  onChange={(e) => setLimit(k, Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-brand-text">Recursos</h2>
          <p className="text-sm text-brand-text-secondary mb-4">
            Marque as funcionalidades disponíveis para os assinantes deste plano.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_KEYS.map((k) => (
              <label
                key={k}
                htmlFor={`feature-${k}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface border border-brand-border cursor-pointer"
              >
                <input
                  id={`feature-${k}`}
                  type="checkbox"
                  checked={featureValue(k)}
                  onChange={(e) => setFeature(k, e.target.checked)}
                  className="w-5 h-5 accent-brand-accent"
                />
                <span className="text-brand-text">{FEATURE_LABELS[k] ?? k.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" /> Salvar alterações
            </>
          )}
        </button>
      </form>
    </div>
  );
}
