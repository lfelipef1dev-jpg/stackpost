import Link from 'next/link';
import type { Metadata } from 'next';
import { Info, Globe, Github, Linkedin, Twitter } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre o StackPost - API unificada de redes sociais',
  description: 'StackPost e uma API unificada de redes sociais para SaaS, agencias e AI agents. Uma integracao, 15 plataformas, 114 endpoints. Feito no Brasil pela ExpoStacker.',
  alternates: { canonical: '/about' },
};

const organizationDetailsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://stackpost.expostacker.com.br/#organization',
  name: 'StackPost',
  url: 'https://stackpost.expostacker.com.br',
  founder: {
    '@type': 'Organization',
    name: 'ExpoStacker',
    url: 'https://expostacker.com.br',
    description: 'Estudio de produtos digitais e automacao. 12 produtos no ar incluindo NEXUS IA, SEEDS e StackPost.',
  },
  foundingDate: '2026',
  knowsAbout: ['Social Media API', 'Multi-tenant SaaS', 'MCP server', 'AI agents', 'Cross-posting', 'Analytics'],
  sameAs: [
    'https://github.com/expostacker',
    'https://instagram.com/expostacker',
    'https://linkedin.com/company/expostacker',
    'https://x.com/expostacker',
    'https://expostacker.com.br',
  ],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={organizationDetailsJsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Sobre', path: '/about' }]} />
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Info className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Sobre</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre o StackPost</h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              StackPost e uma API unificada de redes sociais para SaaS, agencias e AI agents.
              Uma integracao, 15 plataformas, 114 endpoints.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">Nossa missao</h2>
            <p className="text-sm text-brand-text-secondary">
              Democratizar o acesso a redes sociais via API. Desenvolvedores e times nao deveriam
              ter que integrar 15 APIs diferentes. Uma integracao, uma chave, uma API.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">Stack tecnica</h2>
            <ul className="space-y-1.5 text-sm text-brand-text-secondary">
              <li>- Backend: Node.js + Fastify</li>
              <li>- Banco: PostgreSQL 16 + Drizzle ORM</li>
              <li>- Cache/Fila: Redis 7 + BullMQ</li>
              <li>- Storage: Cloudflare R2 (zero egress)</li>
              <li>- Frontend: Next.js 15 + App Router</li>
              <li>- Deploy: Docker + Coolify</li>
              <li>- CDN: Cloudflare</li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">ExpoStacker</h2>
            <p className="text-sm text-brand-text-secondary mb-4">
              StackPost e parte do ecossistema ExpoStacker, junto com NEXUS IA (backend multi-provider de AI)
              e SEEDS (comunidade de empreendedorismo). Feito no Brasil, para o mundo.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="https://github.com/expostacker" className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="https://linkedin.com/company/expostacker" className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a href="https://x.com/expostacker" className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4" /> X
              </a>
              <a href="https://expostacker.com.br" className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4" /> expostacker.com.br
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">Transparencia (E-E-A-T)</h2>
            <ul className="space-y-1.5 text-sm text-brand-text-secondary">
              <li>- Empresa: ExpoStacker Studio</li>
              <li>- Fundada: 2026</li>
              <li>- Sede: Brasil</li>
              <li>- Produtos no ar: 12 (incluindo NEXUS IA, SEEDS, StackPost)</li>
              <li>- Codigo: publico no GitHub</li>
              <li>- Deploy: Cloudflare Workers + Pages</li>
              <li>- Banco: Supabase (PostgreSQL 16)</li>
            </ul>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
