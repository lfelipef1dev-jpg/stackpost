'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Activity, RefreshCw } from 'lucide-react';

type Check = { name: string; ok: boolean; ms: number };
type StatusData = { status: string; checked_at: string; checks: Check[] };

const SERVICE_LABELS: Record<string, string> = {
  api: 'API',
  database: 'Banco de dados',
  instagram: 'Instagram / Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  pagamentos: 'Pagamentos (Mercado Pago)',
};

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${ok ? 'bg-success/10 text-success border-success/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
      {ok ? 'Operacional' : 'Falha'}
    </span>
  );
}

export default function StatusLive() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    fetch('/api/status')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const allOk = data?.status === 'operational';
  const checkedAt = data ? new Date(data.checked_at).toLocaleTimeString('pt-BR') : null;

  return (
    <>
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8 ${!data ? 'bg-brand-surface/40 border-brand-border/40' : allOk ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/30'}`}>
        {!data ? (
          <>
            <RefreshCw className="w-6 h-6 text-brand-text-secondary animate-spin" />
            <div className="font-semibold text-brand-text-secondary">Verificando serviços...</div>
          </>
        ) : (
          <>
            {allOk ? <CheckCircle2 className="w-6 h-6 text-success" /> : <AlertCircle className="w-6 h-6 text-warning" />}
            <div>
              <div className={`font-semibold ${allOk ? 'text-success' : 'text-warning'}`}>
                {allOk ? 'Todos os sistemas operacionais' : 'Degradação detectada'}
              </div>
              <div className="text-sm text-brand-text-secondary">Última verificação: {checkedAt} (ao vivo)</div>
            </div>
          </>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Serviços</h2>
      <div className="space-y-2">
        {!data &&
          Object.keys(SERVICE_LABELS).map((k) => (
            <div key={k} className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-elevated animate-pulse" />
                <span className="font-medium">{SERVICE_LABELS[k]}</span>
              </div>
              <div className="h-6 w-24 rounded-full bg-brand-elevated animate-pulse" />
            </div>
          ))}
        {data?.checks.map((c) => (
          <div key={c.name} className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
            <div className="flex items-center gap-3">
              {c.ok ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-error" />}
              <span className="font-medium">{SERVICE_LABELS[c.name] || c.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {c.ms > 0 && <span className="text-xs text-brand-text-secondary font-mono">{c.ms}ms</span>}
              <StatusBadge ok={c.ok} />
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-error mt-4">Não foi possível verificar o status agora.</p>}
      {data && (
        <button onClick={load} className="mt-6 text-sm text-brand-accent hover:underline flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Verificar novamente
        </button>
      )}
    </>
  );
}
