import Link from 'next/link';
import { Sparkles, ArrowRight, Check, Code, Zap, Globe } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { JsonLd, serviceSchema, softwareApplicationSchema, breadcrumbSchema } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

export interface SEOPageData {
  slug: string;
  title: string;
  headline: string;
  description: string;
  category: 'platform' | 'api' | 'comparison' | 'specialized';
  features: { name: string; desc: string }[];
  endpoints?: { method: string; path: string; desc: string }[];
  faqs?: { q: string; a: string }[];
}

export function SEOPage({ data }: { data: SEOPageData }) {
  const categoryLabel = {
    platform: 'Plataforma',
    api: 'API',
    comparison: 'Comparacao',
    specialized: 'API Especializada',
  }[data.category];

  const path = `/${data.slug}`;
  const schema = data.category === 'comparison'
    ? softwareApplicationSchema(data.title, data.description, path)
    : serviceSchema(data.title, data.description, path);
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: categoryLabel, path },
  ]);

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={[schema, breadcrumb]} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: data.title, path }]} />
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Globe className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">{categoryLabel}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{data.headline}</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">{data.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
                Comecar gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/docs" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                Ver documentacao
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <ScrollReveal className="mb-8">
          <h2 className="text-2xl font-bold">Principais recursos</h2>
        </ScrollReveal>
        <StaggerGroup className="grid sm:grid-cols-2 gap-4">
          {data.features.map((f) => (
            <StaggerItem key={f.name}>
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 text-brand-text">{f.name}</h3>
                    <p className="text-sm text-brand-text-secondary">{f.desc}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Endpoints */}
      {data.endpoints && data.endpoints.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <ScrollReveal className="mb-6">
            <div className="flex items-center gap-3">
              <Code className="w-6 h-6 text-brand-accent" />
              <h2 className="text-2xl font-bold">Endpoints</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-2">
            {data.endpoints.map((ep) => (
              <ScrollReveal key={`${ep.method}-${ep.path}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : ep.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-brand-text flex-shrink-0">{ep.path}</code>
                  <span className="text-sm text-brand-text-secondary ml-auto">{ep.desc}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <ScrollReveal className="mb-6">
            <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
          </ScrollReveal>
          <div className="space-y-3">
            {data.faqs.map((faq) => (
              <ScrollReveal key={faq.q}>
                <details className="group p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-text/20 transition">
                  <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
                    {faq.q}
                    <ArrowRight className="w-4 h-4 text-brand-text-secondary group-open:rotate-90 transition" />
                  </summary>
                  <p className="mt-3 text-sm text-brand-text-secondary">{faq.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">Pronto para integrar?</h2>
          <p className="text-brand-text-secondary mb-8">Plano free. Sem cartao. API key em segundos.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
            Criar conta <Zap className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
