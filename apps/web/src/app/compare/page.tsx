import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Minus, Scale } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost vs concorrentes - Comparação de API de redes sociais',
  description: 'Compare StackPost com Ayrshare, OneAll e construir do zero. Multi-tenant, MCP, AI agents, webhooks, RBAC e 15 plataformas em uma API.',
  alternates: { canonical: '/compare' },
};

const jsonLd = serviceSchema('StackPost vs concorrentes', 'Comparação de API de redes sociais.', '/compare');

const features = [
  { name: 'API unificada', stackpost: true, ayrshare: true, oneall: true, build: false },
  { name: 'Multi-tenant nativo', stackpost: true, ayrshare: 'parcial', oneall: false, build: true },
  { name: 'MCP server', stackpost: true, ayrshare: false, oneall: false, build: true },
  { name: 'AI agents (Claude, Cursor)', stackpost: true, ayrshare: false, oneall: false, build: true },
  { name: 'Webhooks com replay', stackpost: true, ayrshare: true, oneall: 'parcial', build: true },
  { name: 'RBAC (Owner/Admin/Editor/Viewer)', stackpost: true, ayrshare: false, oneall: false, build: true },
  { name: '15+ plataformas', stackpost: true, ayrshare: true, oneall: true, build: false },
  { name: 'Primeiro comentário', stackpost: true, ayrshare: true, oneall: false, build: true },
  { name: 'Analytics histórico', stackpost: true, ayrshare: true, oneall: false, build: true },
  { name: 'A/B testing', stackpost: true, ayrshare: false, oneall: false, build: true },
  { name: 'Sem custo por conta', stackpost: true, ayrshare: false, oneall: false, build: true },
  { name: 'OpenAPI 3.1', stackpost: true, ayrshare: true, oneall: false, build: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-success mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-brand-text-secondary/40 mx-auto" />;
  return <span className="text-xs text-brand-text-secondary">{value}</span>;
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#8AB4F815' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#8AB4F810' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#8AB4F840', backgroundColor: '#8AB4F810' }}>
              <Scale className="w-3.5 h-3.5" style={{ color: '#8AB4F8' }} />
              <span className="text-xs font-mono" style={{ color: '#8AB4F8' }}>Comparacao</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #8AB4F8 25%, white)' }}>
              StackPost vs alternativas
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Compare recursos de infraestrutura social. Dados baseados em documentacao publica dos concorrentes.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="overflow-x-auto rounded-2xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-surface border-b border-brand-border">
                  <th className="text-left p-4 font-semibold">Recurso</th>
                  <th className="p-4 font-semibold text-brand-accent">StackPost</th>
                  <th className="p-4 font-semibold text-brand-text-secondary">Ayrshare</th>
                  <th className="p-4 font-semibold text-brand-text-secondary">OneAll</th>
                  <th className="p-4 font-semibold text-brand-text-secondary">Build yourself</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f.name} className={i % 2 === 0 ? 'bg-brand-surface/30' : ''}>
                    <td className="p-4 text-brand-text">{f.name}</td>
                    <td className="p-4 text-center"><Cell value={f.stackpost} /></td>
                    <td className="p-4 text-center"><Cell value={f.ayrshare} /></td>
                    <td className="p-4 text-center"><Cell value={f.oneall} /></td>
                    <td className="p-4 text-center"><Cell value={f.build} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <p className="text-xs text-brand-text-secondary text-center">
            Dados coletados de documentação pública em agosto de 2026. "parcial" indica que o recurso existe com limitacoes. Verifique diretamente com cada provedor antes de decidir.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-12 text-center">
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
