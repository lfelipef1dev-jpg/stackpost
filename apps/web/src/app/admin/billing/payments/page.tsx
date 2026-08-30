'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCcw, CheckCircle2, Clock, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Payment {
  id: string;
  payment_id: string;
  order_id: string;
  plano: string;
  status: string;
  amount: number;
  currency: string;
  processed_at: string;
  organization: { id: string; name: string; slug: string | null };
  team: { id: string; name: string };
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function statusBadgeClass(status: string): string {
  if (status === 'paid' || status === 'approved') return 'bg-success/10 text-success';
  if (status === 'refunded') return 'bg-info/10 text-info';
  if (status === 'pending') return 'bg-warning/10 text-warning';
  return 'bg-error/10 text-error';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'paid' || status === 'approved') return <CheckCircle2 className="w-3 h-3" aria-hidden="true" />;
  if (status === 'refunded') return <RefreshCcw className="w-3 h-3" aria-hidden="true" />;
  if (status === 'pending') return <Clock className="w-3 h-3" aria-hidden="true" />;
  return <AlertCircle className="w-3 h-3" aria-hidden="true" />;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetch('/api/admin/billing/payments')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar pagamentos.');
        return r.json();
      })
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar os pagamentos no momento.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRefund(p: Payment) {
    const reason = prompt('Informe o motivo do reembolso:');
    if (!reason) return;
    const amountCents = prompt('Valor do reembolso em centavos:', String(Math.round(p.amount * 100)));
    if (!amountCents) return;

    setRefundingId(p.id);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/billing/payments/${p.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, amount_cents: Number(amountCents) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Reembolso registrado com sucesso.');
        setMessageType('success');
        setPayments((prev) => prev.map((pm) => (pm.id === p.id ? { ...pm, status: 'refunded' } : pm)));
      } else {
        setMessage(data.error || 'Erro ao registrar reembolso. Tente novamente.');
        setMessageType('error');
      }
    } catch {
      setMessage('Erro de conexão ao registrar reembolso. Tente novamente.');
      setMessageType('error');
    } finally {
      setRefundingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando pagamentos…</span>
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
      <h1 className="text-3xl font-bold mb-2">Pagamentos</h1>
      <p className="text-brand-text-secondary mb-8">
        Registro de todos os pagamentos processados via Mercado Pago.
      </p>

      {message && (
        <div
          role="alert"
          className={`mb-6 p-4 rounded-xl border text-sm ${
            messageType === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {message}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="rounded-2xl bg-brand-surface border border-brand-border p-12 text-center">
          <RefreshCcw className="w-10 h-10 text-brand-text-secondary mx-auto mb-4" aria-hidden="true" />
          <p className="text-brand-text-secondary text-sm">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Lista de pagamentos com identificador, organização, plano, valor, status, data e ações</caption>
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">ID Mercado Pago</th>
                <th scope="col" className="px-6 py-4 font-medium">Organização</th>
                <th scope="col" className="px-6 py-4 font-medium">Plano</th>
                <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Data</th>
                <th scope="col" className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{p.payment_id}</td>
                  <td className="px-6 py-4">{p.organization?.name || '—'}</td>
                  <td className="px-6 py-4">{p.plano || '—'}</td>
                  <td className="px-6 py-4">{currencyFormatter.format(p.amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusBadgeClass(p.status)}`}>
                      <StatusIcon status={p.status} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-text-secondary">
                    {p.processed_at ? dateFormatter.format(new Date(p.processed_at)) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRefund(p)}
                      disabled={refundingId === p.id || p.status === 'refunded'}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                      aria-label={`Reembolsar pagamento ${p.payment_id}`}
                    >
                      {refundingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <RefreshCcw className="w-3 h-3" aria-hidden="true" />}
                      Reembolsar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
