'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useRef, useState } from 'react';
import { Upload, Link as LinkIcon, FileVideo, FileImage, Loader2, Copy, Check } from 'lucide-react';

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

export default function MediaLibraryPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');
  const [urlInput, setUrlInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  async function loadUploads() {
    try {
      const res = await fetch('/api/upload');
      const data = await res.json();
      setUploads(Array.isArray(data) ? data : []);
    } catch {
      setUploads([]);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      await loadUploads();
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }

  async function handleUrlUpload() {
    if (!urlInput) return;
    setLoading(true);
    try {
      await fetch('/api/upload/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      setUrlInput('');
      await loadUploads();
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }

  function copyUrl(url: string) {
    const full = window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/media" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Biblioteca de mídia</h1>
        <p className="text-brand-text-secondary mb-8">Gerencie imagens e vídeos para usar em suas publicações.</p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('library')} className={`px-4 py-2 rounded-lg text-sm transition ${tab === 'library' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border hover:border-brand-accent'}`}>Biblioteca</button>
          <button onClick={() => setTab('upload')} className={`px-4 py-2 rounded-lg text-sm transition ${tab === 'upload' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border hover:border-brand-accent'}`}>Upload</button>
          <button onClick={() => setTab('url')} className={`px-4 py-2 rounded-lg text-sm transition ${tab === 'url' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border hover:border-brand-accent'}`}>Por URL</button>
        </div>

        {tab === 'upload' && (
          <TiltCard>
            <SpotlightCard className="p-8 border-dashed text-center" glow="#22D3EE">
              <Upload className="w-12 h-12 text-brand-text-secondary mx-auto mb-4" />
              <p className="text-brand-text-secondary mb-4">Arraste ou selecione um arquivo (até 90MB)</p>
              <input type="file" onChange={handleUpload} className="hidden" id="file-upload" accept="image/*,video/*" />
              <label htmlFor="file-upload" className="inline-block px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold cursor-pointer hover:bg-brand-accent-hover transition">
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Selecionar arquivo'}
              </label>
            </SpotlightCard>
          </TiltCard>
        )}

        {tab === 'url' && (
          <TiltCard>
            <SpotlightCard className="p-6" glow="#8AB4F8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-brand-accent" /> Upload por URL</h2>
              <p className="text-sm text-brand-text-secondary mb-4">Cole uma URL pública (HTTP/HTTPS). O StackPost baixa e registra. Máx 1GB, timeout 60s.</p>
              <div className="flex gap-2">
                <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://exemplo.com/imagem.jpg" className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
                <button onClick={handleUrlUpload} disabled={loading || !urlInput} className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Baixar'}
                </button>
              </div>
            </SpotlightCard>
          </TiltCard>
        )}

        {tab === 'library' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {initialLoading && (
              <div className="col-span-full text-center py-12">
                <Loader2 className="w-6 h-6 text-brand-text-secondary animate-spin mx-auto mb-3" />
                <p className="text-brand-text-secondary text-sm">Carregando biblioteca...</p>
              </div>
            )}
            {!initialLoading && uploads.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileImage className="w-10 h-10 text-brand-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-brand-text-secondary text-sm mb-2">Nenhum upload ainda.</p>
                <button onClick={() => setTab('upload')} className="text-sm text-brand-accent hover:underline">Fazer primeiro upload</button>
              </div>
            )}
            {uploads.map((u) => (
              <div key={u.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border">
                <div className="aspect-square rounded-lg overflow-hidden bg-brand-elevated mb-2 flex items-center justify-center">
                  {u.mime_type?.startsWith('image/') ? (
                    <img src={u.url} alt={u.file_name} className="w-full h-full object-cover" />
                  ) : u.mime_type?.startsWith('video/') ? (
                    <FileVideo className="w-8 h-8 text-brand-text-secondary" />
                  ) : (
                    <FileImage className="w-8 h-8 text-brand-text-secondary" />
                  )}
                </div>
                <div className="text-xs font-medium truncate">{u.file_name}</div>
                <div className="text-[10px] text-brand-text-secondary">{formatSize(u.size || 0)}</div>
                <button onClick={() => copyUrl(u.url)} className="mt-1 text-[10px] text-brand-accent hover:underline flex items-center gap-1">
                  {copied === u.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar URL
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
