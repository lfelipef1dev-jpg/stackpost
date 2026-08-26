'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Clock, CheckCircle2, FileEdit, Loader2 } from 'lucide-react';

interface AnalyticsData {
  summary: {
    total: number;
    posted: number;
    errors: number;
    scheduled: number;
    drafts: number;
    processing: number;
    successRate: number;
  };
  byPlatform: Record<string, number>;
  byDay: { date: string; count: number }[];
  metrics: any[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  const s = data?.summary || { total: 0, posted: 0, errors: 0, scheduled: 0, drafts: 0, processing: 0, successRate: 0 };
  const maxDay = Math.max(...(data?.byDay?.map((d) => d.count) || [1]), 1);

  const cards = [
    { label: 'Total de posts', value: s.total, icon: BarChart3, color: 'text-brand-accent' },
    { label: 'Publicados', value: s.posted, icon: CheckCircle2, color: 'text-success' },
    { label: 'Agendados', value: s.scheduled, icon: Clock, color: 'text-warning' },
    { label: 'Rascunhos', value: s.drafts, icon: FileEdit, color: 'text-brand-text-secondary' },
    { label: 'Em processamento', value: s.processing, icon: Loader2, color: 'text-info' },
    { label: 'Com erro', value: s.errors, icon: AlertCircle, color: 'text-error' },
    { label: 'Taxa de sucesso', value: `${s.successRate}%`, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/analytics" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
              <c.icon className={`w-5 h-5 mb-2 ${c.color}`} />
              <div className="text-2xl font-mono font-bold">{c.value}</div>
              <div className="text-xs text-brand-text-secondary mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Publicacoes nos ultimos 30 dias</h2>
            <div className="h-48 flex items-end gap-1">
              {data?.byDay?.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                  <div
                    className="w-full rounded-t bg-brand-accent/70 hover:bg-brand-accent transition"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-brand-elevated text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {d.date}: {d.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-brand-text-secondary mt-2">
              <span>30 dias atras</span>
              <span>Hoje</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Posts por plataforma</h2>
            <div className="space-y-3">
              {Object.entries(data?.byPlatform || {}).length === 0 && (
                <div className="text-brand-text-secondary text-sm">Nenhum post ainda.</div>
              )}
              {Object.entries(data?.byPlatform || {}).sort((a, b) => b[1] - a[1]).map(([plat, count]) => {
                const max = Math.max(...Object.values(data?.byPlatform || {}), 1);
                return (
                  <div key={plat} className="flex items-center gap-3">
                    <div className="w-24 text-sm capitalize">{plat}</div>
                    <div className="flex-1 h-6 rounded-full bg-brand-elevated overflow-hidden">
                      <div
                        className="h-full bg-brand-accent rounded-full transition-all"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm font-mono">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <h2 className="text-lg font-semibold mb-4">Metricas por plataforma</h2>
          {data?.metrics?.length === 0 && (
            <div className="text-brand-text-secondary text-sm">Sem metricas ainda. As metricas aparecem apos a publicacao.</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-2 px-3 text-brand-text-secondary font-medium">Plataforma</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Impressoes</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Views</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Curtidas</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Comentarios</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Compart.</th>
                  <th className="text-right py-2 px-3 text-brand-text-secondary font-medium">Salvos</th>
                </tr>
              </thead>
              <tbody>
                {data?.metrics?.map((m: any) => (
                  <tr key={m.platform} className="border-b border-brand-border/50">
                    <td className="py-2 px-3 capitalize font-medium">{m.platform}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.impressions).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.views).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.likes).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.comments).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.shares).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 font-mono">{Number(m.saves).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
