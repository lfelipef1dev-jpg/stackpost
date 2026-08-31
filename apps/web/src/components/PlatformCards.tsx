'use client';

import { useState } from 'react';
import { PlatformIcon } from './PlatformIcon';
import { ArrowRight, X, Check, Users, ExternalLink } from 'lucide-react';

export interface PlatformCardData {
  id: string;
  name: string;
  users: string;
  tagline: string;
  shortDescription: string;
  description: string;
  supports: string[];
  details: { label: string; value: string }[];
  metric: { value: string; label: string };
  color: string;
  docsHref: string;
  domain: string;
}

export const platforms: PlatformCardData[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    users: '3.0B',
    tagline: 'A maior rede social do mundo',
    shortDescription: 'Page posts, Reels, Stories, carrossel, live e reviews oficiais do Meta Graph.',
    description: 'Conecte paginas, perfis e grupos. Publique texto, imagem, video, carrossel, reels e links. Suporte a live, reviews, comentarios e respostas automáticas.',
    supports: ['Page posts', 'Reels', 'Stories', 'Carrossel', 'Live', 'Reviews', 'Comentarios'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, MP4' },
      { label: 'Tamanho max', value: '8 MB / 1 GB' },
      { label: 'Texto', value: '63.206 caracteres' },
      { label: 'Aspecto', value: '1.91:1, 1:1, 4:5' },
    ],
    metric: { value: '3B+', label: 'usuarios' },
    color: '#1877F2',
    docsHref: '/facebook-api',
    domain: 'business.facebook.com',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    users: '2.7B',
    tagline: 'O segundo maior buscador do planeta',
    shortDescription: 'Videos longos, Shorts, playlists e upload resumavel via Data API v3.',
    description: 'Envie videos longos e Shorts com upload resumavel. Controle titulos, descricoes, tags, categorias, madeForKids, thumbnails e legendas.',
    supports: ['Videos', 'Shorts', 'Playlists', 'Upload resumavel', 'Thumbnails', 'Legendas'],
    details: [
      { label: 'Formatos', value: 'MP4' },
      { label: 'Tamanho max', value: '128 GB' },
      { label: 'Texto', value: '5.000 caracteres' },
      { label: 'Aspecto', value: '16:9, 9:16' },
    ],
    metric: { value: '2.7B+', label: 'usuarios' },
    color: '#FF0000',
    docsHref: '/youtube-api',
    domain: 'studio.youtube.com',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    users: '2.0B',
    tagline: 'A rede do conteudo visual',
    shortDescription: 'Feed, Reels, Stories e carrossel com Meta Graph API oficial.',
    description: 'Publique feed, Reels, Stories e carrossel. Suporte a alt text, tags, colaboradores, primeiro comentario e Instagram Music API para Reels.',
    supports: ['Feed', 'Reels', 'Stories', 'Carrossel', 'Primeiro comentario', 'Music API'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, MP4' },
      { label: 'Tamanho max', value: '8 MB / 1 GB' },
      { label: 'Texto', value: '2.200 caracteres' },
      { label: 'Aspecto', value: '4:5, 1:1, 9:16' },
    ],
    metric: { value: '2B+', label: 'usuarios' },
    color: '#E4405F',
    docsHref: '/instagram-api',
    domain: 'business.instagram.com',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    users: '1.5B',
    tagline: 'Conteudo short-form em escala',
    shortDescription: 'Videos, Photo Mode e status de review pela Content API oficial.',
    description: 'Publique videos e Photo Mode com status de review, privacy levels, commercial sound, hashtags e comentarios controlados.',
    supports: ['Videos', 'Photo Mode', 'Privacy levels', 'Review status', 'Commercial sound', 'Hashtags'],
    details: [
      { label: 'Formatos', value: 'MP4, WebM' },
      { label: 'Tamanho max', value: '1 GB' },
      { label: 'Texto', value: '2.200 caracteres' },
      { label: 'Aspecto', value: '9:16' },
    ],
    metric: { value: '1.5B+', label: 'usuarios' },
    color: '#25F4EE',
    docsHref: '/tiktok-api',
    domain: 'ads.tiktok.com',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    users: '950M',
    tagline: 'B2B e employee advocacy',
    shortDescription: 'Perfil e Company Page com texto, imagem, PDF, video e link preview.',
    description: 'Publique em perfis e company pages. Suporte a texto, imagem, documento PDF, video, link previews, menções e controles de privacidade.',
    supports: ['Perfil', 'Company Page', 'PDF', 'Video', 'Link preview', 'Menções'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, GIF, PDF' },
      { label: 'Tamanho max', value: '8 MB' },
      { label: 'Texto', value: '3.000 caracteres' },
      { label: 'Aspecto', value: '1.91:1, 1:1' },
    ],
    metric: { value: '950M+', label: 'usuarios' },
    color: '#0A66C2',
    docsHref: '/linkedin-api',
    domain: 'linkedin.com/company',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    users: '800M',
    tagline: 'Stories e Spotlight para Gen Z',
    shortDescription: 'Stories e Spotlight com video vertical 9:16 e upload de ate 1 GB.',
    description: 'Publique Stories e Spotlight com video vertical 9:16, sound info e upload de ate 1 GB para audiencia jovem e engajada.',
    supports: ['Stories', 'Spotlight', 'Video 9:16', 'Sound', 'Upload 1 GB', 'Lentes'],
    details: [
      { label: 'Formatos', value: 'MP4' },
      { label: 'Tamanho max', value: '1 GB' },
      { label: 'Texto', value: '1.000 caracteres' },
      { label: 'Aspecto', value: '9:16' },
    ],
    metric: { value: '800M+', label: 'usuarios' },
    color: '#FFFC00',
    docsHref: '/snapchat-api',
    domain: 'ads.snapchat.com',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    users: '850M',
    tagline: 'Comunidades organizadas por nicho',
    shortDescription: 'Text post, link post, midia e gallery em subreddits.',
    description: 'Publique em subreddits com text post, link post, midia e gallery. Suporte a flairs e regras especificas de cada comunidade.',
    supports: ['Text post', 'Link post', 'Midia', 'Gallery', 'Subreddit', 'Flairs'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, GIF, MP4' },
      { label: 'Tamanho max', value: '20 MB' },
      { label: 'Texto', value: '300 caracteres' },
      { label: 'Aspecto', value: 'variavel' },
    ],
    metric: { value: '850M+', label: 'usuarios' },
    color: '#FF4500',
    docsHref: '/reddit-api',
    domain: 'reddit.com/r/',
  },
  {
    id: 'x',
    name: 'X / Twitter',
    users: '600M',
    tagline: 'Conversas em tempo real',
    shortDescription: 'Tweets com 4 imagens ou 1 video, quotes, links e threads.',
    description: 'Publique tweets com ate 4 imagens ou 1 video, quotes, links e threads. Analytics e suporte a API oficial v2.',
    supports: ['Tweets', '4 imagens', '1 video', 'Quote', 'Threads', '280/25k chars'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, GIF, MP4' },
      { label: 'Tamanho max', value: '5 MB / 512 MB' },
      { label: 'Texto', value: '280 caracteres' },
      { label: 'Aspecto', value: '16:9, 1:1, 4:5' },
    ],
    metric: { value: '600M+', label: 'usuarios' },
    color: '#FFFFFF',
    docsHref: '/x-api',
    domain: 'x.com/home',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    users: '500M',
    tagline: 'Descoberta visual por intenção',
    shortDescription: 'Pins em boards com imagem ou video e link de destino.',
    description: 'Crie pins em boards com imagem ou video. Suporte a link de destino, alt text e integracao com catalogos de produto.',
    supports: ['Pins', 'Boards', 'Imagem', 'Video', 'Link de destino', 'API v5'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG' },
      { label: 'Tamanho max', value: '20 MB' },
      { label: 'Texto', value: '500 caracteres' },
      { label: 'Aspecto', value: '2:3, 1:1' },
    ],
    metric: { value: '500M+', label: 'usuarios' },
    color: '#E60023',
    docsHref: '/pinterest-api',
    domain: 'pinterest.com',
  },
  {
    id: 'threads',
    name: 'Threads',
    users: '200M',
    tagline: 'Conversas publicas da Meta',
    shortDescription: 'Texto, midia, enquetes, GIFs e links com ate 10 imagens.',
    description: 'Publique texto, midia, enquetes, GIFs e links com ate 10 imagens ou 1 video. Integracao direta com ecossistema Meta.',
    supports: ['Texto', 'Imagem', 'Video', 'Poll', 'GIF', 'Link'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, MP4' },
      { label: 'Tamanho max', value: '8 MB' },
      { label: 'Texto', value: '500 caracteres' },
      { label: 'Aspecto', value: 'IG rules' },
    ],
    metric: { value: '200M+', label: 'usuarios' },
    color: '#FFFFFF',
    docsHref: '/threads-api',
    domain: 'threads.net',
  },
  {
    id: 'discord',
    name: 'Discord',
    users: '200M',
    tagline: 'Comunidades e notificacoes',
    shortDescription: 'Mensagens por webhook para servidores e canais.',
    description: 'Envie mensagens por webhook para servidores e canais. Suporte a ate 10 anexos, embeds e formatacao avancada.',
    supports: ['Webhook', 'Mensagens', '10 anexos', 'Embeds', 'Canais', 'Markdown'],
    details: [
      { label: 'Formatos', value: 'qualquer' },
      { label: 'Tamanho max', value: '25 MB' },
      { label: 'Texto', value: '2.000 caracteres' },
      { label: 'Aspecto', value: 'variavel' },
    ],
    metric: { value: '200M+', label: 'usuarios' },
    color: '#5865F2',
    docsHref: '/discord-api',
    domain: 'discord.com/app',
  },
  {
    id: 'google_business',
    name: 'Google Business',
    users: 'MILHOES',
    tagline: 'Visibilidade local no Google',
    shortDescription: 'Posts, eventos, ofertas e alertas no perfil da empresa.',
    description: 'Publique atualizacoes, eventos, ofertas e alertas no perfil da empresa. Ideal para franquias e negocios locais com multi-location.',
    supports: ['Posts locais', 'Eventos', 'Ofertas', 'Alertas', 'Reviews', 'Multi-location'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG' },
      { label: 'Tamanho max', value: '5 MB' },
      { label: 'Texto', value: '1.500 caracteres' },
      { label: 'Aspecto', value: '1:1, 4:3' },
    ],
    metric: { value: '60%', label: 'buscas locais' },
    color: '#4285F4',
    docsHref: '/google-business-api',
    domain: 'business.google.com',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    users: '30M',
    tagline: 'Rede social descentralizada',
    shortDescription: 'Textos, 4 midias, link cards e quotes pelo AT Protocol.',
    description: 'Publique textos, 4 midias, link cards e quotes pelo AT Protocol. Crescimento rapido e comunidade engajada.',
    supports: ['Texto', '4 midias', 'Link card', 'Quote', 'AT Protocol', 'Descentralizado'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, GIF, MP4, WEBM' },
      { label: 'Tamanho max', value: '1 MB / 50 MB' },
      { label: 'Texto', value: '300 caracteres' },
      { label: 'Aspecto', value: '1:1, 16:9' },
    ],
    metric: { value: '30M+', label: 'usuarios' },
    color: '#0085FF',
    docsHref: '/bluesky-api',
    domain: 'bsky.app',
  },
  {
    id: 'slack',
    name: 'Slack',
    users: '20M',
    tagline: 'Comunicacao interna das empresas',
    shortDescription: 'Mensagens por webhook para workspaces e canais.',
    description: 'Envie mensagens por webhook para workspaces e canais. Suporte a ate 4 anexos e integracao com produtos internos.',
    supports: ['Webhook', 'Mensagens', '4 anexos', 'Canais', 'Workspace', 'Notificacoes'],
    details: [
      { label: 'Formatos', value: 'qualquer' },
      { label: 'Tamanho max', value: '8 MB' },
      { label: 'Texto', value: '30.000 caracteres' },
      { label: 'Aspecto', value: 'variavel' },
    ],
    metric: { value: '20M+', label: 'usuarios' },
    color: '#4A154B',
    docsHref: '/slack-api',
    domain: 'slack.com/app',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    users: '10M',
    tagline: 'Fediverso e instancias custom',
    shortDescription: 'Status com 4 midias, privacidade, spoiler e instancia custom.',
    description: 'Publique status com 4 midias, controles de privacidade, spoiler e suporte a instancias personalizadas.',
    supports: ['Status', '4 midias', 'Privacidade', 'Spoiler', 'Instancia custom', 'Fediverso'],
    details: [
      { label: 'Formatos', value: 'JPG, PNG, GIF, WEBP, MP4' },
      { label: 'Tamanho max', value: '8 MB / 40 MB' },
      { label: 'Texto', value: '500 caracteres' },
      { label: 'Aspecto', value: 'variavel' },
    ],
    metric: { value: '10M+', label: 'usuarios' },
    color: '#6364FF',
    docsHref: '/mastodon-api',
    domain: 'mastodon.social',
  },
];

export default function PlatformCards() {
  const [selected, setSelected] = useState<PlatformCardData | null>(null);

  return (
    <section className="py-20 md:py-28 max-w-6xl mx-auto px-4 md:px-6" id="platforms">
      <div className="mb-10 md:mb-14">
        <span className="inline-block text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">
          Plataformas
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black leading-[1.05] tracking-[-0.03em] text-brand-text mb-6">
          Uma API para cada rede
        </h2>
        <p className="text-brand-text-secondary max-w-2xl text-lg">
          Clique no card para ver tudo que cada integracao entrega. 15 redes sociais em um so payload.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {platforms.map((p) => (
          <article
            key={p.id}
            className="bento-card group relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer h-full flex flex-col"
            style={{ '--platform-color': p.color } as React.CSSProperties}
            onClick={() => setSelected(p)}
          >
            <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--platform-color)]/5 to-transparent transition-all duration-300 group-hover:from-[var(--platform-color)]/10"></div>
            </div>

            {/* Mockup de browser */}
            <div className="relative bg-brand-bg border-b border-brand-border overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${p.color}15, transparent 70%)` }}></div>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-surface border-b border-brand-border relative z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <div className="flex-1 ml-2 px-2.5 py-1 rounded-md bg-brand-bg/60 text-[10px] text-brand-text-secondary font-mono truncate border border-brand-border">
                  {p.domain}
                </div>
              </div>
              <div className="relative overflow-hidden h-44 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${p.color}08 0%, transparent 60%)` }}>
                <PlatformIcon id={p.id} size={90} color={p.color} className="w-[90px] h-[90px] transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_50px_var(--platform-color)]" />
              </div>
            </div>

            {/* Conteudo embaixo */}
            <div className="relative p-5 md:p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="font-display text-xl md:text-2xl font-black leading-[1.1] tracking-[-0.02em] mb-2 transition-colors duration-200" style={{ color: p.color }}>
                  {p.name}
                </h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-3">
                  {p.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="border-l-2 pl-2" style={{ borderColor: `${p.color}60` }}>
                  <span className="block text-base font-black font-mono leading-none" style={{ color: p.color }}>{p.metric.value}</span>
                  <span className="text-[9px] text-brand-text-secondary mt-0.5 block truncate">{p.metric.label}</span>
                </div>
                <div className="border-l-2 border-brand-border/40 pl-2">
                  <span className="block text-base font-black text-brand-text font-mono leading-none">{p.details[0].value}</span>
                  <span className="text-[9px] text-brand-text-secondary mt-0.5 block truncate">{p.details[0].label}</span>
                </div>
                <div className="border-l-2 border-brand-border/40 pl-2">
                  <span className="block text-base font-black text-brand-text font-mono leading-none">{p.details[1].value}</span>
                  <span className="text-[9px] text-brand-text-secondary mt-0.5 block truncate">{p.details[1].label}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">
                <button className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 font-bold text-xs rounded-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.3)]" style={{ backgroundColor: p.color, color: '#0A0A0A' }}>
                  Ver integracao <ArrowRight className="w-3 h-3 ml-1" />
                </button>
                <a
                  href={p.docsHref}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 border border-brand-border text-brand-text font-semibold text-xs rounded-lg hover:border-brand-accent/60 hover:text-brand-accent transition-colors bg-brand-surface/40"
                >
                  Docs <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes de ${selected.name}`}
        >
          <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm" aria-hidden="true" onClick={() => setSelected(null)}></div>
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-brand-border bg-brand-surface shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 md:p-10 transform transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-elevated text-brand-text hover:text-brand-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border border-brand-border"
                style={{ backgroundColor: `${selected.color}15` }}
              >
                <PlatformIcon id={selected.id} size={40} color={selected.color} className="w-10 h-10 drop-shadow-[0_0_30px_var(--platform-color)]" style={{ '--platform-color': selected.color } as React.CSSProperties} />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-brand-text" style={{ color: selected.color }}>
                  {selected.name}
                </h3>
                <p className="text-sm text-brand-text-secondary">{selected.tagline}</p>
              </div>
            </div>

            {/* Mockup de browser */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border border-brand-border">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-surface/80 border-b border-brand-border">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <div className="flex-1 ml-2 px-2.5 py-1 rounded-md bg-brand-bg/60 text-[10px] text-brand-text-secondary font-mono truncate border border-brand-border">
                  {selected.domain}
                </div>
              </div>
              <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${selected.color}15 0%, transparent 60%)` }}>
                <PlatformIcon id={selected.id} size={80} color={selected.color} className="w-20 h-20 drop-shadow-[0_0_50px_var(--platform-color)]" style={{ '--platform-color': selected.color } as React.CSSProperties} />
              </div>
            </div>

            <p className="text-brand-text-secondary leading-relaxed mb-6">{selected.description}</p>

            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">O que e possivel publicar</h4>
              <div className="flex flex-wrap gap-2">
                {selected.supports.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border bg-brand-elevated/60 text-xs text-brand-text">
                    <Check className="w-3 h-3 text-success" /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">Limites tecnicos</h4>
              <div className="grid grid-cols-2 gap-3">
                {selected.details.map((d) => (
                  <div key={d.label} className="p-3 rounded-xl bg-brand-elevated/40 border border-brand-border">
                    <span className="text-[10px] text-brand-text-secondary uppercase tracking-wider">{d.label}</span>
                    <span className="block text-sm font-semibold text-brand-text mt-1">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-brand-border bg-brand-elevated/40 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-brand-accent" />
                <div>
                  <span className="block text-2xl font-black text-brand-accent font-mono leading-none">{selected.metric.value}</span>
                  <span className="text-xs text-brand-text-secondary">{selected.metric.label}</span>
                </div>
              </div>
              <a
                href={selected.docsHref}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105"
                style={{ backgroundColor: selected.color, color: '#0A0A0A' }}
              >
                Conectar conta <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <a
              href={selected.docsHref}
              className="inline-flex items-center justify-center w-full min-h-[48px] px-4 py-2 border border-brand-border text-brand-text font-semibold text-sm rounded-lg hover:border-brand-accent/60 hover:text-brand-accent transition-colors bg-brand-surface/40"
            >
              Ver documentacao <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
