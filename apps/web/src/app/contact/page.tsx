import type { Metadata } from 'next';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Contato - Fale com o time do StackPost',
  description: 'Entre em contato com o time do StackPost para suporte, vendas, parcerias ou duvidas sobre a API de redes sociais.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Contato', path: '/contact' }]} />
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Mail className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Contato</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fale conosco</h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              Suporte, vendas, parcerias ou duvidas sobre a API. Estamos aqui para ajudar.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <ScrollReveal>
            <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border text-center h-full">
              <Mail className="w-8 h-8 text-brand-accent mx-auto mb-3" />
              <h2 className="font-semibold mb-1">Email</h2>
              <p className="text-sm text-brand-text-secondary">suporte@expostacker.com.br</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border text-center h-full">
              <MessageCircle className="w-8 h-8 text-brand-accent mx-auto mb-3" />
              <h2 className="font-semibold mb-1">Discord</h2>
              <p className="text-sm text-brand-text-secondary">Comunidade StackPost</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border text-center h-full">
              <Send className="w-8 h-8 text-brand-accent mx-auto mb-3" />
              <h2 className="font-semibold mb-1">Vendas</h2>
              <p className="text-sm text-brand-text-secondary">Enterprise e custom</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <form className="space-y-4 p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <div>
              <label className="block text-sm text-brand-text-secondary mb-1">Nome</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-brand-text focus:border-brand-accent outline-none" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm text-brand-text-secondary mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-brand-text focus:border-brand-accent outline-none" placeholder="voce@email.com" />
            </div>
            <div>
              <label className="block text-sm text-brand-text-secondary mb-1">Mensagem</label>
              <textarea rows={4} className="w-full px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-brand-text focus:border-brand-accent outline-none" placeholder="Como podemos ajudar?"></textarea>
            </div>
            <button type="submit" className="w-full px-6 py-3 rounded-lg bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
              Enviar mensagem
            </button>
          </form>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
