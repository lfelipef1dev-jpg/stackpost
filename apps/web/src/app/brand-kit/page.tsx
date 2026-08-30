import type { Metadata } from 'next';
import { Palette } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Brand Kit — Logo, cores e assets do StackPost',
  description:
    'Brand kit oficial do StackPost: logo, paleta de cores, tipografia e assets para parceiros, integradores e imprensa.',
  alternates: { canonical: '/brand-kit' },
};

export default function BrandKitPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Brand Kit', path: '/brand-kit' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Palette className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Brand Kit</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Brand Kit</h1>
            <p className="text-lg text-brand-text-secondary">
              Identidade visual oficial do StackPost: logo, paleta de cores, tipografia e assets
              para parceiros e integradores.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
        {/* Logo */}
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">Logo</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center">
                  <span className="text-brand-bg font-bold">S</span>
                </div>
                <span className="text-2xl font-bold">StackPost</span>
              </div>
              <p className="text-xs text-brand-text-secondary">Variante escura (padrão)</p>
            </div>
            <div className="p-8 rounded-xl bg-white border border-brand-border flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-2xl font-bold text-brand-bg">StackPost</span>
              </div>
              <p className="text-xs text-brand-text-secondary">Variante clara (inversa)</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Colors */}
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">Cores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'brand-bg', hex: '#0A0A0A', desc: 'Fundo' },
              { name: 'brand-surface', hex: '#1A1A1A', desc: 'Superfície' },
              { name: 'brand-accent', hex: '#8AB4F8', desc: 'Destaque' },
              { name: 'brand-text', hex: '#E6E6E6', desc: 'Texto' },
            ].map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border"
              >
                <div
                  className="w-full h-16 rounded-lg mb-3"
                  style={{ backgroundColor: c.hex }}
                  role="img"
                  aria-label={`${c.desc} — ${c.hex}`}
                />
                <p className="font-mono text-sm text-brand-text">{c.hex}</p>
                <p className="text-xs text-brand-text-secondary">
                  {c.name} — {c.desc}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Typography */}
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">Tipografia</h2>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border space-y-4">
            <div>
              <p className="text-xs text-brand-text-secondary mb-1">Display</p>
              <p className="text-3xl font-bold">Space Grotesk</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary mb-1">Body</p>
              <p className="text-lg">Inter</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-secondary mb-1">Mono</p>
              <p className="text-lg font-mono">JetBrains Mono</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
