'use client';

import { useEffect, useState } from 'react';
import { Loader2, Webhook, CheckCircle2, XCircle, AlertCircle, Inbox } from 'lucide-react';

interface Webhook {
  id: string;
  url?: string;
  event?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [k: string]: unknown;
}

function formatarDataPtBr(valor?: string): string {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function traduzirStatus(status?: string): { label: string; classe: string; icone: typeof CheckCircle2 } {
  if (!status) return { label: 'Indefinido', classe: 'text-brand-text-secondary', icone: AlertCircle };
  const normalizado = status.toLowerCase();
  if (['ativo', 'success', 'ok', 'enabled', 'delivered'].includes(normalizado)) {
    return { label: 'Ativo', classe: 'text-emerald-400', icone: CheckCircle2 };
  }
  if (['falha', 'failed', 'error', 'disabled', 'inactive'].includes(normalizado)) {
    return { label: 'Falha', classe: 'text-red-400', icone: XCircle };
  }
  return { label: status, classe: 'text-brand-text-secondary', icone: AlertCircle };
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const resposta = await fetch('/api/admin/webhooks');
        if (!resposta.ok) {
          const corpo = await resposta.json().catch(() => ({}));
          throw new Error(corpo.error || 'Não foi possível carregar os webhooks.');
        }
        const dados = await resposta.json();
        if (!cancelado) setWebhooks(Array.isArray(dados) ? dados : []);
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Erro inesperado ao carregar os webhooks.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" aria-hidden="true" />
        <p className="text-sm text-brand-text-secondary">Carregando webhooks…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Erro ao carregar webhooks</p>
          <p className="mt-1 text-sm text-red-400/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Webhook className="h-6 w-6 text-brand-accent" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-brand-text">Webhooks</h1>
        </div>
        <p className="text-brand-text-secondary">
          Gerencie os endpoints de integração e acompanhe as entregas de eventos em tempo real.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Lista de webhooks cadastrados</caption>
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Identificador</th>
              <th scope="col" className="px-6 py-4 font-medium">Endpoint</th>
              <th scope="col" className="px-6 py-4 font-medium">Evento</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Atualizado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Inbox className="h-8 w-8 text-brand-text-secondary" aria-hidden="true" />
                    <p className="font-medium text-brand-text">Nenhum webhook cadastrado</p>
                    <p className="text-sm text-brand-text-secondary">
                      Configure um endpoint para começar a receber notificações de eventos.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              webhooks.map((w) => {
                const status = traduzirStatus(String(w.status ?? ''));
                const IconeStatus = status.icone;
                return (
                  <tr key={w.id} className="transition-colors hover:bg-brand-elevated/50">
                    <td className="px-6 py-4 font-mono text-xs text-brand-text">{w.id}</td>
                    <td className="px-6 py-4 text-brand-text">
                      {w.url ? (
                        <span className="break-all font-mono text-xs">{String(w.url)}</span>
                      ) : (
                        <span className="text-brand-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-brand-text">{w.event ? String(w.event) : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm ${status.classe}`}>
                        <IconeStatus className="h-4 w-4" aria-hidden="true" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{formatarDataPtBr(String(w.updated_at ?? w.created_at))}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
