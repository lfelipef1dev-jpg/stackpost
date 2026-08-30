'use client';

import { Fragment, useEffect, useState } from 'react';
import { Search, Loader2, Download, Filter, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLog {
  id: string;
  user: { id: string; name: string; email: string } | null;
  action: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/audit').then((r) => r.json()),
      fetch('/api/admin/audit/stats').then((r) => r.json()),
    ]).then(([l, s]) => { setLogs(l); setStats(s); setLoading(false); });
  }, []);

  async function refresh() {
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (resourceFilter) params.set('resource', resourceFilter);
    const l = await fetch(`/api/admin/audit?${params.toString()}`).then((r) => r.json());
    setLogs(l);
  }

  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(query.toLowerCase()) ||
    l.resource.toLowerCase().includes(query.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(query.toLowerCase())
  );

  function exportCsv() {
    window.open('/api/admin/audit/export', '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Logs de Auditoria</h1>
      <p className="text-brand-text-secondary mb-8">Rastreamento completo de ações realizadas na plataforma.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary">Total de eventos</div>
          <div className="text-2xl font-bold">{stats?.total || logs.length}</div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-between">
          <div>
            <div className="text-sm text-brand-text-secondary">Últimas 24h</div>
            <div className="text-2xl font-bold">
              {logs.filter((l) => new Date(l.created_at) > new Date(Date.now() - 86400000)).length}
            </div>
          </div>
          <Shield className="w-8 h-8 text-brand-accent" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por ação, módulo ou e-mail..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" />
          <input value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} placeholder="Ação" className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
          <input value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} placeholder="Módulo" className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
          <button onClick={refresh} className="px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium text-sm transition-colors">Filtrar</button>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition-colors">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Usuário</th>
              <th className="px-6 py-4 font-medium">Ação</th>
              <th className="px-6 py-4 font-medium">Módulo</th>
              <th className="px-6 py-4 font-medium">IP</th>
              <th className="px-6 py-4 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map((l) => (
              <Fragment key={l.id}>
                <tr className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4">{l.user?.name || l.user?.email || l.user?.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-medium text-brand-accent">{l.action}</td>
                  <td className="px-6 py-4">{l.resource}</td>
                  <td className="px-6 py-4">{l.ip_address || '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent text-xs transition-colors">
                      <Eye className="w-3 h-3" />
                      {expanded === l.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Detalhes
                    </button>
                  </td>
                </tr>
                {expanded === l.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-brand-elevated/50">
                      <pre className="text-xs overflow-auto p-4 rounded-xl bg-brand-bg border border-brand-border">{JSON.stringify({ resource_id: l.resource_id, metadata: l.metadata }, null, 2)}</pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-brand-text-secondary">Nenhum evento de auditoria encontrado para os filtros aplicados.</div>
        )}
      </div>
      <div className="mt-4 text-sm text-brand-text-secondary">{filtered.length} evento(s) encontrado(s)</div>
    </div>
  );
}
