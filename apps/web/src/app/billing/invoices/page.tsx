'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  Filter,
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

interface Invoice {
  invoice_id: string;
  amount: number;
  status: string;
  date: string;
  period_start?: string;
  period_end?: string;
  pdf_url?: string | null;
}

type StatusFilter = 'all' | 'paid' | 'pending';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'paid', label: 'Pagas' },
  { value: 'pending', label: 'Pendentes' },
];

function statusBadgeClass(status: string): string {
  if (status === 'paid' || status === 'approved') return 'bg-success/10 text-success border-success/20';
  if (status === 'refunded') return 'bg-info/10 text-info border-info/20';
  if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-error/10 text-error border-error/20';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'paid' || status === 'approved') return <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />;
  if (status === 'refunded') return <Info className="w-3.5 h-3.5" aria-hidden="true" />;
  if (status === 'pending') return <Clock className="w-3.5 h-3.5" aria-hidden="true" />;
  return <XCircle className="w-3.5 h-3.5" aria-hidden="true" />;
}

export default function UserInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar faturas.');
        return r.json();
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar suas faturas.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    if (statusFilter === 'paid') {
      return invoices.filter((i) => i.status === 'paid' || i.status === 'approved');
    }
    if (statusFilter === 'pending') {
      return invoices.filter((i) => i.status === 'pending' || i.status === 'past_due');
    }
    return invoices;
  }, [invoices, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando faturas…</span>
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

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center">
          <FileText className="w-8 h-8 text-brand-text-secondary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Nenhuma fatura encontrada</h2>
          <p className="text-brand-text-secondary text-sm max-w-md">
            Suas faturas aparecerão aqui assim que houver cobranças em sua conta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por status */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-brand-text-secondary" />
        <div
          className="flex items-center gap-1 p-1.5 rounded-xl bg-brand-surface border border-brand-border"
          role="group"
          aria-label="Filtrar faturas por status"
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === f.value
                  ? 'bg-brand-accent text-brand-bg'
                  : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated'
              }`}
              aria-pressed={statusFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de faturas */}
      <TiltCard>
        <SpotlightCard
          className="overflow-hidden"
          spotlightColor="rgba(138, 180, 248, 0.15)"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">
                Lista de faturas com número, período, valor, status e opção de download em PDF
              </caption>
              <thead className="bg-brand-elevated text-brand-text-secondary">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Número</th>
                  <th scope="col" className="px-6 py-4 font-medium">Período</th>
                  <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((inv) => (
                  <tr key={inv.invoice_id} className="hover:bg-brand-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-accent" aria-hidden="true" />
                        <span className="font-mono text-xs">{inv.invoice_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {inv.period_start && inv.period_end ? (
                        <>
                          {dateFormatter.format(new Date(inv.period_start))}
                          <span className="mx-1">→</span>
                          {dateFormatter.format(new Date(inv.period_end))}
                        </>
                      ) : inv.date ? (
                        dateFormatter.format(new Date(inv.date))
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {currencyFormatter.format(inv.amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusBadgeClass(inv.status)}`}
                      >
                        <StatusIcon status={inv.status} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors inline-flex items-center gap-1"
                          aria-label={`Baixar PDF da fatura ${inv.invoice_id}`}
                        >
                          <Download className="w-3 h-3" aria-hidden="true" /> Baixar
                        </a>
                      ) : (
                        <span className="text-xs text-brand-text-secondary">Indisponível</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </TiltCard>

      {filtered.length === 0 && (
        <div className="text-center text-sm text-brand-text-secondary">
          Nenhuma fatura encontrada para o filtro selecionado.
        </div>
      )}

      <div className="text-sm text-brand-text-secondary">
        {filtered.length} fatura(s) encontrada(s)
      </div>
    </div>
  );
}
