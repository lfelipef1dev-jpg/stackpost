'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  CreditCard,
  Calendar,
  Zap,
  TrendingUp,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { TiltCard } from '@/components/TiltCard';
import { UsageBar } from '@/components/UsageBar';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

interface UsageData {
  plan?: string;
  credits?: number;
  posts?: { used: number; limit: number; remaining: number };
  comments?: { used: number; limit: number; remaining: number };
  uploads?: { used: number; limit: number; remaining: number };
  ai_caption?: { used: number; limit: number; remaining: number };
  organizationCreatedAt?: string;
}

interface Subscription {
  id?: string;
  plan?: { id: string; slug: string; name: string; price_cents: number; currency: string };
  status?: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  payment_provider?: string | null;
}

interface Invoice {
  invoice_id: string;
  amount: number;
  status: string;
  date: string;
  pdf_url?: string | null;
}

function statusBadgeClass(status: string): string {
  if (status === 'active' || status === 'paid' || status === 'approved')
    return 'bg-success/10 text-success border-success/20';
  if (status === 'trialing') return 'bg-info/10 text-info border-info/20';
  if (status === 'past_due' || status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
  if (status === 'canceled' || status === 'failed') return 'bg-error/10 text-error border-error/20';
  return 'bg-brand-elevated text-brand-text-secondary border-brand-border';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'active' || status === 'paid' || status === 'approved')
    return <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />;
  if (status === 'trialing') return <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />;
  if (status === 'past_due' || status === 'pending') return <Clock className="w-3.5 h-3.5" aria-hidden="true" />;
  if (status === 'canceled' || status === 'failed') return <XCircle className="w-3.5 h-3.5" aria-hidden="true" />;
  return <Clock className="w-3.5 h-3.5" aria-hidden="true" />;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function BillingPortalPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/billing/usage').then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar uso.');
        return r.json();
      }),
      fetch('/api/billing/subscription').then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar assinatura.');
        return r.json();
      }),
      fetch('/api/billing/invoices').then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar faturas.');
        return r.json();
      }),
    ])
      .then(([usageData, subData, invoicesData]) => {
        setUsage(usageData);
        setSubscription(subData);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar seus dados de cobrança.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancelSubscription() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos pagos ao fim do período atual.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao cancelar assinatura. Tente novamente.');
      }
    } catch {
      alert('Erro de conexão ao cancelar assinatura. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando seus dados de cobrança…</span>
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

  const planName = subscription?.plan?.name || usage?.plan || 'Free';
  const planPrice = subscription?.plan?.price_cents
    ? currencyFormatter.format(subscription.plan.price_cents / 100)
    : 'R$ 0';
  const planStatus = subscription?.status || 'active';
  const nextBilling = subscription?.current_period_end;
  const credits = usage?.credits || 0;

  const recentInvoices = invoices.slice(0, 5);

  // Empty state: no subscription
  if (!subscription?.id && (!usage?.plan || usage.plan === 'free')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-brand-text-secondary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Você não tem uma assinatura ativa</h2>
          <p className="text-brand-text-secondary text-sm max-w-md">
            Você está no plano gratuito. Escolha um plano pago para desbloquear mais recursos e volume.
          </p>
        </div>
        <Link
          href="/billing/plans"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition-colors"
        >
          Ver planos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards superiores: plano atual + créditos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plano atual */}
        <TiltCard className="h-full">
          <SpotlightCard
            className="h-full p-6 flex flex-col"
            spotlightColor="rgba(138, 180, 248, 0.15)"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-accent" /> Plano atual
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${statusBadgeClass(planStatus)}`}
              >
                <StatusIcon status={planStatus} />
                {planStatus}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{planName}</div>
            <p className="text-sm text-brand-text-secondary mb-4">
              {planPrice} /mês
            </p>
            <div className="rounded-xl bg-brand-elevated/50 border border-brand-border p-4 mb-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-brand-text-secondary" />
                <span className="text-brand-text-secondary">Próximo vencimento:</span>
                <span className="font-semibold">
                  {nextBilling ? dateFormatter.format(new Date(nextBilling)) : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 text-brand-text-secondary" />
                <span className="text-brand-text-secondary">Ciclo:</span>
                <span className="font-semibold">Mensal</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Link
                href="/billing/plans"
                className="w-full text-center px-4 py-2.5 rounded-xl bg-brand-accent text-brand-bg text-sm font-semibold hover:bg-brand-accent-hover transition-colors"
              >
                Trocar plano
              </Link>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold text-brand-text-secondary hover:text-error hover:border-error/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cancelar assinatura'}
              </button>
            </div>
          </SpotlightCard>
        </TiltCard>

        {/* Créditos X */}
        <TiltCard className="h-full">
          <SpotlightCard
            className="h-full p-6 flex flex-col"
            spotlightColor="rgba(251, 191, 36, 0.15)"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-warning" /> Créditos X
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-semibold uppercase tracking-wide border border-warning/20">
                Saldo
              </span>
            </div>
            <div className="text-3xl font-bold text-brand-accent mb-1">
              {currencyFormatter.format(credits)}
            </div>
            <p className="text-sm text-brand-text-secondary mb-4">
              Saldo para publicações no X/Twitter
            </p>
            <div className="rounded-xl bg-brand-elevated/50 border border-brand-border p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Posts de texto</span>
                <span className="font-semibold">
                  {credits > 0 ? Math.floor(credits / 0.015).toLocaleString('pt-BR') : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Posts com link</span>
                <span className="font-semibold">
                  {credits > 0 ? Math.floor(credits / 0.2).toLocaleString('pt-BR') : '0'}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/billing/plans')}
              className="w-full mt-auto px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm font-semibold hover:bg-warning/20 transition-colors"
            >
              Comprar créditos
            </button>
          </SpotlightCard>
        </TiltCard>

        {/* Resumo rápido */}
        <TiltCard className="h-full">
          <SpotlightCard
            className="h-full p-6 flex flex-col"
            spotlightColor="rgba(34, 197, 94, 0.15)"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" /> Resumo
              </h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-secondary">Faturas pagas</span>
                <span className="font-semibold">
                  {invoices.filter((i) => i.status === 'paid' || i.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-secondary">Pendentes</span>
                <span className="font-semibold">
                  {invoices.filter((i) => i.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-secondary">Total faturas</span>
                <span className="font-semibold">{invoices.length}</span>
              </div>
            </div>
            <Link
              href="/billing/invoices"
              className="w-full mt-auto text-center px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold text-brand-text hover:border-brand-accent transition-colors"
            >
              Ver todas as faturas
            </Link>
          </SpotlightCard>
        </TiltCard>
      </div>

      {/* Uso do mês corrente */}
      <TiltCard>
        <SpotlightCard
          className="p-6"
          spotlightColor="rgba(138, 180, 248, 0.15)"
        >
          <h2 className="text-lg font-semibold mb-1">Uso do mês corrente</h2>
          <p className="text-sm text-brand-text-secondary mb-6">
            Acompanhe seu consumo por categoria. As barras mudam de cor conforme você se aproxima do limite.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {usage?.posts && (
              <UsageBar
                label="Posts"
                used={usage.posts.used}
                limit={usage.posts.limit}
                unit="posts"
              />
            )}
            {usage?.ai_caption && (
              <UsageBar
                label="IA (legendas)"
                used={usage.ai_caption.used}
                limit={usage.ai_caption.limit}
                unit="gerações"
              />
            )}
            {usage?.uploads && (
              <UsageBar
                label="Uploads"
                used={usage.uploads.used}
                limit={usage.uploads.limit}
                unit="bytes"
              />
            )}
            {usage?.comments && (
              <UsageBar
                label="Comentários"
                used={usage.comments.used}
                limit={usage.comments.limit}
                unit="comentários"
              />
            )}
          </div>
          <div className="mt-6">
            <Link
              href="/billing/usage"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
            >
              Ver uso detalhado <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SpotlightCard>
      </TiltCard>

      {/* Histórico recente de cobranças */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cobranças recentes</h2>
          <Link
            href="/billing/invoices"
            className="text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Ver todas
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-brand-border p-12 text-center">
            <FileText className="w-10 h-10 text-brand-text-secondary mx-auto mb-4" aria-hidden="true" />
            <p className="text-brand-text-secondary text-sm">
              Nenhuma cobrança registrada ainda.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <caption className="sr-only">
                  Histórico das últimas 5 cobranças com identificador, valor, status e data
                </caption>
                <thead className="bg-brand-elevated text-brand-text-secondary">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Fatura</th>
                    <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                    <th scope="col" className="px-6 py-4 font-medium">Status</th>
                    <th scope="col" className="px-6 py-4 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.invoice_id} className="hover:bg-brand-elevated/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-accent" aria-hidden="true" />
                          <span className="font-mono text-xs">{inv.invoice_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{currencyFormatter.format(inv.amount || 0)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusBadgeClass(inv.status)}`}>
                          <StatusIcon status={inv.status} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brand-text-secondary">
                        {inv.date ? dateFormatter.format(new Date(inv.date)) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
