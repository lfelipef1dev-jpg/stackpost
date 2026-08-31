import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeftRight, Check } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Migrar de Ayrshare para StackPost - Guia completo',
  description: 'Guia de migracao de Ayrshare Social API para StackPost. Mapeamento de endpoints, payload e autenticacao.',
  alternates: { canonical: '/migrate-from-ayrshare' },
};

const jsonLd = serviceSchema('Migrar de Ayrshare', 'Guia de migracao Ayrshare -> StackPost.', '/migrate-from-ayrshare');

const mapping = [
  { ay: 'POST /api/post', sp: 'POST /api/posts' },
  { ay: 'GET /api/posts', sp: 'GET /api/posts' },
  { ay: 'DELETE /api/post/{id}', sp: 'DELETE /api/posts/{id}' },
  { ay: 'PUT /api/post/{id}', sp: 'PUT /api/posts/{id}' },
  { ay: 'GET /api/analytics/{id}', sp: 'GET /api/analytics/posts/{id}' },
  { ay: 'GET /api/user', sp: 'GET /api/me' },
  { ay: 'GET /api/profiles', sp: 'GET /api/social-accounts' },
  { ay: 'POST /api/profiles/link', sp: 'POST /api/oauth/{platform}' },
];

const advantages = [
  'Sem custo por perfil conectado (Ayrshare cobra por perfil)',
  'Pague pelo uso, nao por assento',
  '15 plataformas incluidas em todos os planos',
  'MCP server nativo para AI agents',
  'Suporte em portugues (PT-BR)',
  'Pagamento em reais via PIX',
];

export default function MigrateFromAyrsharePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#FF6B6B15' }} />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B10' }}>
              <ArrowLeftRight className="w-3.5 h-3.5" style={{ color: '#FF6B6B' }} />
              <span className="text-xs font-mono" style={{ color: '#FF6B6B' }}>{`Ayrshare -> StackPost`}</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #FF6B6B 25%, white)' }}>
              Migrar de Ayrshare
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Mapeamento direto de endpoints. Troque em horas, nao semanas.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-6">Por que sair do Ayrshare?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {advantages.map(a => (
              <div key={a} className="flex items-start gap-3 p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{a}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-6">Mapeamento de endpoints</h2>
          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-surface border-b border-brand-border">
                  <th className="text-left p-4 font-semibold text-red-400">Ayrshare</th>
                  <th className="text-left p-4 font-semibold text-success">StackPost</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface/30' : ''}>
                    <td className="p-4 font-mono text-xs text-brand-text-secondary">{m.ay}</td>
                    <td className="p-4 font-mono text-xs text-success">{m.sp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Exemplo de codigo</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-mono text-red-400 mb-2">// Ayrshare</div>
              <pre className="p-4 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-brand-text-secondary overflow-x-auto">
                <code>{`fetch('https://app.ayrshare.com/api/post', {
  headers: { 'Authorization': 'API_KEY xxx' },
  body: JSON.stringify({
    post: 'Hello',
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
  headers: { 'Authorization': 'Bearer sk_live_...' },
  body: JSON.stringify({
    text: 'Hello',
    platforms: ['facebook'],
    media: [{ type: 'image', url: 'https://...' }]
  })
})`}</code>
              </pre>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ScrollReveal>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform">
            Migrar agora <ArrowRight className="w-5 h-5" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
