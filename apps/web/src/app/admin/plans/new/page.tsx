'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function AdminPlanCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [plan, setPlan] = useState({
    name: '',
    slug: '',
    description: '',
    price_cents: 0,
    interval: 'month',
    trial_days: 0,
    is_active: true,
    is_public: true,
    sort_order: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plan.name.trim()) {
      setError('Informe o nome do plano antes de continuar.');
      return;
    }
    if (!plan.slug.trim()) {
      setError('O identificador (slug) é obrigatório.');
      return;
    }
    if (plan.price_cents < 0) {
      setError('O preço não pode ser negativo.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Plano criado com sucesso. Redirecionando...');
        router.push(`/admin/plans/${data.id}`);
      } else {
        setError(data.error || 'Não foi possível criar o plano. Tente novamente.');
      }
    } catch {
      setError('Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

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

      <h1 className="text-3xl font-bold mb-2 text-brand-text">Novo plano</h1>
      <p className="text-brand-text-secondary mb-6">
        Configure um novo plano de assinatura com preço, periodicidade e benefícios.
      </p>

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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="plan-name" className="text-sm text-brand-text-secondary">
            Nome do plano
          </label>
          <input
            id="plan-name"
            placeholder="Ex.: Plano Profissional"
            value={plan.name}
            onChange={(e) =>
              setPlan({ ...plan, name: e.target.value, slug: slugify(e.target.value) })
            }
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
            placeholder="profissional"
            value={plan.slug}
            onChange={(e) => setPlan({ ...plan, slug: slugify(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            required
            aria-required="true"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="plan-description" className="text-sm text-brand-text-secondary">
            Descrição
          </label>
          <input
            id="plan-description"
            placeholder="Descrição comercial exibida na página de preços"
            value={plan.description}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="plan-price" className="text-sm text-brand-text-secondary">
            Preço em centavos {plan.price_cents > 0 && `(${formatBRL(plan.price_cents)})`}
          </label>
          <input
            id="plan-price"
            type="number"
            min={0}
            placeholder="Ex.: 4990 (R$ 49,90)"
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
            placeholder="Ex.: 7"
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
            placeholder="0"
            value={plan.sort_order}
            onChange={(e) => setPlan({ ...plan, sort_order: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={plan.is_active}
              onChange={(e) => setPlan({ ...plan, is_active: e.target.checked })}
              className="w-5 h-5 accent-brand-accent"
            />
            <span className="text-sm text-brand-text-secondary">Plano ativo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={plan.is_public}
              onChange={(e) => setPlan({ ...plan, is_public: e.target.checked })}
              className="w-5 h-5 accent-brand-accent"
            />
            <span className="text-sm text-brand-text-secondary">Visível na página de preços</span>
          </label>
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Criando plano...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" /> Criar plano
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
