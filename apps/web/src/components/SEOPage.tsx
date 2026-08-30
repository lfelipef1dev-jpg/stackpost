import Link from 'next/link';
import { PlatformIcon } from './PlatformIcon';
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

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#25F4EE',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  x: '#FFFFFF',
  threads: '#FFFFFF',
  pinterest: '#E60023',
  reddit: '#FF4500',
  bluesky: '#0085FF',
  mastodon: '#6364FF',
  discord: '#5865F2',
  slack: '#4A154B',
  google_business: '#4285F4',
  'google-business': '#4285F4',
  snapchat: '#FFFC00',
};

function getBrandColor(slug: string): string | undefined {
  const id = slug.replace(/-api$|-upload$|-comments$|-content-posting$|-music$/i, '');
  return platformColors[id];
}

export function SEOPage({ data }: { data: SEOPageData }) {
  const categoryLabel = {
    platform: 'Plataforma',
    api: 'API',
    comparison: 'Comparação',
    specialized: 'API Especializada',
  }[data.category];

  const brandColor = getBrandColor(data.slug);
  const brandId = data.slug.replace(/-api$|-upload$|-comments$|-content-posting$|-music$/i, '');

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
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {brandColor && (
            <>
              <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-700" style={{ background: `${brandColor}15` }} />
              <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-700" style={{ background: `${brandColor}10` }} />
            </>
          )}
        </div>
        <div className="max-w-5xl mx-auto relative">
          <FadeIn>
            <div className="grid md:grid-cols-[1fr_0.5fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: brandColor ? `${brandColor}40` : undefined, backgroundColor: brandColor ? `${brandColor}10` : undefined }}>
                  {brandColor ? (
                    <PlatformIcon id={brandId} size={14} color={brandColor} />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-brand-accent" />
                  )}
                  <span className="text-xs font-mono" style={{ color: brandColor || 'var(--brand-accent)' }}>{categoryLabel}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: brandColor ? `color-mix(in srgb, ${brandColor} 30%, white)` : undefined }}>{data.headline}</h1>
                <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">{data.description}</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition" style={{ backgroundColor: brandColor || 'var(--brand-accent)', color: '#0A0A0A' }}>
                    Começar grátis <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/docs" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                    Ver documentação
                  </Link>
                </div>
              </div>
              {brandColor && (
                <div className="hidden md:flex items-center justify-center">
                  <div
                    className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-3xl flex items-center justify-center border"
                    style={{ borderColor: `${brandColor}30`, background: `radial-gradient(circle at 50% 50%, ${brandColor}20, transparent 70%)`, boxShadow: `0 0 80px -20px ${brandColor}40` }}
                  >
                    <PlatformIcon id={brandId} size={120} color={brandColor} className="w-28 h-28 lg:w-36 lg:h-36 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]" />
                  </div>
                </div>
              )}
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
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full" style={{ borderColor: brandColor ? `${brandColor}20` : undefined }}>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
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
          <p className="text-brand-text-secondary mb-8">Plano free. Sem cartão. API key em segundos.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
            Criar conta <Zap className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
