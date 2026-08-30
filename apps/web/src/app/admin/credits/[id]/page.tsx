'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Loader2, Plus, Minus, ArrowLeft, Wallet, AlertCircle, X } from 'lucide-react';

interface Transaction {
  id: string;
  team_id: string;
  platform: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  user?: { name: string; email: string };
  team?: { name: string };
}

interface Stats {
  active_by_platform: Record<string, number>;
  by_type: { type: string; count: number; total: number }[];
  by_day: { day: string; total: number }[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

function formatTransactionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export default function AdminCreditTeamDetailPage() {
  const { id } = useParams();
  const teamId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [form, setForm] = useState({
    team_id: teamId || '',
    platform: 'x',
    amount: '',
    description: '',
    reason: 'manual_adjustment',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [txRes, stRes] = await Promise.all([
        fetch(`/api/admin/credits/transactions?team_id=${teamId}`),
        fetch(`/api/admin/credits/stats?team_id=${teamId}`),
      ]);
      if (!txRes.ok || !stRes.ok) {
        throw new Error('Falha ao carregar os dados da equipe.');
      }
      const [tx, st] = await Promise.all([txRes.json(), stRes.json()]);
      setTransactions(tx || []);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (teamId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const teamName = useMemo(
    () =>
      transactions[0]?.team_id === teamId
        ? transactions[0]?.team?.name || teamId
        : teamId,
    [transactions, teamId],
  );

  const chartDays = useMemo(() => (stats?.by_day || []).slice(-30), [stats]);
  const maxDay = useMemo(
    () => Math.max(1, ...chartDays.map((d) => Math.abs(d.total || 0))),
    [chartDays],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const url = mode === 'add' ? '/api/admin/credits' : '/api/admin/credits/deduct';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessageTone('success');
        setMessage(
          mode === 'add'
            ? 'Créditos adicionados com sucesso.'
            : 'Créditos debitados com sucesso.',
        );
        setForm({
          team_id: teamId || '',
          platform: 'x',
          amount: '',
          description: '',
          reason: 'manual_adjustment',
        });
        setTimeout(() => setModalOpen(false), 900);
        fetchData();
      } else {
        setMessageTone('error');
        setMessage(data.error || 'Não foi possível processar a operação.');
      }
    } catch {
      setMessageTone('error');
      setMessage('Falha de comunicação com o servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando detalhes da equipe…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="alert">
        <AlertCircle className="w-10 h-10 text-error" aria-hidden="true" />
        <p className="text-brand-text-secondary text-center max-w-md">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/credits')}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar para créditos
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Equipe {teamName}</h1>
          <p className="text-brand-text-secondary">
            Saldo por plataforma e histórico de movimentações de créditos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('add');
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Adicionar créditos
          </button>
          <button
            onClick={() => {
              setMode('deduct');
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition"
          >
            <Minus className="w-4 h-4" aria-hidden="true" /> Debitar créditos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats?.active_by_platform && Object.entries(stats.active_by_platform).length > 0 ? (
          Object.entries(stats.active_by_platform).map(([platform, balance]) => (
            <div
              key={platform}
              className="rounded-2xl bg-brand-surface border border-brand-border p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Wallet className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-brand-text-secondary uppercase">{platform}</p>
                <p className="text-2xl font-bold font-mono">{balance}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-brand-surface border border-brand-border p-6 flex items-start gap-4 lg:col-span-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <Wallet className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-brand-text-secondary">Saldo ativo</p>
              <p className="text-2xl font-bold font-mono">0</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl bg-brand-surface border border-brand-border p-6">
          <h2 className="text-lg font-bold mb-4">Movimentação dos últimos 30 dias</h2>
          {chartDays.length === 0 ? (
            <p className="text-brand-text-secondary text-sm py-8 text-center">
              Nenhuma movimentação registrada no período.
            </p>
          ) : (
            <div className="space-y-2">
              {chartDays.map((d) => {
                const date = new Date(d.day);
                const label = Number.isNaN(date.getTime()) ? d.day.slice(5) : dayFormatter.format(date);
                return (
                  <div key={d.day} className="flex items-center gap-3 text-sm">
                    <div className="w-20 text-brand-text-secondary">{label}</div>
                    <div
                      className="flex-1 h-6 bg-brand-elevated rounded-md overflow-hidden relative"
                      role="img"
                      aria-label={`${label}: ${d.total} créditos`}
                    >
                      <div
                        className={`h-full ${d.total >= 0 ? 'bg-success/60' : 'bg-error/60'}`}
                        style={{ width: `${(Math.abs(d.total) / maxDay) * 100}%` }}
                      />
                    </div>
                    <div className="w-24 text-right font-mono">{d.total}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
          <h2 className="text-lg font-bold mb-4">Distribuição por tipo</h2>
          {stats?.by_type && stats.by_type.length > 0 ? (
            <div className="space-y-3">
              {stats.by_type.slice(0, 8).map((t) => (
                <div key={t.type} className="flex items-center justify-between text-sm">
                  <span className="text-brand-text-secondary capitalize">
                    {t.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono font-medium">
                    {t.total} ({t.count})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-text-secondary text-sm py-8 text-center">
              Sem dados de distribuição disponíveis.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <div className="p-6 border-b border-brand-border">
          <h2 className="text-lg font-bold">Histórico de transações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">
              Histórico de transações de créditos da equipe {teamName}
            </caption>
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Plataforma</th>
                <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                <th scope="col" className="px-6 py-4 font-medium">Tipo</th>
                <th scope="col" className="px-6 py-4 font-medium">Descrição</th>
                <th scope="col" className="px-6 py-4 font-medium">Usuário</th>
                <th scope="col" className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4 uppercase">{t.platform || '—'}</td>
                  <td
                    className={`px-6 py-4 font-mono font-medium ${
                      t.amount >= 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {t.amount > 0 ? '+' : ''}
                    {t.amount}
                  </td>
                  <td className="px-6 py-4 capitalize">{t.type.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={t.description || ''}>
                    {t.description || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {t.user
                      ? `${t.user.name || ''} <${t.user.email || ''}>`.trim()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTransactionDate(t.created_at)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-brand-text-secondary"
                  >
                    Nenhuma transação encontrada para esta equipe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="credit-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-brand-surface border border-brand-border p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 id="credit-modal-title" className="text-xl font-bold">
                {mode === 'add' ? 'Adicionar créditos' : 'Debitar créditos'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-brand-text-secondary hover:text-brand-text transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {message && (
              <div
                className={`mb-4 p-3 rounded-xl border text-sm ${
                  messageTone === 'success'
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-error/10 border-error/30 text-error'
                }`}
                role={messageTone === 'error' ? 'alert' : 'status'}
              >
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="credit-platform"
                  className="text-sm text-brand-text-secondary block mb-1"
                >
                  Plataforma
                </label>
                <input
                  id="credit-platform"
                  required
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="credit-amount"
                  className="text-sm text-brand-text-secondary block mb-1"
                >
                  Quantidade
                </label>
                <input
                  id="credit-amount"
                  type="number"
                  min={1}
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              {mode === 'add' && (
                <div>
                  <label
                    htmlFor="credit-reason"
                    className="text-sm text-brand-text-secondary block mb-1"
                  >
                    Motivo / Tipo
                  </label>
                  <select
                    id="credit-reason"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                  >
                    <option value="manual_adjustment">Ajuste manual</option>
                    <option value="bonus">Bônus</option>
                    <option value="purchase">Compra</option>
                    <option value="refund">Reembolso</option>
                  </select>
                </div>
              )}
              <div>
                <label
                  htmlFor="credit-description"
                  className="text-sm text-brand-text-secondary block mb-1"
                >
                  Descrição
                </label>
                <input
                  id="credit-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-medium hover:bg-brand-surface transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Processando…'
                    : mode === 'add'
                      ? 'Adicionar'
                      : 'Debitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
