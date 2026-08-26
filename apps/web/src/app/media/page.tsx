'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { Upload, Link as LinkIcon, FileVideo, FileImage, Trash2, Loader2, Copy, Check } from 'lucide-react';

export default function MediaLibraryPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');
  const [urlInput, setUrlInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  async function loadUploads() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/upload', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUploads(Array.isArray(data) ? data : []);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    await loadUploads();
    setLoading(false);
  }

  async function handleUrlUpload() {
    if (!urlInput) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch('/api/upload/from-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: urlInput }),
    });
    setUrlInput('');
    await loadUploads();
    setLoading(false);
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
        <h1 className="text-3xl font-bold mb-8">Biblioteca de midia</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('library')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'library' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border'}`}>Biblioteca</button>
          <button onClick={() => setTab('upload')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'upload' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border'}`}>Upload</button>
          <button onClick={() => setTab('url')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'url' ? 'bg-brand-accent text-brand-bg' : 'bg-brand-surface border border-brand-border'}`}>Por URL</button>
        </div>

        {tab === 'upload' && (
          <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border border-dashed text-center">
            <Upload className="w-12 h-12 text-brand-text-secondary mx-auto mb-4" />
            <p className="text-brand-text-secondary mb-4">Arraste ou selecione um arquivo (ate 90MB)</p>
            <input type="file" onChange={handleUpload} className="hidden" id="file-upload" accept="image/*,video/*" />
            <label htmlFor="file-upload" className="inline-block px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold cursor-pointer hover:bg-brand-accent-hover transition">
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Selecionar arquivo'}
            </label>
          </div>
        )}

        {tab === 'url' && (
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-brand-accent" /> Upload por URL</h2>
            <p className="text-sm text-brand-text-secondary mb-4">Cole uma URL publica (HTTP/HTTPS). O StackPost baixa e registra. Max 1GB, timeout 60s.</p>
            <div className="flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://exemplo.com/imagem.jpg" className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
              <button onClick={handleUrlUpload} disabled={loading || !urlInput} className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Baixar'}
              </button>
            </div>
          </div>
        )}

        {tab === 'library' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploads.length === 0 && (
              <div className="col-span-full text-center py-12 text-brand-text-secondary">Nenhum upload ainda.</div>
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
