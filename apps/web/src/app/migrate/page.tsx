import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeftRight, Check, FileCode } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Migrar para StackPost - Ayrshare, Buffer, Publer e custom',
  description: 'Guia de migracao de Ayrshare, Buffer, Publer, Nuelink e API custom para StackPost. Troque de provider em horas, nao semanas.',
  alternates: { canonical: '/migrate' },
};

const jsonLd = serviceSchema('Migrar para StackPost', 'Guia de migracao de concorrentes para StackPost.', '/migrate');

const providers = [
  { name: 'Ayrshare', slug: 'ayrshare', color: '#FF6B6B', desc: 'Migracao de Ayrshare Social API', endpoints: '/social-api -> /api/posts' },
  { name: 'Buffer', slug: 'buffer', color: '#3ECBBE', desc: 'Migracao de Buffer API', endpoints: '/updates.json -> /api/posts' },
  { name: 'Publer', slug: 'publer', color: '#5B5FE9', desc: 'Migracao de Publer API', endpoints: '/api/posts -> /api/posts' },
  { name: 'Nuelink', slug: 'nuelink', color: '#FF9F1C', desc: 'Migracao de Nuelink API', endpoints: 'custom -> /api/posts' },
  { name: 'Custom API', slug: 'custom', color: '#8AB4F8', desc: 'Migracao de API propria', endpoints: 'seu endpoint -> /api/posts' },
];

const mapping = [
  { ay: 'POST /api/post', sp: 'POST /api/posts', note: 'Mesma estrutura, payload unificado' },
  { ay: 'GET /api/posts', sp: 'GET /api/posts', note: 'Listagem com paginacao cursor' },
  { ay: 'DELETE /api/post/{id}', sp: 'DELETE /api/posts/{id}', note: 'Mesma assinatura' },
  { ay: 'GET /api/analytics', sp: 'GET /api/analytics/posts/{id}', note: 'Analytics por post' },
  { ay: 'GET /api/user', sp: 'GET /api/me', note: 'Dados do usuario logado' },
  { ay: 'API Key header', sp: 'Authorization: Bearer', note: 'Bearer token no header' },
  { ay: 'platforms: ["facebook"]', sp: 'platforms: ["facebook"]', note: 'Mesmo formato de array' },
  { ay: 'mediaUrls: ["..."]', sp: 'media: [{ type: "image", url: "..." }]', note: 'Formato estruturado' },
];

export default function MigratePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#8AB4F815' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#8AB4F810' }} />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#8AB4F840', backgroundColor: '#8AB4F810' }}>
              <ArrowLeftRight className="w-3.5 h-3.5" style={{ color: '#8AB4F8' }} />
              <span className="text-xs font-mono" style={{ color: '#8AB4F8' }}>Migration Center</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #8AB4F8 25%, white)' }}>
              Migre para StackPost em horas
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Troque de provider sem reescrever seu produto. Mapeamento de endpoints, exemplos de codigo e zero downtime.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Providers */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-6">Migrar de:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => (
              <Link
                key={p.slug}
                href={`/migrate-from-${p.slug}`}
                className="p-6 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold" style={{ color: p.color }}>{p.name}</h3>
                  <ArrowRight className="w-4 h-4 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
                </div>
                <p className="text-sm text-brand-text-secondary mb-2">{p.desc}</p>
                <code className="text-xs text-brand-text-secondary font-mono">{p.endpoints}</code>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Ayrshare mapping example */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-2">{`Exemplo: Ayrshare -> StackPost`}</h2>
          <p className="text-sm text-brand-text-secondary mb-6">Mapeamento de endpoints e payload.</p>
          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-surface border-b border-brand-border">
                  <th className="text-left p-4 font-semibold">Ayrshare</th>
                  <th className="text-left p-4 font-semibold text-brand-accent">StackPost</th>
                  <th className="text-left p-4 font-semibold text-brand-text-secondary">Nota</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface/30' : ''}>
                    <td className="p-4 font-mono text-xs text-brand-text-secondary">{m.ay}</td>
                    <td className="p-4 font-mono text-xs text-brand-accent">{m.sp}</td>
                    <td className="p-4 text-xs text-brand-text-secondary">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      {/* Code example */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5" /> Antes vs Depois
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-mono text-red-400 mb-2">// Ayrshare</div>
              <pre className="p-4 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-brand-text-secondary overflow-x-auto">
                <code>{`fetch('https://app.ayrshare.com/api/post', {
  method: 'POST',
  headers: {
    'Authorization': 'API_KEY xxx'
  },
  body: JSON.stringify({
    post: 'Hello world',
    platforms: ['facebook'],
    mediaUrls: ['https://...']
  })
})`}</code>
              </pre>
            </div>
            <div>
              <div className="text-xs font-mono text-success mb-2">// StackPost</div>
              <pre className="p-4 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-brand-text-secondary overflow-x-auto">
                <code>{`fetch('https://stackpost.expostacker.com.br/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_...'
  },
  body: JSON.stringify({
    text: 'Hello world',
    platforms: ['facebook'],
    media: [{ type: 'image', url: 'https://...' }]
  })
})`}</code>
              </pre>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-6">Como migrar em 4 passos</h2>
          <div className="space-y-4">
            {[
              { n: 1, t: 'Crie sua conta StackPost', d: 'Gratis, sem cartao. Conecte suas redes.' },
              { n: 2, t: 'Mapeie seus endpoints', d: 'Use a tabela acima. A maioria e direta.' },
              { n: 3, t: 'Troque a API key', d: 'Substitua o header de auth e a URL base.' },
              { n: 4, t: 'Teste e publique', d: 'Valide com alguns posts antes do switch completo.' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-4 p-4 rounded-xl bg-brand-surface/30 border border-brand-border/50">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-accent">{s.n}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{s.t}</h3>
                  <p className="text-sm text-brand-text-secondary">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ScrollReveal>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Comecar migracao <ArrowRight className="w-5 h-5" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
