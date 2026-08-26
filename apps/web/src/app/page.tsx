import Link from 'next/link';
import { Layers, Calendar, BarChart3, Zap, Shield, Globe, ArrowRight, MessageSquare, Upload, Webhook, Key, Building2, Sparkles, Clock, RefreshCw, FileCheck, Hash } from 'lucide-react';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';

const features = [
  {
    category: 'Publicacao',
    items: [
      { icon: Layers, title: 'API de Postagem', description: 'Crie posts, rascunhos e fluxos de publicacao em multiplas contas e plataformas.' },
      { icon: Calendar, title: 'Agendamento', description: 'Programe conteudo com campos especificos por plataforma sob controle.' },
      { icon: Zap, title: 'Postagem em massa', description: 'Crie muitos posts de uma vez via CSV ou workflows via API.' },
      { icon: MessageSquare, title: 'Primeiro comentario', description: 'Poste comentarios automaticos quando o conteudo for ao ar.' },
    ],
  },
  {
    category: 'Midia e uploads',
    items: [
      { icon: Upload, title: 'Upload de midia', description: 'Envie imagens e videos para fluxos de publicacao com validacao por plataforma.' },
      { icon: Globe, title: 'Upload por URL', description: 'O StackPost busca a midia de uma URL publica e prepara para postagem.' },
      { icon: Shield, title: 'Midia cross-platform', description: 'Reutilize midia entre plataformas respeitando regras de cada rede.' },
    ],
  },
  {
    category: 'Contas e conexao',
    items: [
      { icon: Key, title: 'OAuth oficial', description: 'Conecte contas atraves de fluxos oficiais de cada plataforma.' },
      { icon: Building2, title: 'Contas por time', description: 'Mantenha contas conectadas no workspace certo: cliente, marca ou projeto.' },
      { icon: RefreshCw, title: 'Sem limite artificial', description: 'Escale contas conforme seu modelo real de clientes. Sem cobranca por conta.' },
    ],
  },
  {
    category: 'Analytics e historico',
    items: [
      { icon: BarChart3, title: 'Analytics unificado', description: 'Leia impressoes, views, curtidas, comentarios e dados demograficos por plataforma.' },
      { icon: Clock, title: 'Importacao de historico', description: 'Importe posts passados para uma timeline unificada no seu dashboard.' },
      { icon: FileCheck, title: 'Relatorios por cliente', description: 'Construa views de analytics em torno de times, clientes, marcas ou organizacoes.' },
    ],
  },
  {
    category: 'Comentarios e engajamento',
    items: [
      { icon: MessageSquare, title: 'API de comentarios', description: 'Leia, responda e gerencie comentarios onde a plataforma suportar.' },
      { icon: Hash, title: 'Workflows por plataforma', description: 'Instagram, Facebook, YouTube e outras com diferencas tratadas em uma camada.' },
      { icon: AlertCircle, title: 'Erros faceis de debugar', description: 'Exponha motivos reais de falha da plataforma em vez de generico "failed".' },
    ],
  },
  {
    category: 'Multi-tenant e automacao',
    items: [
      { icon: Building2, title: 'Multi-tenant nativo', description: 'Modele clientes, times, marcas e localidades como workspaces separados.' },
      { icon: Webhook, title: 'Webhooks em tempo real', description: 'Receba eventos quando posts publicam, falham, contas conectam ou workflows mudam.' },
      { icon: Sparkles, title: 'API para AI agents', description: 'Deixe ferramentas de IA criar rascunhos, agendar e publicar apos aprovacao.' },
    ],
  },
];

import { AlertCircle } from 'lucide-react';

export default function Home() {
  const featuredPlatforms = PLATFORMS.slice(0, 15);

  return (
    <main className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <Link href="/plans" className="hover:text-brand-text">Planos</Link>
            <Link href="/login" className="hover:text-brand-text">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-brand-accent text-sm font-mono tracking-wider uppercase">ExpoStacker</span>
          <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-6 leading-tight">
            Uma API. <span className="text-brand-accent">Todas as redes.</span>
          </h1>
          <p className="text-brand-text-secondary text-xl mb-10 max-w-2xl mx-auto">
            Escreva uma vez, publique em qualquer lugar. Uma integracao para 15+ plataformas em vez de 15 fluxos OAuth e 15 conjuntos de breaking changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition"
            >
              Comecar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-elevated transition"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {featuredPlatforms.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-brand-surface border border-brand-border text-center hover:border-brand-text/30 transition"
            >
              <div className="mx-auto mb-1.5 flex justify-center"><PlatformIcon id={p.id} size={22} color={p.color} /></div>
              <div className="text-brand-text text-xs font-medium">{p.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Tudo que seu produto precisa</h2>
        <p className="text-brand-text-secondary text-center mb-12 max-w-2xl mx-auto">
          Um mapa product-led dos workflows que o StackPost pode rodar, agrupado por como builders avaliam infraestrutura de API de redes sociais.
        </p>

        {features.map((group) => (
          <div key={group.category} className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-brand-accent">{group.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((f) => (
                <div
                  key={f.title}
                  className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-text/20 transition"
                >
                  <f.icon className="w-7 h-7 text-brand-accent mb-4" />
                  <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
                  <p className="text-sm text-brand-text-secondary">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-brand-border">
        <h2 className="text-3xl font-bold text-center mb-12">Feito diferente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Sem preco por seat', desc: 'Voce paga o mesmo todo mes.' },
            { title: 'Sem limite artificial', desc: 'Conecte quantas contas precisar.' },
            { title: 'Multi-tenant por design', desc: 'Workspaces de clientes separados.' },
            { title: 'Erros verbosos', desc: 'Debug posts falhados sem chutar.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-brand-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center border-t border-brand-border">
        <h2 className="text-3xl font-bold mb-6">Pronto para escalar seu conteudo?</h2>
        <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
          Teste de graca. Nao precisa de cartao. Mude de plano quando quiser.
        </p>
        <Link
          href="/plans"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition"
        >
          Ver planos e precos <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-brand-border bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-brand-text-secondary text-sm">© 2026 StackPost. Feito por ExpoStacker.</div>
          <div className="flex gap-4 text-sm text-brand-text-secondary">
            <Link href="/plans" className="hover:text-brand-text">Planos</Link>
            <Link href="/login" className="hover:text-brand-text">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
