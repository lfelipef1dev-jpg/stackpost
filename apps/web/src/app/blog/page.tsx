import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, FileText, Rocket, BookOpen, Activity, Palette, Info } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog - Atualizacoes, tutoriais e novidades',
  description: 'Blog do StackPost: atualizacoes de produto, tutoriais de integracao, novidades sobre API de redes sociais, MCP server, AI caption, webhooks e analytics historico.',
  alternates: { canonical: '/blog' },
};

const posts = [
  { title: 'StackPost: a API unificada de redes sociais', date: '2026-08-26', excerpt: 'Por que construimos uma alternativa ao bundle.social com 15 plataformas, MCP server e AI caption.', tag: 'Anuncio' },
  { title: 'Como publicar em 15 plataformas com uma API', date: '2026-08-25', excerpt: 'Tutorial completo: do cadastro ao primeiro post em Instagram, TikTok e LinkedIn.', tag: 'Tutorial' },
  { title: 'MCP server: AI agents publicam posts', date: '2026-08-24', excerpt: 'Como Claude e Cursor podem criar e agendar posts via Model Context Protocol.', tag: 'AI' },
  { title: 'Analytics historico: o diferencial do StackPost', date: '2026-08-23', excerpt: 'Por que guardamos analytics indefinidamente e como isso ajuda sua estrategia.', tag: 'Produto' },
  { title: 'Webhooks com replay: nunca perca um evento', date: '2026-08-22', excerpt: 'Como funciona o sistema de webhooks com HMAC-SHA256, retries e replay manual.', tag: 'Dev' },
  { title: 'A/B testing para redes sociais', date: '2026-08-21', excerpt: 'Crie variacoes de caption e compare performance para encontrar a melhor versao.', tag: 'Produto' },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <FileText className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog do StackPost</h1>
            <p className="text-lg text-brand-text-secondary">Atualizacoes, tutoriais e novidades.</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <ScrollReveal key={post.title} delay={i * 0.05}>
              <article className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-brand-accent/10 text-brand-accent">{post.tag}</span>
                  <span className="text-xs text-brand-text-secondary">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition">{post.title}</h2>
                <p className="text-sm text-brand-text-secondary mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm text-brand-accent">
                  Ler mais <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
