'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

export default function BulkPage() {
  const [csvText, setCsvText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string);
    reader.readAsText(file);
  }

  async function handleBulk() {
    if (!csvText) return;
    setLoading(true);
    const res = await fetch('/api/posts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csvText,
    });
    const data = await res.json();
    setResults(data.posts || []);
    setLoading(false);
  }

  function downloadTemplate() {
    const csv = 'content,platforms,scheduledAt\n"Hello world","instagram;facebook","2026-01-15T10:00:00Z"\n"Another post","linkedin","2026-01-16T14:00:00Z"';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stackpost-template.csv';
    a.click();
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/bulk" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Postagem em massa</h1>
        <p className="text-brand-text-secondary mb-8">Crie e agende múltiplas publicações de uma vez usando um arquivo CSV.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-6" glow="#8AB4F8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-brand-accent" /> Upload CSV</h2>
            <p className="text-sm text-brand-text-secondary mb-4">Colunas: content, platforms (separadas por ;), scheduledAt (ISO 8601)</p>
            <div className="space-y-4">
              <input type="file" accept=".csv" onChange={handleFile} className="block w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-accent file:text-brand-bg file:cursor-pointer" />
              <button onClick={downloadTemplate} className="text-sm text-brand-accent hover:underline">Baixar template CSV</button>
              <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} placeholder="content,platforms,scheduledAt&#10;Hello world,instagram;facebook,2026-01-15T10:00:00Z" className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-mono text-xs" />
              <button onClick={handleBulk} disabled={loading || !csvText} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Criar posts
              </button>
            </div>
            </SpotlightCard>
          </TiltCard>

          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-6" glow="#22C55E">
            <h2 className="text-lg font-semibold mb-4">Resultados ({results.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length === 0 && (
                <div className="text-center py-12">
                  <FileSpreadsheet className="w-10 h-10 text-brand-text-secondary mx-auto mb-3 opacity-50" />
                  <p className="text-brand-text-secondary text-sm mb-2">Nenhum post criado ainda.</p>
                  <p className="text-brand-text-secondary text-xs">Faça upload de um CSV e clique em "Criar posts" para começar.</p>
                </div>
              )}
              {results.map((p, i) => (
                <div key={p.id || i} className="p-3 rounded-xl bg-brand-elevated border border-brand-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm line-clamp-1">{p.content?.slice(0, 50)}</span>
                  </div>
                  <div className="text-xs text-brand-text-secondary mt-1">{p.platforms?.join(', ')} • {p.status}</div>
                </div>
              ))}
            </div>
            </SpotlightCard>
          </TiltCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}
