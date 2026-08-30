'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Minus, Download, Eye, TrendingUp, TrendingDown, Clock, Wallet, AlertCircle, X } from 'lucide-react';

interface Overview {
  total_issued: number;
  total_consumed: number;
  total_expired: number;
  active: number;
  teams: { team_id: string; team_name: string; platform: string; balance: number }[];
}

interface Stats {
  active_total: number;
  active_by_platform: Record<string, number>;
  by_type: { type: string; count: number; total: number }[];
  by_platform: { platform: string; count: number; total: number }[];
  by_day: { day: string; total: number }[];
}

const PLATFORM_LABELS: Record<string, string> = {
  x: 'X (Twitter)',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  threads: 'Threads',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  snapchat: 'Snapchat',
  discord: 'Discord',
  slack: 'Slack',
  google: 'Google Business',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
};

const TYPE_LABELS: Record<string, string> = {
  manual_adjustment: 'Ajuste manual',
  bonus: 'Bônus',
  purchase: 'Compra',
  refund: 'Reembolso',
  usage: 'Uso',
  expiration: 'Expiração',
};

function formatPlatform(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] || platform.toUpperCase();
}

function formatType(type: string): string {
  return TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

function formatDay(day: string): string {
  try {
    const date = new Date(day + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return day.slice(5);
  }
}

export default function AdminCreditsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [form, setForm] = useState({
    team_id: '',
    platform: 'x',
    amount: '',
    description: '',
    reason: 'manual_adjustment',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, stRes] = await Promise.all([
        fetch('/api/admin/credits'),
        fetch('/api/admin/credits/stats'),
      ]);
      if (!ovRes.ok || !stRes.ok) {
        throw new Error('Falha ao carregar dados de créditos.');
      }
      const [ov, st] = await Promise.all([ovRes.json(), stRes.json()]);
      setOverview(ov);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen]);

  const chartDays = useMemo(() => {
    if (!stats?.by_day) return [];
    return stats.by_day.slice(-30);
  }, [stats]);

  const maxDay = useMemo(() => {
    return Math.max(1, ...chartDays.map((d) => Math.abs(d.total || 0)));
  }, [chartDays]);

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
        setMessageType('success');
        setMessage(mode === 'add' ? 'Créditos adicionados com sucesso.' : 'Créditos debitados com sucesso.');
        setForm({ team_id: '', platform: 'x', amount: '', description: '', reason: 'manual_adjustment' });
        setTimeout(() => {
          setModalOpen(false);
          setMessage('');
          loadData();
        }, 1000);
      } else {
        setMessageType('error');
        setMessage(data.error || 'Não foi possível processar a operação.');
      }
    } catch {
      setMessageType('error');
      setMessage('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-label="Carregando créditos">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        <span className="sr-only">Carregando dados de créditos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-10 h-10 text-error" />
        <p className="text-brand-text-secondary text-center max-w-md">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2.5 rounded-xl bg-brand-accent text-brand-bg font-medium text-sm hover:bg-brand-accent-hover transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Créditos</h1>
          <p className="text-brand-text-secondary">Visão geral de saldos, movimentações e expiração de créditos por equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/credits/transactions"
            className="px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text text-sm font-medium transition"
          >
            Ver transações
          </Link>
          <button
            onClick={() => { setMode('add'); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
            aria-label="Adicionar créditos a uma equipe"
          >
            <Plus className="w-4 h-4" /> Adicionar créditos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Créditos ativos" value={overview?.active || 0} tone="accent" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total emitido" value={overview?.total_issued || 0} tone="success" />
        <StatCard icon={<TrendingDown className="w-5 h-5" />} label="Total consumido" value={overview?.total_consumed || 0} tone="error" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Total expirado" value={overview?.total_expired || 0} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl bg-brand-surface border border-brand-border p-6">
          <h2 className="text-lg font-bold mb-4">Movimentação — últimos 30 dias</h2>
          {chartDays.length === 0 ? (
            <p className="text-brand-text-secondary text-sm py-8 text-center">Sem movimentação no período.</p>
          ) : (
            <div className="space-y-2">
              {chartDays.map((d) => (
                <div key={d.day} className="flex items-center gap-3 text-sm">
                  <div className="w-20 text-brand-text-secondary tabular-nums">{formatDay(d.day)}</div>
                  <div className="flex-1 h-6 bg-brand-elevated rounded-md overflow-hidden relative" role="img" aria-label={`${formatDay(d.day)}: ${d.total} créditos`}>
                    <div
                      className={`h-full ${d.total >= 0 ? 'bg-success/60' : 'bg-error/60'}`}
                      style={{ width: `${(Math.abs(d.total) / maxDay) * 100}%` }}
                    />
                  </div>
                  <div className="w-24 text-right font-mono tabular-nums">{d.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-brand-surface border border-brand-border p-6">
          <h2 className="text-lg font-bold mb-4">Por plataforma</h2>
          <div className="space-y-3">
            {stats?.by_platform.slice(0, 6).map((p) => (
              <div key={p.platform} className="flex items-center justify-between text-sm">
                <span className="text-brand-text-secondary">{formatPlatform(p.platform)}</span>
                <span className="font-mono font-medium tabular-nums">{p.total}</span>
              </div>
            ))}
            {(!stats?.by_platform || stats.by_platform.length === 0) && (
              <p className="text-brand-text-secondary text-sm">Sem dados.</p>
            )}
          </div>
          <h2 className="text-lg font-bold mt-6 mb-4">Por tipo</h2>
          <div className="space-y-3">
            {stats?.by_type.slice(0, 6).map((t) => (
              <div key={t.type} className="flex items-center justify-between text-sm">
                <span className="text-brand-text-secondary">{formatType(t.type)}</span>
                <span className="font-mono font-medium tabular-nums">{t.total} ({t.count})</span>
              </div>
            ))}
            {(!stats?.by_type || stats.by_type.length === 0) && (
              <p className="text-brand-text-secondary text-sm">Sem dados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-lg font-bold">Equipes com saldo</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/credits/transactions')}
              className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-surface transition flex items-center gap-1"
              aria-label="Exportar transações em CSV"
            >
              <Download className="w-3 h-3" /> Exportar transações
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Lista de equipes com saldo de créditos por plataforma</caption>
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Equipe</th>
                <th scope="col" className="px-6 py-4 font-medium">Plataforma</th>
                <th scope="col" className="px-6 py-4 font-medium">Saldo</th>
                <th scope="col" className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {overview?.teams.map((t) => (
                <tr key={`${t.team_id}-${t.platform}`} className="hover:bg-brand-elevated/50 transition">
                  <td className="px-6 py-4">{t.team_name}</td>
                  <td className="px-6 py-4">{formatPlatform(t.platform)}</td>
                  <td className="px-6 py-4 font-mono tabular-nums">{t.balance}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/credits/${t.team_id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-surface transition flex items-center gap-1"
                        aria-label={`Ver detalhes da equipe ${t.team_name}`}
                      >
                        <Eye className="w-3 h-3" /> Ver
                      </Link>
                      <button
                        onClick={() => { setForm({ ...form, team_id: t.team_id, platform: t.platform }); setMode('add'); setModalOpen(true); }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-surface transition"
                        aria-label={`Adicionar créditos à equipe ${t.team_name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { setForm({ ...form, team_id: t.team_id, platform: t.platform }); setMode('deduct'); setModalOpen(true); }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-surface transition"
                        aria-label={`Debitar créditos da equipe ${t.team_name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!overview?.teams || overview.teams.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brand-text-secondary">Nenhuma equipe com saldo ativo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-bg/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-brand-surface border border-brand-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-xl font-bold">{mode === 'add' ? 'Adicionar créditos' : 'Debitar créditos'}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-text-secondary hover:text-brand-text transition"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {message && (
              <div
                className={`mb-4 p-3 rounded-xl border text-sm ${messageType === 'success'
                  ? 'bg-success/10 border-success/30 text-success'
                  : 'bg-error/10 border-error/30 text-error'}`}
                role={messageType === 'error' ? 'alert' : 'status'}
              >
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="form-team-id" className="text-sm text-brand-text-secondary block mb-1">ID da equipe</label>
                <input
                  id="form-team-id"
                  required
                  value={form.team_id}
                  onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                />
              </div>
              <div>
                <label htmlFor="form-platform" className="text-sm text-brand-text-secondary block mb-1">Plataforma</label>
                <select
                  id="form-platform"
                  required
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                >
                  {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="form-amount" className="text-sm text-brand-text-secondary block mb-1">Quantidade</label>
                <input
                  id="form-amount"
                  type="number"
                  min={1}
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                />
              </div>
              {mode === 'add' && (
                <div>
                  <label htmlFor="form-reason" className="text-sm text-brand-text-secondary block mb-1">Motivo</label>
                  <select
                    id="form-reason"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                  >
                    <option value="manual_adjustment">Ajuste manual</option>
                    <option value="bonus">Bônus</option>
                    <option value="purchase">Compra</option>
                    <option value="refund">Reembolso</option>
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="form-description" className="text-sm text-brand-text-secondary block mb-1">Descrição</label>
                <input
                  id="form-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex.: Crédito promocional de boas-vindas"
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-medium hover:bg-brand-bg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:bg-brand-accent-hover disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Processando…' : mode === 'add' ? 'Adicionar' : 'Debitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'accent' | 'success' | 'error' | 'warning' }) {
  const toneClass = {
    accent: 'bg-brand-accent/10 text-brand-accent',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
  }[tone];

  return (
    <div className="rounded-2xl bg-brand-surface border border-brand-border p-6 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${toneClass}`} aria-hidden="true">{icon}</div>
      <div>
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="text-2xl font-bold font-mono tabular-nums">{value.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
}
