'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Download, Filter, AlertCircle, ArrowLeft } from 'lucide-react';

interface Transaction {
  id: string;
  team_id: string;
  created_by: string;
  platform: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  team?: { name: string };
  user?: { name: string; email: string };
}

const TYPES = ['all', 'purchase', 'usage', 'refund', 'manual_adjustment', 'bonus', 'expiration'];

const TYPE_LABELS: Record<string, string> = {
  all: 'Todos os tipos',
  purchase: 'Compra',
  usage: 'Uso',
  refund: 'Reembolso',
  manual_adjustment: 'Ajuste manual',
  bonus: 'Bônus',
  expiration: 'Expiração',
};

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

function formatPlatform(platform: string): string {
  return PLATFORM_LABELS[platform?.toLowerCase()] || (platform ? platform.toUpperCase() : '—');
}

function formatType(type: string): string {
  return TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function AdminCreditTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('');
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (teamId) p.set('team_id', teamId);
    if (userId) p.set('user_id', userId);
    if (type !== 'all') p.set('type', type);
    if (dateFrom) p.set('date_from', dateFrom);
    if (dateTo) p.set('date_to', dateTo);
    return p.toString();
  }, [teamId, userId, type, dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/credits/transactions?${buildParams()}`);
      if (!res.ok) throw new Error('Falha ao carregar transações.');
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar transações.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function exportCsv() {
    window.open(`/api/admin/credits/export?${buildParams()}`, '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-label="Carregando transações">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        <span className="sr-only">Carregando transações de créditos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-10 h-10 text-error" />
        <p className="text-brand-text-secondary text-center max-w-md">{error}</p>
        <button
          onClick={fetchData}
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
          <h1 className="text-3xl font-bold mb-2">Transações de Créditos</h1>
          <p className="text-brand-text-secondary">Histórico completo de movimentações com filtros avançados.</p>
        </div>
        <Link
          href="/admin/credits"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="filter-team" className="text-xs text-brand-text-secondary block mb-1">ID da equipe</label>
            <input
              id="filter-team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Ex.: uuid-da-equipe"
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="filter-user" className="text-xs text-brand-text-secondary block mb-1">ID do administrador</label>
            <input
              id="filter-user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ex.: uuid-do-admin"
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="filter-type" className="text-xs text-brand-text-secondary block mb-1">Tipo</label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
            >
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="w-full md:w-40">
            <label htmlFor="filter-date-from" className="text-xs text-brand-text-secondary block mb-1">Data inicial</label>
            <input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
            />
          </div>
          <div className="w-full md:w-40">
            <label htmlFor="filter-date-to" className="text-xs text-brand-text-secondary block mb-1">Data final</label>
            <input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
              aria-label="Aplicar filtros"
            >
              <Filter className="w-4 h-4" /> Filtrar
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition"
              aria-label="Exportar transações em CSV"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Transações de créditos filtradas por equipe, tipo e data</caption>
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Equipe</th>
                <th scope="col" className="px-6 py-4 font-medium">Administrador</th>
                <th scope="col" className="px-6 py-4 font-medium">Plataforma</th>
                <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                <th scope="col" className="px-6 py-4 font-medium">Tipo</th>
                <th scope="col" className="px-6 py-4 font-medium">Descrição</th>
                <th scope="col" className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-brand-elevated/50 transition">
                  <td className="px-6 py-4">{t.team?.name || t.team_id}</td>
                  <td className="px-6 py-4">{t.user ? `${t.user.name || '—'} <${t.user.email || '—'}>` : t.created_by}</td>
                  <td className="px-6 py-4">{formatPlatform(t.platform)}</td>
                  <td className={`px-6 py-4 font-mono font-medium tabular-nums ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">{formatType(t.type)}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={t.description || ''}>{t.description || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap tabular-nums">{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-brand-text-secondary">Nenhuma transação encontrada com os filtros selecionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
