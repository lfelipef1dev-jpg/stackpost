'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';

import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, FileClock } from 'lucide-react';

function SpotlightCard({ children, className = '', glow = '#8AB4F8' }: { children: React.ReactNode; className?: string; glow?: string }) {
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
        backgroundImage: spot.active ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)` : undefined,
      }}
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent', transition: 'box-shadow 0.3s' }} />
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
        setStyle({ transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`, transition: 'transform 0.15s ease-out' });
      }}
      onMouseLeave={() => setStyle({ transform: 'perspective(1200px) rotateX(0) rotateY(0)', transition: 'transform 0.4s ease-out' })}
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

export default function ImportsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [platform, setPlatform] = useState('');
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
    loadImports();
  }, []);

  async function loadAccounts() {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    }
  }

  async function loadImports() {
    try {
      const res = await fetch('/api/imports');
      const data = await res.json();
      setImports(Array.isArray(data) ? data : []);
    } catch {
      setImports([]);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleImport() {
    if (!selectedAccount) return;
    setLoading(true);
    const account = accounts.find((a) => a.id === selectedAccount);
    try {
      await fetch('/api/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialAccountId: selectedAccount,
          platform: platform || account?.platform || 'instagram',
          limit,
        }),
      });
      await loadImports();
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/imports" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Importar histórico</h1>
        <p className="text-brand-text-secondary mb-8">Importe publicações antigas das suas contas sociais conectadas.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-6" glow="#8AB4F8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-brand-accent" /> Importar posts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Conta social</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                  <option value="">Selecione...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.platform} - {a.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Limite (máx 100)</label>
                <input type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value) || 50)} max={100} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
              </div>
              <button onClick={handleImport} disabled={loading || !selectedAccount} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Importar
              </button>
            </div>
            </SpotlightCard>
          </TiltCard>

          <div className="lg:col-span-2">
            <TiltCard className="h-full">
              <SpotlightCard className="h-full p-6" glow="#22C55E">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileClock className="w-5 h-5 text-brand-accent" /> Posts importados ({imports.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {initialLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="w-5 h-5 text-brand-text-secondary animate-spin mx-auto mb-2" />
                    <p className="text-brand-text-secondary text-sm">Carregando imports...</p>
                  </div>
                )}
                {!initialLoading && imports.length === 0 && (
                  <div className="text-center py-8">
                    <FileClock className="w-10 h-10 text-brand-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-brand-text-secondary text-sm mb-2">Nenhum post importado ainda.</p>
                    <p className="text-brand-text-secondary text-xs">Selecione uma conta e clique em "Importar" para começar.</p>
                  </div>
                )}
                {imports.map((imp) => {
                  const platformData = PLATFORMS.find((p) => p.id === imp.platform);
                  return (
                    <div key={imp.id} className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                      <p className="text-sm line-clamp-2">{imp.content || 'Sem texto'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-text-secondary">
                        {platformData && (
                          <span className="flex items-center gap-1 capitalize">
                            <PlatformIcon id={platformData.id} size={12} color={platformData.color} />
                            {platformData.name}
                          </span>
                        )}
                        {!platformData && <span className="capitalize">{imp.platform}</span>}
                        {imp.permalink && <a href={imp.permalink} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">Ver original</a>}
                        {imp.posted_at && <span>{new Date(imp.posted_at).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              </SpotlightCard>
            </TiltCard>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
