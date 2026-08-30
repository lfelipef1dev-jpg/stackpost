'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft, Save, XCircle, RefreshCcw, CreditCard, Calendar, Building2, CheckCircle2 } from 'lucide-react';

interface Payment {
  id: string;
  payment_id: string;
  order_id: string;
  plano: string;
  processado_em: string;
}

interface SubscriptionDetail {
  id: string;
  organization_id: string;
  plan_id: string;
  plan_slug: string;
  status: string;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  organization: { id: string; name: string; slug: string | null; owner: { id: string; name: string; email: string } | null } | null;
  plan: { id: string; slug: string; name: string; price_cents: number; currency: string; interval: string } | null;
  payment_history: Payment[];
}

interface PlanOption {
  id: string;
  slug: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  trialing: 'Em período de teste',
  paused: 'Pausada',
};

const formatDate = (value: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminSubscriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [newPlanId, setNewPlanId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/billing/subscriptions/${id}`).then((r) => r.json()),
      fetch('/api/admin/plans').then((r) => r.json()),
    ])
      .then(([subData, plansData]) => {
        if (!subData || subData.error) {
          setFetchError(subData?.error || 'Não foi possível carregar a assinatura.');
        } else {
          setSub(subData);
        }
        setPlans((plansData || []).map((p: any) => ({ id: p.id, slug: p.slug, name: p.name })));
      })
      .catch(() => setFetchError('Falha ao conectar com o servidor. Tente novamente.'))
      .finally(() => setLoading(false));
  }, [id]);

  function notify(text: string, type: 'success' | 'error') {
    setMessage(text);
    setMessageType(type);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!sub) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/billing/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: sub.plan_id,
          status: sub.status,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        notify('Assinatura atualizada com sucesso.', 'success');
        setSub(data);
      } else {
        notify(data.error || 'Erro ao salvar as alterações.', 'error');
      }
    } catch {
      notify('Falha ao conectar com o servidor. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!sub) return;
    if (!confirm('Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.')) return;
    setCancelling(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/billing/subscriptions/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        notify('Assinatura cancelada com sucesso.', 'success');
        setSub(data);
      } else {
        notify(data.error || 'Erro ao cancelar a assinatura.', 'error');
      }
    } catch {
      notify('Falha ao conectar com o servidor. Tente novamente.', 'error');
    } finally {
      setCancelling(false);
    }
  }

  async function handleChangePlan() {
    if (!sub || !newPlanId) {
      notify('Selecione um plano para continuar.', 'error');
      return;
    }
    setChangingPlan(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/billing/plans/${newPlanId}/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Plano alterado com sucesso. Ajuste pro-rata aplicado: ${(data.prorated_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`, 'success');
        setSub(data.subscription);
        setNewPlanId('');
      } else {
        notify(data.error || 'Erro ao alterar o plano.', 'error');
      }
    } catch {
      notify('Falha ao conectar com o servidor. Tente novamente.', 'error');
    } finally {
      setChangingPlan(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando assinatura...</span>
      </div>
    );
  }

  if (fetchError || !sub) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3" role="alert">
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>{fetchError || 'Assinatura não encontrada.'}</span>
      </div>
    );
  }

  const statuses = ['active', 'past_due', 'canceled', 'trialing', 'paused'];

  return (
    <div>
      <button
        onClick={() => router.push('/admin/billing')}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar para assinaturas
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-brand-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da assinatura</h1>
          <p className="text-brand-text-secondary">{sub.organization?.name || 'Organização não identificada'}</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          role={messageType === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {messageType === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary flex items-center gap-2 mb-2"><Building2 className="w-4 h-4" aria-hidden="true" /> Organização</div>
          <div className="text-lg font-semibold">{sub.organization?.name || '-'}</div>
          <div className="text-sm text-brand-text-secondary">{sub.organization?.owner?.email || '-'}</div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4" aria-hidden="true" /> Provedor de pagamento</div>
          <div className="text-lg font-semibold capitalize">{sub.payment_provider || 'Manual'}</div>
          <div className="text-sm text-brand-text-secondary font-mono truncate">{sub.provider_subscription_id || '-'}</div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary flex items-center gap-2 mb-2"><Calendar className="w-4 h-4" aria-hidden="true" /> Criada em</div>
          <div className="text-lg font-semibold">{formatDate(sub.created_at)}</div>
          <div className="text-sm text-brand-text-secondary">{sub.canceled_at ? `Cancelada em ${formatDate(sub.canceled_at)}` : 'Sem cancelamento registrado'}</div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="plan" className="text-sm text-brand-text-secondary">Plano</label>
          <select
            id="plan"
            value={sub.plan_id || ''}
            onChange={(e) => setSub({ ...sub, plan_id: e.target.value, plan_slug: plans.find((p) => p.id === e.target.value)?.slug || '' })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm text-brand-text-secondary">Status</label>
          <select
            id="status"
            value={sub.status}
            onChange={(e) => setSub({ ...sub, status: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="period-start" className="text-sm text-brand-text-secondary">Início do período</label>
          <input
            id="period-start"
            type="datetime-local"
            value={sub.current_period_start ? new Date(sub.current_period_start).toISOString().slice(0, 16) : ''}
            onChange={(e) => setSub({ ...sub, current_period_start: new Date(e.target.value).toISOString() })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="period-end" className="text-sm text-brand-text-secondary">Fim do período</label>
          <input
            id="period-end"
            type="datetime-local"
            value={sub.current_period_end ? new Date(sub.current_period_end).toISOString().slice(0, 16) : ''}
            onChange={(e) => setSub({ ...sub, current_period_end: new Date(e.target.value).toISOString() })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
            Salvar alterações
          </button>
          <button
            type="button"
            onClick={handleChangePlan}
            disabled={changingPlan || !newPlanId}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface disabled:opacity-50 font-medium transition-colors"
          >
            {changingPlan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="w-4 h-4" aria-hidden="true" />}
            Alterar plano (pro-rata)
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 font-medium transition-colors"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
            Cancelar assinatura
          </button>
        </div>
      </form>

      <div className="mb-8 p-6 rounded-2xl bg-brand-surface border border-brand-border">
        <h2 className="text-lg font-bold mb-4">Alterar plano com ajuste pro-rata</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            id="new-plan"
            value={newPlanId}
            onChange={(e) => setNewPlanId(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            aria-label="Selecione o novo plano"
          >
            <option value="">Selecione um plano...</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            type="button"
            onClick={handleChangePlan}
            disabled={changingPlan || !newPlanId}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-bg disabled:opacity-50 font-medium transition-colors"
          >
            {changingPlan ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="w-4 h-4" aria-hidden="true" />}
            Aplicar alteração
          </button>
        </div>
        <p className="text-sm text-brand-text-secondary mt-3">O ajuste pro-rata é calculado automaticamente com base no período restante.</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Histórico de pagamentos</h2>
      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <caption className="sr-only">Histórico de pagamentos da assinatura</caption>
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">ID do pagamento</th>
              <th scope="col" className="px-6 py-4 font-medium">Pedido</th>
              <th scope="col" className="px-6 py-4 font-medium">Plano</th>
              <th scope="col" className="px-6 py-4 font-medium">Processado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sub.payment_history?.map((p) => (
              <tr key={p.id} className="hover:bg-brand-elevated/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{p.payment_id}</td>
                <td className="px-6 py-4 font-mono text-xs">{p.order_id}</td>
                <td className="px-6 py-4">{p.plano || '-'}</td>
                <td className="px-6 py-4 text-brand-text-secondary">{formatDate(p.processado_em)}</td>
              </tr>
            ))}
            {!sub.payment_history?.length && (
              <tr>
                <td className="px-6 py-4 text-brand-text-secondary text-center" colSpan={4}>Nenhum pagamento registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
