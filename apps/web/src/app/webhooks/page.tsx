'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useRef, useState } from 'react';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';

const EVENT_TYPES = [
  'post.published',
  'post.failed',
  'post.scheduled',
  'social-account.connected',
  'social-account.disconnected',
  'social-account.reconnect_needed',
  'comment.published',
  'comment.received',
  'team.member_added',
];

const EVENT_LABELS: Record<string, string> = {
  'post.published': 'Post publicado',
  'post.failed': 'Post falhou',
  'post.scheduled': 'Post agendado',
  'social-account.connected': 'Conta conectada',
  'social-account.disconnected': 'Conta desconectada',
  'social-account.reconnect_needed': 'Reconexão necessária',
  'comment.published': 'Comentário publicado',
  'comment.received': 'Comentário recebido',
  'team.member_added': 'Membro adicionado',
};

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

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['post.published']);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch('/api/webhooks');
      if (!res.ok) throw new Error('Falha ao carregar webhooks');
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar seus webhooks. Tente novamente em instantes.');
    } finally {
      setLoadingList(false);
    }
  }

  async function handleAdd() {
    setFormError(null);
    if (!url.trim()) {
      setFormError('Informe a URL de destino do webhook.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setFormError('A URL deve começar com http:// ou https://');
      return;
    }
    if (events.length === 0) {
      setFormError('Selecione ao menos um evento para receber.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), events }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Falha ao cadastrar webhook');
      }
      setUrl('');
      setEvents(['post.published']);
      await loadWebhooks();
    } catch (e: any) {
      setFormError(e?.message || 'Erro ao cadastrar webhook. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao remover webhook');
      await loadWebhooks();
    } catch {
      setError('Não foi possível remover o webhook. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  function toggleEvent(event: string) {
    setEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));
  }

  function copyUrl(target: string) {
    navigator.clipboard.writeText(target).then(() => {
      setCopied(target);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const stats = {
    total: webhooks.length,
    active: webhooks.filter((w) => w.status === 'active').length,
    delivered: webhooks.reduce((acc, w) => acc + (w.delivered || 0), 0),
    failed: webhooks.reduce((acc, w) => acc + (w.failed || 0), 0),
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/webhooks" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <WebhookIcon className="w-6 h-6 text-brand-accent" />
            <h1 className="text-3xl font-bold">Webhooks</h1>
          </div>
          <p className="text-brand-text-secondary text-sm max-w-2xl">
            Receba notificações em tempo real sempre que um evento acontecer na sua conta.
            Cadastre um endpoint, escolha os eventos e integre com seus sistemas automaticamente.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <TiltCard>
            <SpotlightCard className="p-5" glow="#8AB4F8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                  <WebhookIcon className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-brand-text-secondary">Webhooks cadastrados</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#22C55E">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs text-brand-text-secondary">Ativos</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#6366F1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.delivered}</div>
                  <div className="text-xs text-brand-text-secondary">Entregues</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#F87171">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-error" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.failed}</div>
                  <div className="text-xs text-brand-text-secondary">Falharam</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <TiltCard>
            <SpotlightCard className="p-6" glow="#8AB4F8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-accent" /> Novo webhook
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="webhook-url" className="block text-sm text-brand-text-secondary mb-1">
                    URL de destino
                  </label>
                  <input
                    id="webhook-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://seuapp.com/webhook"
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition"
                  />
                  <p className="text-xs text-brand-text-secondary mt-1">
                    Endpoint que receberá as notificações via POST com assinatura HMAC.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-brand-text-secondary mb-2">Eventos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EVENT_TYPES.map((event) => (
                      <label
                        key={event}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                          events.includes(event)
                            ? 'bg-brand-accent/10 border border-brand-accent/30 text-brand-text'
                            : 'bg-brand-elevated border border-brand-border text-brand-text-secondary hover:border-brand-text/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={events.includes(event)}
                          onChange={() => toggleEvent(event)}
                          className="w-3 h-3 accent-brand-accent"
                        />
                        <span className="font-mono text-xs">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-sm text-error">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={loading || !url.trim()}
                  className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {loading ? 'Cadastrando…' : 'Adicionar webhook'}
                </button>
              </div>
            </SpotlightCard>
          </TiltCard>

          {/* Lista */}
          <div className="space-y-4">
            {loadingList && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center gap-2 text-brand-text-secondary text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando webhooks…
              </div>
            )}

            {!loadingList && error && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-error/30 flex flex-col items-center gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-error" />
                <p className="text-error text-sm">{error}</p>
                <button
                  onClick={loadWebhooks}
                  className="px-4 py-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loadingList && !error && webhooks.length === 0 && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <WebhookIcon className="w-8 h-8 text-brand-text-secondary mx-auto mb-2" />
                <p className="text-brand-text-secondary text-sm">
                  Nenhum webhook cadastrado ainda.
                </p>
                <p className="text-brand-text-secondary text-xs mt-1">
                  Cadastre seu primeiro endpoint ao lado para começar a receber notificações.
                </p>
              </div>
            )}

            {!loadingList &&
              !error &&
              webhooks.map((w) => (
                <TiltCard key={w.id}>
                  <SpotlightCard className="p-5" glow="#8AB4F8">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-sm truncate font-mono text-brand-text">{w.url}</code>
                          <button
                            onClick={() => copyUrl(w.url)}
                            className="text-brand-text-secondary hover:text-brand-text transition shrink-0"
                            aria-label="Copiar URL"
                          >
                            {copied === w.url ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(w.events) ? w.events : []).map((e: string) => (
                            <span
                              key={e}
                              title={EVENT_LABELS[e] || e}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-brand-elevated text-brand-text-secondary font-mono"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(w.id)}
                        disabled={deletingId === w.id}
                        className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition disabled:opacity-50"
                        aria-label="Remover webhook"
                      >
                        {deletingId === w.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-brand-text-secondary">
                      <span
                        className={`flex items-center gap-1 ${w.status === 'active' ? 'text-success' : 'text-error'}`}
                      >
                        <Activity className="w-3 h-3" /> {w.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span>{w.total_events || 0} eventos</span>
                      <span className="text-success">{w.delivered || 0} entregues</span>
                      {(w.failed || 0) > 0 && (
                        <span className="text-error">{w.failed} falharam</span>
                      )}
                    </div>
                  </SpotlightCard>
                </TiltCard>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
