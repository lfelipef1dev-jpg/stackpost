'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileEdit,
  Loader2,
  Download,
  Sparkles,
  Target,
  Trophy,
  CalendarDays,
  FileText,
  Flame,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowRight,
  Zap,
} from 'lucide-react';

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
  metrics: {
    platform: string;
    impressions: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }[];
}

function platformName(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.name || id;
}

function platformColor(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.color || '#8AB4F8';
}

/* ------------------------------------------------------------------ */
/* SpotlightCard                                                       */
/* ------------------------------------------------------------------ */
function SpotlightCard({
  children,
  className = '',
  glow = '#8AB4F8',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
      }}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
      style={{
        backgroundImage: spot.active
          ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 0.3s',
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard                                                            */
/* ------------------------------------------------------------------ */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
          transition: 'transform 0.15s ease-out',
        });
      }}
      onMouseLeave={() =>
        setStyle({
          transform: 'perspective(1200px) rotateX(0) rotateY(0)',
          transition: 'transform 0.4s ease-out',
        })
      }
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */
function Sparkline({ data, color = '#8AB4F8' }: { data: number[]; color?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${30 - (v / max) * 25}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */
function Donut({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  let offset = 0;
  const circumference = 2 * Math.PI * 40;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        {segments.map((s, i) => {
          const pct = total > 0 ? s.value / total : 0;
          const dash = pct * circumference;
          const circle = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="text-brand-text-secondary">{s.label}</span>
            <span className="font-medium">
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CSV Export                                                          */
/* ------------------------------------------------------------------ */
function exportCSV(data: AnalyticsData | null) {
  const rows = ['Métrica,Valor'];
  const s = data?.summary || { total: 0, posted: 0, errors: 0, scheduled: 0, drafts: 0, processing: 0, successRate: 0 };
  rows.push(`Total de posts,${s.total || 0}`);
  rows.push(`Publicados,${s.posted || 0}`);
  rows.push(`Agendados,${s.scheduled || 0}`);
  rows.push(`Rascunhos,${s.drafts || 0}`);
  rows.push(`Processando,${s.processing || 0}`);
  rows.push(`Erros,${s.errors || 0}`);
  rows.push(`Taxa de sucesso,${s.successRate || 0}%`);
  const totals = (data?.metrics || []).reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      views: acc.views + (m.views || 0),
      likes: acc.likes + (m.likes || 0),
      comments: acc.comments + (m.comments || 0),
      shares: acc.shares + (m.shares || 0),
      saves: acc.saves + (m.saves || 0),
    }),
    { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
  );
  rows.push(`Impressões,${totals.impressions}`);
  rows.push(`Views,${totals.views}`);
  rows.push(`Curtidas,${totals.likes}`);
  rows.push(`Comentários,${totals.comments}`);
  rows.push(`Compartilhamentos,${totals.shares}`);
  rows.push(`Salvos,${totals.saves}`);
  rows.push('');
  rows.push('Plataforma,Posts,Impressões,Views,Curtidas,Comentários,Compart.,Salvos');
  for (const m of data?.metrics || []) {
    rows.push(
      `${platformName(m.platform)},${data?.byPlatform?.[m.platform] || 0},${m.impressions || 0},${m.views || 0},${m.likes || 0},${m.comments || 0},${m.shares || 0},${m.saves || 0}`
    );
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `stackpost-analytics-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const s = data?.summary || {
    total: 0,
    posted: 0,
    errors: 0,
    scheduled: 0,
    drafts: 0,
    processing: 0,
    successRate: 0,
  };

  const byDay = data?.byDay || [];
  const byPlatform = data?.byPlatform || {};
  const metrics = data?.metrics || [];
  const isEmpty = s.total === 0;

  /* ---- Derived values ---- */
  const maxDay = Math.max(...byDay.map((d) => d.count), 1);
  const maxPlatform = Math.max(...Object.values(byPlatform), 1);

  const totals = useMemo(() => {
    return metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + (m.impressions || 0),
        views: acc.views + (m.views || 0),
        likes: acc.likes + (m.likes || 0),
        comments: acc.comments + (m.comments || 0),
        shares: acc.shares + (m.shares || 0),
        saves: acc.saves + (m.saves || 0),
      }),
      { impressions: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    );
  }, [metrics]);

  const totalEngagement = totals.likes + totals.comments + totals.shares + totals.saves;
  const engagementRate =
    totals.impressions > 0 ? (totalEngagement / totals.impressions) * 100 : 0;

  const bestDay = useMemo(() => {
    if (byDay.length === 0) return null;
    return byDay.reduce((best, d) => (d.count > best.count ? d : best), byDay[0]);
  }, [byDay]);

  const topPlatform = useMemo(() => {
    const entries = Object.entries(byPlatform);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [byPlatform]);

  const monthGoal = 30;
  const monthProgress = Math.min((s.posted / monthGoal) * 100, 100);

  const sparkData = byDay.slice(-7).map((d) => d.count);

  /* ---- KPI cards ---- */
  const kpiCards = [
    {
      label: 'Publicações',
      value: s.total,
      icon: BarChart3,
      color: '#8AB4F8',
      delta: s.total > 0 ? '+100%' : '0%',
      deltaUp: s.total > 0,
    },
    {
      label: 'Publicados',
      value: s.posted,
      icon: CheckCircle2,
      color: '#34D399',
      delta: s.successRate > 50 ? `${s.successRate}%` : `${s.successRate}%`,
      deltaUp: s.successRate >= 50,
    },
    {
      label: 'Agendados',
      value: s.scheduled,
      icon: Clock,
      color: '#FBBF24',
      delta: s.scheduled > 0 ? 'ativo' : '0',
      deltaUp: s.scheduled > 0,
    },
    {
      label: 'Impressões',
      value: totals.impressions,
      icon: Eye,
      color: '#60A5FA',
      delta: totals.impressions > 0 ? '+' : '0',
      deltaUp: totals.impressions > 0,
    },
    {
      label: 'Engajamento',
      value: totalEngagement,
      icon: Heart,
      color: '#F472B6',
      delta: totalEngagement > 0 ? '+' : '0',
      deltaUp: totalEngagement > 0,
    },
    {
      label: 'Taxa de engajamento',
      value: engagementRate.toFixed(1) + '%',
      icon: TrendingUp,
      color: '#A78BFA',
      delta: engagementRate >= 3 ? 'acima' : 'abaixo',
      deltaUp: engagementRate >= 3,
    },
  ];

  /* ---- Insight cards ---- */
  const insights = [
    {
      label: 'Taxa de sucesso',
      value: `${s.successRate}%`,
      detail:
        s.successRate >= 80
          ? 'Acima da média. Suas publicações estão saindo sem problemas.'
          : s.successRate >= 50
            ? 'Na média. Algumas publicações falham — revise suas contas.'
            : 'Abaixo da média. Verifique tokens e permissões das contas.',
      color: s.successRate >= 80 ? '#34D399' : s.successRate >= 50 ? '#FBBF24' : '#F87171',
      icon: s.successRate >= 50 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Taxa de engajamento',
      value: `${engagementRate.toFixed(1)}%`,
      detail:
        engagementRate >= 3
          ? 'Acima do benchmark de 3%. Seu conteúdo está engajando bem.'
          : engagementRate >= 1
            ? 'Próximo do benchmark. Teste títulos e horários diferentes.'
            : 'Abaixo do benchmark de 3%. Foco em conteúdo que gera conversa.',
      color: engagementRate >= 3 ? '#34D399' : engagementRate >= 1 ? '#FBBF24' : '#F87171',
      icon: engagementRate >= 3 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Plataforma com mais posts',
      value: topPlatform ? platformName(topPlatform[0]) : '—',
      detail: topPlatform
        ? `${topPlatform[1]} publicações nesta plataforma.`
        : 'Nenhuma publicação ainda. Conecte uma conta para começar.',
      color: topPlatform ? platformColor(topPlatform[0]) : '#8AB4F8',
      icon: Trophy,
    },
    {
      label: 'Publicações agendadas',
      value: s.scheduled,
      detail:
        s.scheduled > 0
          ? `${s.scheduled} posts na fila, prontos para sair automaticamente.`
          : 'Nada agendado. Crie um cronograma para manter consistência.',
      color: s.scheduled > 0 ? '#FBBF24' : '#8AB4F8',
      icon: CalendarDays,
    },
  ];

  /* ---- Status cards ---- */
  const statusCards = [
    { label: 'Publicados', value: s.posted, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Agendados', value: s.scheduled, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Rascunhos', value: s.drafts, icon: FileEdit, color: 'text-brand-text-secondary', bg: 'bg-brand-elevated' },
    { label: 'Processando', value: s.processing, icon: Loader2, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Erros', value: s.errors, icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Taxa sucesso', value: `${s.successRate}%`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  ];

  /* ---- Donut segments ---- */
  const donutSegments = [
    { label: 'Curtidas', value: totals.likes, color: '#34D399' },
    { label: 'Comentários', value: totals.comments, color: '#60A5FA' },
    { label: 'Compart.', value: totals.shares, color: '#FBBF24' },
    { label: 'Salvos', value: totals.saves, color: '#8AB4F8' },
  ];

  /* ---- Pro features ---- */
  const proFeatures = [
    { icon: CalendarDays, text: 'Histórico de até 90 dias com comparativos' },
    { icon: FileText, text: 'Relatórios em PDF prontos para apresentar' },
    { icon: Flame, text: 'Heatmap dos melhores horários para postar' },
    { icon: Users, text: 'Benchmark vs concorrentes do seu nicho' },
    { icon: Download, text: 'Exportação white-label com sua marca' },
  ];

  const fmt = (n: number) => Number(n || 0).toLocaleString('pt-BR');

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/analytics" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ============================================================ */}
        {/* 1. Header comercial                                          */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-text">Painel de resultados</h1>
                <p className="text-sm text-brand-text-secondary mt-1 max-w-xl">
                  Tudo o que sua marca gerou nas redes, em um só lugar. Veja o retorno do seu
                  tempo e descubra o que funciona.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 p-1 rounded-full bg-brand-surface border border-brand-border">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                      period === p
                        ? 'bg-brand-accent text-white'
                        : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => exportCSV(data)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-sm font-medium text-brand-text hover:border-brand-accent/50 transition"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. Banner de empty data                                      */}
        {/* ============================================================ */}
        {isEmpty && (
          <SpotlightCard className="mb-8 p-5" glow="#FBBF24">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-brand-text">
                  Sem dados ainda. Publique seu primeiro conteúdo e em 24 horas começaremos a
                  montar seu painel.
                </p>
              </div>
              <a
                href="/composer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition"
              >
                Criar primeira publicação
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </SpotlightCard>
        )}

        {/* ============================================================ */}
        {/* 3. Insights acionaveis                                       */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {insights.map((ins, i) => (
            <TiltCard key={i}>
              <SpotlightCard className="p-5 h-full" glow={ins.color}>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ins.color}15`, border: `1px solid ${ins.color}30` }}
                  >
                    <ins.icon className="w-4 h-4" style={{ color: ins.color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-brand-text mb-1">
                  {ins.value}
                </div>
                <div className="text-xs font-medium text-brand-text-secondary mb-2">
                  {ins.label}
                </div>
                <p className="text-xs text-brand-text-secondary leading-relaxed">{ins.detail}</p>
              </SpotlightCard>
            </TiltCard>
          ))}
        </div>

        {/* ============================================================ */}
        {/* 4. KPI cards com sparkline                                   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpiCards.map((kpi, i) => (
            <TiltCard key={i}>
              <SpotlightCard className="p-5 h-full" glow={kpi.color}>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
                  >
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      kpi.deltaUp
                        ? 'bg-success/10 text-success'
                        : 'bg-brand-elevated text-brand-text-secondary'
                    }`}
                  >
                    {kpi.deltaUp ? '+' : ''}
                    {kpi.delta}
                  </span>
                </div>
                <div className="text-3xl font-bold font-mono text-brand-text mb-2">
                  {typeof kpi.value === 'number' ? fmt(kpi.value) : kpi.value}
                </div>
                <div className="text-xs text-brand-text-secondary mb-3">{kpi.label}</div>
                <Sparkline data={sparkData} color={kpi.color} />
              </SpotlightCard>
            </TiltCard>
          ))}
        </div>

        {/* ============================================================ */}
        {/* 5. Gráfico de área + 6. Melhor dia / Meta do mês             */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de área */}
          <SpotlightCard className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-brand-text">
                  Publicações no período
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Volume diário de publicações
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                <div className="w-3 h-3 rounded bg-brand-accent" />
                <span>Posts</span>
              </div>
            </div>

            {byDay.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-brand-text-secondary/30 mx-auto mb-2" />
                  <p className="text-sm text-brand-text-secondary">
                    Sem dados de período ainda
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-end gap-1">
                {byDay.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end group relative"
                    style={{ minWidth: '4px' }}
                  >
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(d.count / maxDay) * 100}%`,
                        minHeight: d.count > 0 ? '4px' : '0',
                        background:
                          d.count > 0
                            ? 'linear-gradient(to top, rgba(138,180,248,0.3), rgba(138,180,248,0.9))'
                            : 'transparent',
                      }}
                    />
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-brand-elevated text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-brand-border z-10">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                      : {d.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-xs text-brand-text-secondary mt-3">
              <span>{period === '7d' ? '7 dias' : period === '90d' ? '90 dias' : '30 dias'} atrás</span>
              <span>Hoje</span>
            </div>
          </SpotlightCard>

          {/* Melhor dia + Meta do mês */}
          <div className="flex flex-col gap-6">
            <SpotlightCard className="p-6 flex-1" glow="#FBBF24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-warning" />
                </div>
                <h3 className="text-sm font-semibold text-brand-text">Melhor dia</h3>
              </div>
              {bestDay ? (
                <>
                  <div className="text-3xl font-bold font-mono text-brand-text">
                    {bestDay.count}
                  </div>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    publicações em{' '}
                    {new Date(bestDay.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-brand-text-secondary">
                  Sem dados suficientes para calcular o melhor dia.
                </p>
              )}
            </SpotlightCard>

            <SpotlightCard className="p-6 flex-1" glow="#34D399">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-success" />
                </div>
                <h3 className="text-sm font-semibold text-brand-text">Meta do mês</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold font-mono text-brand-text">{s.posted}</span>
                <span className="text-sm text-brand-text-secondary">/ {monthGoal} posts</span>
              </div>
              <div className="h-2 rounded-full bg-brand-elevated overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
              <p className="text-xs text-brand-text-secondary">
                {monthProgress >= 100
                  ? 'Meta atingida. Continue assim.'
                  : `${(monthGoal - s.posted).toLocaleString('pt-BR')} posts para atingir a meta.`}
              </p>
            </SpotlightCard>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. Posts por plataforma + 8. Donut de engajamento            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Posts por plataforma */}
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-semibold text-brand-text mb-1">Posts por plataforma</h2>
            <p className="text-xs text-brand-text-secondary mb-5">
              Distribuição das publicações por rede social
            </p>

            {Object.keys(byPlatform).length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-sm text-brand-text-secondary">
                  Nenhum post publicado ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(byPlatform)
                  .sort((a, b) => b[1] - a[1])
                  .map(([plat, count]) => (
                    <div key={plat} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-28 flex-shrink-0">
                        <PlatformIcon id={plat} size={18} color={platformColor(plat)} />
                        <span className="text-xs font-medium text-brand-text truncate">
                          {platformName(plat)}
                        </span>
                      </div>
                      <div className="flex-1 h-6 rounded-full bg-brand-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${(count / maxPlatform) * 100}%`,
                            background: platformColor(plat),
                            minWidth: count > 0 ? '24px' : '0',
                          }}
                        />
                      </div>
                      <div className="w-10 text-right text-sm font-mono text-brand-text">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </SpotlightCard>

          {/* Donut de engajamento */}
          <SpotlightCard className="p-6" glow="#F472B6">
            <h2 className="text-lg font-semibold text-brand-text mb-1">Engajamento</h2>
            <p className="text-xs text-brand-text-secondary mb-5">
              Composição das interações recebidas
            </p>

            {totalEngagement === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-10 h-10 text-brand-text-secondary/30 mx-auto mb-2" />
                  <p className="text-sm text-brand-text-secondary">
                    Sem dados de engajamento ainda
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <Donut segments={donutSegments} total={totalEngagement} />
                <div className="mt-5 pt-4 border-t border-brand-border/50 grid grid-cols-2 gap-3">
                  {donutSegments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: seg.color }}
                      />
                      <span className="text-xs text-brand-text-secondary">{seg.label}</span>
                      <span className="text-xs font-mono font-medium text-brand-text ml-auto">
                        {fmt(seg.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* ============================================================ */}
        {/* 9. Tabela de métricas por plataforma                         */}
        {/* ============================================================ */}
        <SpotlightCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-brand-text mb-1">Métricas por plataforma</h2>
          <p className="text-xs text-brand-text-secondary mb-5">
            Desempenho detalhado de cada rede social
          </p>

          {metrics.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-brand-text-secondary/30 mx-auto mb-2" />
                <p className="text-sm text-brand-text-secondary">
                  Sem métricas ainda. As métricas aparecem após a publicação.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Plataforma
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Posts
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Impressões
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Views
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Curtidas
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Comentários
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Compart.
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Salvos
                    </th>
                    <th className="text-right py-3 px-3 text-brand-text-secondary font-medium text-xs">
                      Taxa engaj.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const eng =
                      (m.likes || 0) +
                      (m.comments || 0) +
                      (m.shares || 0) +
                      (m.saves || 0);
                    const rate = m.impressions > 0 ? (eng / m.impressions) * 100 : 0;
                    const rateColor =
                      rate >= 3 ? 'text-success' : rate >= 1 ? 'text-warning' : 'text-error';
                    return (
                      <tr
                        key={m.platform}
                        className="border-b border-brand-border/40 hover:bg-brand-elevated/30 transition"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <PlatformIcon
                              id={m.platform}
                              size={18}
                              color={platformColor(m.platform)}
                            />
                            <span className="font-medium text-brand-text">
                              {platformName(m.platform)}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {byPlatform[m.platform] || 0}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.impressions)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.views)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.likes)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.comments)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.shares)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-brand-text">
                          {fmt(m.saves)}
                        </td>
                        <td className={`text-right py-3 px-3 font-mono font-medium ${rateColor}`}>
                          {rate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SpotlightCard>

        {/* ============================================================ */}
        {/* 10. Status das publicações                                   */}
        {/* ============================================================ */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Status das publicações</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statusCards.map((c, i) => (
              <SpotlightCard key={i} className="p-4">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="text-2xl font-bold font-mono text-brand-text">{c.value}</div>
                <div className="text-xs text-brand-text-secondary mt-1">{c.label}</div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 11. Upsell comercial                                         */}
        {/* ============================================================ */}
        <SpotlightCard className="p-8 mb-8" glow="#A78BFA">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-text">
                    Desbloqueie análises avançadas
                  </h2>
                  <p className="text-xs text-brand-text-secondary">
                    StackPost Pro — para quem leva dados a sério
                  </p>
                </div>
              </div>
              <p className="text-sm text-brand-text-secondary mb-5 max-w-lg">
                Veja além do básico. Compare períodos, entenda seus melhores horários e gere
                relatórios prontos para sua equipe ou clientes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 text-brand-accent" />
                    </div>
                    <span className="text-sm text-brand-text">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:w-56 flex-shrink-0">
              <div className="text-center lg:text-right">
                <span className="text-3xl font-bold text-brand-text">R$ 49</span>
                <span className="text-sm text-brand-text-secondary">/mês</span>
              </div>
              <a
                href="/billing"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent/90 transition"
              >
                Fazer upgrade para Pro
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-brand-text-secondary text-center lg:text-right">
                Cancele quando quiser. Sem fidelidade.
              </p>
            </div>
          </div>
        </SpotlightCard>
      </main>

      {/* ============================================================ */}
      {/* 12. Footer                                                    */}
      {/* ============================================================ */}
      <Footer />
    </div>
  );
}
