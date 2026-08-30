'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  BarChart3,
  Activity,
  Calendar,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { TiltCard } from '@/components/TiltCard';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const EVENT_TYPES: Record<string, string> = {
  posts: 'Posts',
  api_calls: 'Chamadas de API',
  ai_caption: 'IA (legendas)',
  x_post_link: 'Posts X com link',
  upload_gb: 'Upload (GB)',
};

interface UsageEvent {
  id: string;
  type: string;
  platform?: string;
  units: number;
  cost: number;
  team?: { id: string; name: string };
  timestamp: string;
}

interface UsageData {
  plan?: string;
  credits?: number;
  posts?: { used: number; limit: number; remaining: number };
  comments?: { used: number; limit: number; remaining: number };
  uploads?: { used: number; limit: number; remaining: number };
  ai_caption?: { used: number; limit: number; remaining: number };
  events?: UsageEvent[];
  daily?: { date: string; count: number }[];
  breakdown?: Record<string, { units: number; cost: number }>;
  estimated_cost?: number;
}

type Period = 'current' | 'previous' | '3months';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'current', label: 'Mês atual' },
  { value: 'previous', label: 'Mês anterior' },
  { value: '3months', label: 'Últimos 3 meses' },
];

export default function UsageDashboardPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('current');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/billing/usage?period=${period}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar dados de uso.');
        return r.json();
      })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar os dados de uso.'))
      .finally(() => setLoading(false));
  }, [period]);

  const dailyData = useMemo(() => {
    if (data?.daily && data.daily.length > 0) return data.daily;
    // Generate last 30 days placeholder if no data
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().split('T')[0], count: 0 });
    }
    return days;
  }, [data]);

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  const breakdown = data?.breakdown || {};
  const events = data?.events || [];
  const recentEvents = events.slice(0, 50);
  const estimatedCost = data?.estimated_cost || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando dados de uso…</span>
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

  const hasData = events.length > 0 || Object.keys(breakdown).length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center">
          <Inbox className="w-8 h-8 text-brand-text-secondary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Nenhum evento de uso registrado</h2>
          <p className="text-brand-text-secondary text-sm max-w-md">
            Seu uso aparecerá aqui assim que você começar a publicar ou usar a API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filtro de período + estimativa */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-text-secondary" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text text-sm"
            aria-label="Filtrar por período"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <TiltCard className="w-full md:w-auto">
          <SpotlightCard
            className="p-4 flex items-center gap-4"
            spotlightColor="rgba(34, 197, 94, 0.15)"
          >
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-xs text-brand-text-secondary">Estimativa até o fim do mês</div>
              <div className="text-xl font-bold text-success">{currencyFormatter.format(estimatedCost)}</div>
            </div>
          </SpotlightCard>
        </TiltCard>
      </div>

      {/* Gráfico de uso por dia */}
      <TiltCard>
        <SpotlightCard
          className="p-6"
          spotlightColor="rgba(138, 180, 248, 0.15)"
        >
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-accent" /> Uso por dia (últimos 30 dias)
          </h2>
          <p className="text-sm text-brand-text-secondary mb-6">
            Volume de eventos de billing registrados por dia.
          </p>
          <div className="flex items-end gap-1 h-40" role="img" aria-label="Gráfico de barras: uso por dia nos últimos 30 dias">
            {dailyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-t bg-brand-accent/70 hover:bg-brand-accent transition-colors"
                  style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                  title={`${d.date}: ${d.count} eventos`}
                />
                {i % 5 === 0 && (
                  <span className="text-[9px] text-brand-text-secondary">
                    {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </SpotlightCard>
      </TiltCard>

      {/* Breakdown por tipo de evento */}
      <TiltCard>
        <SpotlightCard
          className="p-6"
          spotlightColor="rgba(96, 165, 250, 0.15)"
        >
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-info" /> Breakdown por tipo de evento
          </h2>
          <p className="text-sm text-brand-text-secondary mb-6">
            Consumo e custo por categoria de evento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(breakdown).length > 0 ? (
              Object.entries(breakdown).map(([type, info]) => (
                <div key={type} className="rounded-xl bg-brand-elevated/50 border border-brand-border p-4">
                  <div className="text-sm font-semibold mb-2">{EVENT_TYPES[type] || type}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-secondary">Unidades</span>
                    <span className="font-semibold">{info.units.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-brand-text-secondary">Custo</span>
                    <span className="font-semibold text-brand-accent">{currencyFormatter.format(info.cost)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-sm text-brand-text-secondary py-4">
                Nenhum breakdown disponível para este período.
              </div>
            )}
          </div>
        </SpotlightCard>
      </TiltCard>

      {/* Tabela de eventos recentes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Eventos recentes (últimas 50)</h2>
        <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">
                Tabela de eventos de billing recentes com tipo, plataforma, unidades, custo, equipe e timestamp
              </caption>
              <thead className="bg-brand-elevated text-brand-text-secondary">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Tipo</th>
                  <th scope="col" className="px-6 py-4 font-medium">Plataforma</th>
                  <th scope="col" className="px-6 py-4 font-medium">Unidades</th>
                  <th scope="col" className="px-6 py-4 font-medium">Custo</th>
                  <th scope="col" className="px-6 py-4 font-medium">Equipe</th>
                  <th scope="col" className="px-6 py-4 font-medium">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-brand-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium">{EVENT_TYPES[ev.type] || ev.type}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{ev.platform || '—'}</td>
                    <td className="px-6 py-4">{ev.units.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-brand-accent">{currencyFormatter.format(ev.cost)}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{ev.team?.name || '—'}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {ev.timestamp ? dateTimeFormatter.format(new Date(ev.timestamp)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {recentEvents.length === 0 && (
          <div className="text-center text-sm text-brand-text-secondary mt-4">
            Nenhum evento encontrado para este período.
          </div>
        )}
      </div>
    </div>
  );
}
