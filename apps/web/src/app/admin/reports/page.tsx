'use client';

import { useEffect, useState } from 'react';
import { Loader2, Bug, AlertCircle, CheckCircle2, CircleDot, Filter } from 'lucide-react';

interface Report {
  id: string;
  email: string | null;
  category: string;
  message: string;
  page_url: string | null;
  status: 'open' | 'triaged' | 'resolved';
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = { open: 'Aberto', triaged: 'Em análise', resolved: 'Resolvido' };
const STATUS_STYLE: Record<string, string> = {
  open: 'bg-error/10 text-error border-error/30',
  triaged: 'bg-warning/10 text-warning border-warning/30',
  resolved: 'bg-success/10 text-success border-success/30',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/reports${filter ? `?status=${filter}` : ''}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Falha ao carregar reports.');
        return r.json();
      })
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as Report['status'] } : r)));
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
          <Bug className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-brand-text-secondary">Bugs, erros e sugestões enviados pelos usuários.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-brand-text-secondary" />
        {['', 'open', 'triaged', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
              filter === s ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/40' : 'border-brand-border text-brand-text-secondary hover:bg-brand-elevated'
            }`}
          >
            {s === '' ? 'Todos' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-accent" /></div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-6 rounded-2xl bg-brand-elevated text-brand-text-secondary text-center">Nenhum report{filter ? ` com status "${STATUS_LABEL[filter]}"` : ''} no momento.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-elevated border border-brand-border capitalize">{r.category}</span>
                <span className="text-xs text-brand-text-secondary">{r.email || 'anônimo'}</span>
                <span className="text-xs text-brand-text-secondary ml-auto">{new Date(r.created_at).toLocaleString('pt-BR')}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-3">{r.message}</p>
              {r.page_url && <p className="text-xs font-mono text-brand-text-secondary mb-3 break-all">{r.page_url}</p>}
              <div className="flex gap-2">
                {r.status !== 'triaged' && (
                  <button onClick={() => setStatus(r.id, 'triaged')} className="px-3 py-1.5 rounded-lg text-xs border border-warning/40 text-warning hover:bg-warning/10 transition flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5" /> Em análise
                  </button>
                )}
                {r.status !== 'resolved' && (
                  <button onClick={() => setStatus(r.id, 'resolved')} className="px-3 py-1.5 rounded-lg text-xs border border-success/40 text-success hover:bg-success/10 transition flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
                  </button>
                )}
                {r.status === 'resolved' && (
                  <button onClick={() => setStatus(r.id, 'open')} className="px-3 py-1.5 rounded-lg text-xs border border-brand-border text-brand-text-secondary hover:bg-brand-elevated transition">
                    Reabrir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
