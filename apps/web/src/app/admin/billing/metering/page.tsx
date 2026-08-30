'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Activity,
  Filter,
  BarChart3,
  Inbox,
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { TiltCard } from '@/components/TiltCard';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
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

const PLATFORMS = [
  'all',
  'instagram',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'twitter',
  'pinterest',
  'reddit',
  'threads',
  'bluesky',
  'discord',
  'slack',
  'google',
  'snapchat',
  'mastodon',
];

interface MeteringEvent {
  id: string;
  type: string;
  platform?: string;
  units: number;
  cost: number;
  team?: { id: string; name: string };
  organization?: { id: string; name: string };
  timestamp: string;
}

interface MeteringResponse {
  events?: MeteringEvent[];
  daily?: { date: string; count: number }[];
}

export default function AdminMeteringPage() {
  const router = useRouter();
  const [data, setData] = useState<MeteringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (platformFilter !== 'all') params.set('platform', platformFilter);
    if (teamFilter) params.set('team', teamFilter);
    fetch(`/api/admin/billing/metering?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar eventos de billing.');
        return r.json();
      })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar os eventos de billing.'))
      .finally(() => setLoading(false));
  }, [typeFilter, platformFilter, teamFilter]);

  const events = data?.events || [];
  const daily = data?.daily || [];

  const dailyData = useMemo(() => {
    if (daily.length > 0) return daily;
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().split('T')[0], count: 0 });
    }
    return days;
  }, [daily]);

  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando eventos de billing…</span>
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

  if (events.length === 0 && daily.length === 0) {
    return (
      <div>
        <nav className="flex items-center gap-4 mb-2" aria-label="Navegação">
          <button
            onClick={() => router.push('/admin/billing')}
            className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors"
          >
            &larr; Voltar para Cobrança
          </button>
        </nav>
        <h1 className="text-3xl font-bold mb-2">Metering</h1>
        <p className="text-brand-text-secondary mb-8">
          Eventos de billing em tempo real (billing_events).
        </p>
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center">
            <Inbox className="w-8 h-8 text-brand-text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Nenhum evento de billing registrado</h2>
            <p className="text-brand-text-secondary text-sm max-w-md">
              Os eventos de metering aparecerão aqui assim que houver atividade de billing na plataforma.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-4 mb-2" aria-label="Navegação">
        <button
          onClick={() => router.push('/admin/billing')}
          className="text-sm text-brand-text-secondary hover:text-brand-text transition-colors"
        >
          &larr; Voltar para Cobrança
        </button>
      </nav>
      <h1 className="text-3xl font-bold mb-2">Metering</h1>
      <p className="text-brand-text-secondary mb-8">
        Eventos de billing em tempo real (billing_events).
      </p>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-end gap-4 mb-6 p-4 rounded-2xl bg-brand-surface border border-brand-border">
        <div className="flex-1">
          <label className="block text-xs text-brand-text-secondary mb-1.5">Tipo de evento</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm"
            aria-label="Filtrar por tipo de evento"
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(EVENT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-brand-text-secondary mb-1.5">Plataforma</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm"
            aria-label="Filtrar por plataforma"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'Todas as plataformas' : p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-brand-text-secondary mb-1.5">Equipe</label>
          <input
            type="text"
            placeholder="Nome ou ID da equipe…"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm"
            aria-label="Filtrar por equipe"
          />
        </div>
      </div>

      {/* Gráfico de volume de eventos por dia */}
      <TiltCard className="mb-8">
        <SpotlightCard className="p-6" spotlightColor="rgba(138, 180, 248, 0.15)">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-accent" /> Volume de eventos por dia (30 dias)
          </h2>
          <p className="text-sm text-brand-text-secondary mb-6">
            Quantidade de eventos de billing registrados por dia.
          </p>
          <div className="flex items-end gap-1 h-40" role="img" aria-label="Gráfico de volume de eventos por dia">
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

      {/* Tabela de eventos recentes */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-info" /> Eventos recentes
        </h2>
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
                  <th scope="col" className="px-6 py-4 font-medium">Organização</th>
                  <th scope="col" className="px-6 py-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {events.slice(0, 100).map((ev) => (
                  <tr key={ev.id} className="hover:bg-brand-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium">{EVENT_TYPES[ev.type] || ev.type}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {ev.platform ? ev.platform.charAt(0).toUpperCase() + ev.platform.slice(1) : '—'}
                    </td>
                    <td className="px-6 py-4">{ev.units.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-brand-accent">{currencyFormatter.format(ev.cost)}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{ev.team?.name || '—'}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{ev.organization?.name || '—'}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {ev.timestamp ? dateTimeFormatter.format(new Date(ev.timestamp)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {events.length === 0 && (
          <div className="text-center text-sm text-brand-text-secondary mt-4">
            Nenhum evento encontrado para os filtros aplicados.
          </div>
        )}
        {events.length > 0 && (
          <div className="mt-4 text-sm text-brand-text-secondary">
            {events.length} evento(s) encontrado(s)
          </div>
        )}
      </div>
    </div>
  );
}
