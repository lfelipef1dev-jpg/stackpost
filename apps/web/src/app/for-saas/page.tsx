import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Zap, Webhook, Globe } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost for SaaS - Adicione social ao seu produto',
  description: 'Uma integracao, 15 plataformas. Multi-tenant nativo, webhooks com replay e SDK pronto em TypeScript, Python e Go.',
  alternates: { canonical: '/for-saas' },
};

const jsonLd = serviceSchema('StackPost for SaaS', 'Adicione social ao seu produto SaaS.', '/for-saas');

const features = [
  {
    icon: Zap,
    title: 'Sem manter 15 OAuth',
    desc: 'Uma integracao com o StackPost e voce publica em 15 plataformas. Esqueca renovar tokens de 15 provedores diferentes.',
  },
  {
    icon: Building2,
    title: 'Multi-tenant nativo',
    desc: 'Cada cliente seu tem um workspace isolado. Dados separados, RBAC proprio, sem vazamento entre tenants.',
  },
  {
    icon: Webhook,
    title: 'Webhooks com replay',
    desc: 'Eventos em tempo real para cada acao. Reenvie qualquer webhook que seu sistema perdeu.',
  },
  {
    icon: Globe,
    title: 'SDK pronto',
    desc: 'TypeScript, Python e Go. Tipagem completa, exemplos e documentacao atualizada.',
  },
];

export default function ForSaasPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow azul */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#8AB4F815' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#8AB4F810' }} />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: '#8AB4F808' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#8AB4F840', backgroundColor: '#8AB4F810' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: '#8AB4F8' }} />
              <span className="text-xs font-mono" style={{ color: '#8AB4F8' }}>For SaaS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'color-mix(in srgb, #8AB4F8 25%, white)' }}>
              StackPost for SaaS
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Adicione publicacao multi-rede ao seu produto sem manter 15 integracoes OAuth. Uma API, 15 plataformas, multi-tenant nativo.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="h-full p-6 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Quick start com codigo */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Quick start</h2>
          <div className="rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border/50">
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <span className="ml-2 text-xs font-mono text-brand-text-secondary">terminal</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`npm install @stackpost/sdk`}</code></pre>
            <div className="border-t border-brand-border/50">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border/50">
                <span className="text-xs font-mono text-brand-text-secondary">app.ts</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`const client = new StackPost('sk_live_...')

await client.posts.create({
  platforms: ['instagram'],
  text: 'Hello'
})`}</code></pre>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 text-center">
        <ScrollReveal>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Comecar gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
