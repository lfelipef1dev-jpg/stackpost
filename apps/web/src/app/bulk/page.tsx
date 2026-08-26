'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
    const token = localStorage.getItem('token');
    const res = await fetch('/api/posts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv', Authorization: `Bearer ${token}` },
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
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/composer" className="hover:text-brand-text">Criar post</a>
            <a href="/bulk" className="text-brand-text">Em massa</a>
            <a href="/calendar" className="hover:text-brand-text">Calendario</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Postagem em massa</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
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
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Resultados ({results.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length === 0 && <div className="text-brand-text-secondary text-sm">Nenhum post criado ainda.</div>}
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
          </div>
        </div>
      </main>
    </div>
  );
}
