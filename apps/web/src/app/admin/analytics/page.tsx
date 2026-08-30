'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileText, Users, Building2, AlertCircle, Calendar, type LucideIcon } from 'lucide-react';

interface Stats {
  total_posts: number; posts_today: number; posts_error: number; scheduled_today: number;
  total_accounts: number; total_organizations: number; total_users: number;
  posts_by_day: Record<string, number>;
}

function Kpi({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-brand-accent" aria-hidden="true" />
      </div>
      <div>
        <div className="text-2xl font-bold text-brand-text">{value}</div>
        <div className="text-sm text-brand-text-secondary">{label}</div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha na requisição');
        return r.json();
      })
      .then(setStats)
      .catch(() => setError('Não foi possível carregar as métricas no momento. Tente novamente em instantes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando métricas…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl bg-error/10 border border-error/30 text-error flex items-center gap-3"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  const rawByDay = stats?.posts_by_day || {};
  const days = Object.keys(rawByDay).slice(0, 14).sort();
  const maxValue = days.length ? Math.max(...Object.values(rawByDay)) : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-brand-text">Métricas</h1>
      <p className="text-brand-text-secondary mb-8">Indicadores de desempenho e adoção do StackPost.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Kpi icon={FileText} label="Total de publicações" value={stats?.total_posts || 0} />
        <Kpi icon={Calendar} label="Publicadas hoje" value={stats?.posts_today || 0} />
        <Kpi icon={AlertCircle} label="Publicações com erro" value={stats?.posts_error || 0} />
        <Kpi icon={Calendar} label="Agendadas hoje" value={stats?.scheduled_today || 0} />
        <Kpi icon={Users} label="Usuários" value={stats?.total_users || 0} />
        <Kpi icon={Building2} label="Organizações" value={stats?.total_organizations || 0} />
      </div>

      <div
        className="p-6 rounded-2xl bg-brand-surface border border-brand-border mb-8"
        role="img"
        aria-label="Gráfico de publicações por dia nos últimos 14 dias"
      >
        <h2 className="text-lg font-bold mb-4 text-brand-text">Publicações por dia (últimos 14 dias)</h2>
        {days.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-brand-text-secondary">
            Sem dados suficientes para exibir o período.
          </div>
        ) : (
          <div className="h-40 flex items-end gap-2">
            {days.map((d) => {
              const count = rawByDay[d];
              const height = maxValue > 0 ? Math.min((count / maxValue) * 100, 100) : 0;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <div
                    className="w-full bg-brand-accent rounded-t-xl transition-all"
                    style={{ height: `${height}%` }}
                    title={`${d}: ${count} publicação${count === 1 ? '' : 'ões'}`}
                  />
                  <div className="text-xs text-brand-text-secondary truncate w-full text-center">{d.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
