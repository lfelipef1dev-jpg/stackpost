'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, Image as ImageIcon, Calendar, Eye, Code2, Copy, Check } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { FadeIn, ScrollReveal } from '@/components/animations';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'discord', label: 'Discord', color: '#5865F2' },
  { id: 'x', label: 'X', color: '#000000' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'threads', label: 'Threads', color: '#000000' },
];

export default function DemoPage() {
  const [text, setText] = useState('Ola mundo! Testando o StackPost API.');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook', 'linkedin']);
  const [mediaUrl, setMediaUrl] = useState('https://example.com/foto.jpg');
  const [scheduledAt, setScheduledAt] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const payload = {
    platforms: selectedPlatforms,
    text,
    media: mediaUrl ? [{ type: 'image', url: mediaUrl }] : [],
    ...(scheduledAt ? { scheduledAt } : {}),
  };

  const jsonPayload = JSON.stringify(payload, null, 2);

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#8AB4F815' }} />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#8AB4F840', backgroundColor: '#8AB4F810' }}>
              <Eye className="w-3.5 h-3.5" style={{ color: '#8AB4F8' }} />
              <span className="text-xs font-mono" style={{ color: '#8AB4F8' }}>Live Demo</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #8AB4F8 25%, white)' }}>
              Teste sem cadastro
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Monte um post, escolha plataformas e veja o payload JSON que a API recebe. Sem login, sem cartao.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Composer */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: form */}
            <div className="space-y-6">
              {/* Platforms */}
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-text-secondary">
                  Plataformas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedPlatforms.includes(p.id)
                          ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                          : 'border-brand-border text-brand-text-secondary hover:border-brand-text-secondary'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-brand-text-secondary mt-3">
                  {selectedPlatforms.length} selecionada(s)
                </p>
              </div>

              {/* Text */}
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-text-secondary">
                  Texto
                </h3>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  maxLength={2200}
                  className="w-full p-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text text-sm resize-none focus:outline-none focus:border-brand-accent"
                  placeholder="Digite seu post..."
                />
                <p className="text-xs text-brand-text-secondary mt-2">{text.length}/2200</p>
              </div>

              {/* Media */}
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-text-secondary flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Midia
                </h3>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full p-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-accent"
                  placeholder="https://example.com/foto.jpg"
                />
              </div>

              {/* Schedule */}
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-text-secondary flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Agendar (opcional)
                </h3>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Right: JSON output */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-brand-text-secondary flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Payload JSON
                  </h3>
                  <button
                    onClick={copyJson}
                    className="text-xs text-brand-text-secondary hover:text-brand-accent flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-brand-bg border border-brand-border overflow-x-auto text-xs font-mono text-brand-text-secondary">
                  <code>{jsonPayload}</code>
                </pre>
                <p className="text-xs text-brand-text-secondary mt-3">
                  Este e o payload que voce enviaria para <code className="text-brand-accent">POST /api/posts</code>
                </p>
              </div>

              {/* curl example */}
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-text-secondary">
                  Exemplo curl
                </h3>
                <pre className="p-4 rounded-lg bg-brand-bg border border-brand-border overflow-x-auto text-xs font-mono text-brand-text-secondary">
                  <code>{`curl -X POST https://stackpost.expostacker.com.br/api/posts \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${jsonPayload.replace(/\n/g, ' ')}'`}</code>
                </pre>
              </div>

              {/* Publish button */}
              <button
                onClick={handlePublish}
                disabled={selectedPlatforms.length === 0 || !text}
                className="w-full px-6 py-4 bg-brand-accent text-brand-bg font-bold rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {published ? (
                  <><Check className="w-5 h-5" /> Payload valido!</>
                ) : (
                  <><Send className="w-5 h-5" /> Simular publicacao</>
                )}
              </button>
              <p className="text-xs text-brand-text-secondary text-center">
                Demo nao publica de verdade. Crie uma conta para publicar.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="mt-12 text-center">
          <div className="p-8 rounded-2xl bg-brand-surface/30 border border-brand-border">
            <h2 className="text-2xl font-bold mb-2">Pronto pra publicar de verdade?</h2>
            <p className="text-brand-text-secondary mb-6">Crie sua conta gratuita e conecte suas redes em minutos.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Criar conta gratis <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
