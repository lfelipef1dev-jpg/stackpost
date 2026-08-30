import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, FileText, Rocket, BookOpen, Activity, Palette, Info } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog — Atualizações, tutoriais e novidades | StackPost',
  description:
    'Blog do StackPost: atualizações de produto, tutoriais de integração e novidades sobre a API unificada de redes sociais, MCP server, legendas com IA, webhooks e analytics histórico.',
  alternates: { canonical: '/blog' },
};

const posts = [
  {
    title: 'StackPost: a API unificada de redes sociais',
    date: '2026-08-26',
    excerpt:
      'Por que construímos uma alternativa ao bundle.social com 15 plataformas, MCP server e legendas geradas por IA.',
    tag: 'Anúncio',
  },
  {
    title: 'Como publicar em 15 plataformas com uma única API',
    date: '2026-08-25',
    excerpt:
      'Tutorial completo: do cadastro ao primeiro post em Instagram, TikTok e LinkedIn em poucos minutos.',
    tag: 'Tutorial',
  },
  {
    title: 'MCP server: agentes de IA publicam posts',
    date: '2026-08-24',
    excerpt:
      'Como Claude e Cursor podem criar e agendar publicações via Model Context Protocol sem código adicional.',
    tag: 'IA',
  },
  {
    title: 'Analytics histórico: o diferencial do StackPost',
    date: '2026-08-23',
    excerpt:
      'Por que armazenamos analytics indefinidamente e como isso fortalece sua estratégia de conteúdo.',
    tag: 'Produto',
  },
  {
    title: 'Webhooks com replay: nunca perca um evento',
    date: '2026-08-22',
    excerpt:
      'Como funciona o sistema de webhooks com HMAC-SHA256, retentativas automáticas e replay manual.',
    tag: 'Dev',
  },
  {
    title: 'A/B testing para redes sociais',
    date: '2026-08-21',
    excerpt:
      'Crie variações de legenda, compare a performance e descubra a melhor versão com dados concretos.',
    tag: 'Produto',
  },
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
            <p className="text-lg text-brand-text-secondary">Atualizações, tutoriais e novidades sobre a plataforma.</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post, i) => {
            const formattedDate = new Date(post.date + 'T00:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            return (
            <ScrollReveal key={post.title} delay={i * 0.05}>
              <article className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-brand-accent/10 text-brand-accent">{post.tag}</span>
                  <time dateTime={post.date} className="text-xs text-brand-text-secondary">{formattedDate}</time>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition">{post.title}</h2>
                <p className="text-sm text-brand-text-secondary mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm text-brand-accent" aria-label={`Ler mais sobre ${post.title}`}>
                  Ler mais <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </article>
            </ScrollReveal>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
