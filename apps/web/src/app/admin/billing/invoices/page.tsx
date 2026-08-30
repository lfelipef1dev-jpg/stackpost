'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Download, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Invoice {
  invoice_id: string;
  organization: { id: string; name: string; slug: string | null };
  amount: number;
  status: string;
  date: string;
  pdf_url: string | null;
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
  if (status === 'refunded') return <Info className="w-3 h-3" aria-hidden="true" />;
  if (status === 'pending') return <AlertTriangle className="w-3 h-3" aria-hidden="true" />;
  return <AlertCircle className="w-3 h-3" aria-hidden="true" />;
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/billing/invoices')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar faturas.');
        return r.json();
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar as faturas no momento.'))
      .finally(() => setLoading(false));
  }, []);

  function downloadPdf(invoiceId: string) {
    alert(`O download do PDF para a fatura ${invoiceId} ainda não está disponível.`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
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
      <h1 className="text-3xl font-bold mb-2">Faturas</h1>
      <p className="text-brand-text-secondary mb-8">
        Histórico de faturas geradas a partir dos pagamentos processados pela plataforma.
      </p>

      {invoices.length === 0 ? (
        <div className="rounded-2xl bg-brand-surface border border-brand-border p-12 text-center">
          <FileText className="w-10 h-10 text-brand-text-secondary mx-auto mb-4" aria-hidden="true" />
          <p className="text-brand-text-secondary text-sm">Nenhuma fatura encontrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Lista de faturas com identificador, organização, valor, status, data e ações</caption>
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Fatura</th>
                <th scope="col" className="px-6 py-4 font-medium">Organização</th>
                <th scope="col" className="px-6 py-4 font-medium">Valor</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Data</th>
                <th scope="col" className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {invoices.map((i) => (
                <tr key={i.invoice_id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-accent" aria-hidden="true" />
                      <span className="font-mono text-xs">{i.invoice_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{i.organization?.name || '—'}</td>
                  <td className="px-6 py-4">{currencyFormatter.format(i.amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusBadgeClass(i.status)}`}>
                      <StatusIcon status={i.status} />
                      {i.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-text-secondary">
                    {i.date ? dateFormatter.format(new Date(i.date)) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => downloadPdf(i.invoice_id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors inline-flex items-center gap-1"
                      aria-label={`Baixar PDF da fatura ${i.invoice_id}`}
                    >
                      <Download className="w-3 h-3" aria-hidden="true" /> PDF
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
