'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlatformIcon } from './PlatformIcon';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: string;
  name: string;
  users: string;
  hook: string;
  pain: string;
  solution: string;
  outcome: string;
  features: string[];
  metric: { value: string; label: string };
  color: string;
}

const slides: Slide[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    users: '3.0B',
    hook: 'Alcance 3 bilhoes de pessoas com um unico endpoint.',
    pain: 'Gerenciar paginas, perfis, grupos, Reels e Stories separadamente gera retrabalho e perde oportunidade.',
    solution: 'Publique em todos os formatos do Meta Graph: posts, Reels, Stories, carrossel e live.',
    outcome: 'Uma integracao so para toda a presenca da sua marca no maior ecossistema social.',
    features: ['Page posts', 'Reels', 'Stories', 'Carrossel', 'Live'],
    metric: { value: '3B+', label: 'pessoas ativas' },
    color: '#1877F2',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    users: '2.7B',
    hook: 'O segundo maior buscador do planeta publicando para voce.',
    pain: 'Fazer upload de videos longos e Shorts manualmente atrasa escalas e quebra fluxos de conteudo.',
    solution: 'Envie videos, Shorts, playlists e thumbnails com upload resumavel e controle total via Data API v3.',
    outcome: 'Seu conteudo no YouTube sobe automaticamente, no horario certo, sem depender de uploads manual.',
    features: ['Videos longos', 'Shorts', 'Playlists', 'Thumbnails'],
    metric: { value: '2.7B+', label: 'usuarios logados' },
    color: '#FF0000',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    users: '2.0B',
    hook: 'Feed, Reels e Stories em um so payload.',
    pain: 'Cada formato do Instagram exige uma integracao diferente: feed, Reels, Stories, carrossel. Isso multiplica o trabalho.',
    solution: 'Um unico envio para publicar em todas as superficies do Instagram, com alt text, colaboradores, music e primeiro comentario.',
    outcome: 'Produza mais conteudo visual em menos tempo e acompanhe tudo pelo mesmo dashboard.',
    features: ['Feed', 'Reels', 'Stories', 'Carrossel'],
    metric: { value: '2B+', label: 'contas ativas' },
    color: '#E4405F',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    users: '1.5B',
    hook: 'Publique short videos onde a atencao do mundo esta.',
    pain: 'TikTok exige fluxos proprios: video, Photo Mode, sons, review status. Sem automacao, voce fica fora da trend.',
    solution: 'API oficial de conteudo com suporte a Video, Photo Mode, hashtags, privacy e commercial sound.',
    outcome: 'Entre nas trends no momento certo, em escala, sem depender de postagem manual no celular.',
    features: ['Videos', 'Photo Mode', 'Hashtags', 'Commercial sound'],
    metric: { value: '1.5B+', label: 'usuarios ativos' },
    color: '#25F4EE',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    users: '950M',
    hook: 'B2B que converte em um so clique.',
    pain: 'Empresas perdem leads porque nao conseguem publicar consistentemente em perfis e company pages.',
    solution: 'Publique em perfis e company pages com texto, imagem, PDF, video e link preview. Ideal para employee advocacy e thought leadership.',
    outcome: 'Sua marca no LinkedIn ganha consistencia, visibilidade e gera oportunidades comerciais.',
    features: ['Perfil', 'Company Page', 'PDF', 'Video'],
    metric: { value: '950M+', label: 'profissionais' },
    color: '#0A66C2',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    users: '800M',
    hook: 'Stories e Spotlight para a geracao que mais engaja.',
    pain: 'A Gen Z nao esta no mesmo lugar que as outras geracoes. Se voce nao entrega Stories verticais, nao existe para eles.',
    solution: 'Publique Stories e Spotlight com video 9:16, upload de ate 1 GB e som integrado.',
    outcome: 'Chegue a 800 milhoes de usuarios com conteudo autentico, leve e no formato nativo deles.',
    features: ['Stories', 'Spotlight', 'Video 9:16', 'Sound'],
    metric: { value: '800M+', label: 'usuarios ativos' },
    color: '#FFFC00',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    users: '850M',
    hook: 'Comunidades de nicho que ja discutem o que voce vende.',
    pain: 'Reddit e o maior forum da internet, mas postar em subreddits exige respeitar regras, flairs e cultura de cada comunidade.',
    solution: 'Publique text post, link post, midia e gallery em subreddits com controle de flairs e regras.',
    outcome: 'Conecte sua marca com comunidades autenticas que realmente se importam com o seu nicho.',
    features: ['Text post', 'Link post', 'Midia', 'Gallery'],
    metric: { value: '850M+', label: 'usuarios ativos' },
    color: '#FF4500',
  },
  {
    id: 'x',
    name: 'X / Twitter',
    users: '600M',
    hook: 'Conversas em tempo real, de 280 a 25 mil caracteres.',
    pain: 'X e o lugar das noticias e threads, mas postar, responder e acompanhar manualmente nao escala.',
    solution: 'Publique tweets, 4 imagens, 1 video, quotes, links e threads completas pela API oficial v2.',
    outcome: 'Fique presente nos debates que importam para sua marca, em tempo real e sem esforco manual.',
    features: ['Tweets', '4 imagens', '1 video', 'Threads'],
    metric: { value: '600M+', label: 'usuarios ativos' },
    color: '#FFFFFF',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    users: '500M',
    hook: 'Descoberta visual com intencao de compra.',
    pain: 'Pinterest e uma maquina de trafego organico, mas criar pins manualmente e lento e inconsistente.',
    solution: 'Crie pins em boards com imagem, video, link de destino e alt text. Integracao com catalogos de produto.',
    outcome: 'Transforme ideias em vendas com conteudo que as pessoas salvam, compartilham e compram.',
    features: ['Pins', 'Boards', 'Imagem', 'Video'],
    metric: { value: '500M+', label: 'usuarios ativos' },
    color: '#E60023',
  },
  {
    id: 'threads',
    name: 'Threads',
    users: '200M',
    hook: 'A nova rede da Meta para conversas publicas.',
    pain: 'Threads cresce rapido, mas exige uma integracao separada dentro do ecossistema Meta.',
    solution: 'Publique texto, midia, enquetes, GIFs e links. Ate 10 imagens ou 1 video no ecossistema Meta.',
    outcome: 'Esteja na plataforma em ascensao sem somar complexidade tecnica ao seu stack.',
    features: ['Texto', 'Imagem', 'Video', 'Poll'],
    metric: { value: '200M+', label: 'usuarios ativos' },
    color: '#FFFFFF',
  },
  {
    id: 'discord',
    name: 'Discord',
    users: '200M',
    hook: 'Comunidades e notificacoes no servidor da sua marca.',
    pain: 'Comunidades de fas e times internos vivem no Discord, mas notificar todo mundo e manual.',
    solution: 'Envie mensagens por webhook para servidores e canais com ate 10 anexos, embeds e formatacao avancada.',
    outcome: 'Automatize alertas, lancamentos e updates direto no canal onde seu publico esta engajado.',
    features: ['Webhook', 'Mensagens', '10 anexos', 'Embeds'],
    metric: { value: '200M+', label: 'usuarios ativos' },
    color: '#5865F2',
  },
  {
    id: 'google_business',
    name: 'Google Business',
    users: 'MILHOES',
    hook: 'Apareca nas buscas locais que mais convertem.',
    pain: 'Negocios locais perdem clientes porque nao atualizam o perfil do Google com ofertas, eventos e posts.',
    solution: 'Publique atualizacoes, eventos, ofertas e alertas no Google Business Profile automaticamente.',
    outcome: 'Seja encontrado no Google Maps e Search pelos clientes que estao procurando agora.',
    features: ['Posts locais', 'Eventos', 'Ofertas', 'Alertas'],
    metric: { value: '60%', label: 'das buscas locais' },
    color: '#4285F4',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    users: '30M',
    hook: 'A rede descentralizada que esta crescendo rapido.',
    pain: 'Bluesky e o futuro das redes abertas, mas poucas ferramentas ja oferecem integracao profissional.',
    solution: 'Publique textos, 4 midias, link cards e quotes pelo AT Protocol.',
    outcome: 'Marque presenca no fediverso enquanto seus concorrentes ainda estao parados.',
    features: ['Texto', '4 midias', 'Link card', 'Quote'],
    metric: { value: '30M+', label: 'usuarios ativos' },
    color: '#0085FF',
  },
  {
    id: 'slack',
    name: 'Slack',
    users: '20M',
    hook: 'Notificacoes internas no workspace da empresa.',
    pain: 'Times perdem tempo alternando entre ferramentas para acompanhar o que acontece no produto.',
    solution: 'Envie mensagens por webhook para workspaces e canais. Ate 4 anexos para alertas, relatorios e acoes.',
    outcome: 'Centralize atualizacoes do StackPost no Slack, onde seu time ja trabalha.',
    features: ['Webhook', 'Mensagens', '4 anexos', 'Canais'],
    metric: { value: '20M+', label: 'usuarios ativos' },
    color: '#4A154B',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    users: '10M',
    hook: 'Fediverso com instancias customizadas.',
    pain: 'Mastodon exige entender instancias, privacidade e spoiler. Sem automacao, e dificil manter presenca.',
    solution: 'Publique status com 4 midias, controles de privacidade, spoiler e suporte a instancias personalizadas.',
    outcome: 'Conecte sua marca ao fediverso de forma profissional e sem curva de aprendizado.',
    features: ['Status', '4 midias', 'Privacidade', 'Spoiler'],
    metric: { value: '10M+', label: 'usuarios ativos' },
    color: '#6364FF',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  const goTo = useCallback((index: number) => {
    const newIndex = ((index % slides.length) + slides.length) % slides.length;
    setCurrent(newIndex);
    const slide = trackRef.current?.children[newIndex] as HTMLElement | undefined;
    if (slide && trackRef.current) {
      trackRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (typeof window === 'undefined' || isHovering || hasCompletedCycle) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (window.matchMedia('(max-width: 767px)').matches) return;

    const handleVisibility = () => { isVisibleRef.current = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);

    autoplayRef.current = window.setInterval(() => {
      if (isHovering || !isVisibleRef.current) return;
      setCurrent((prevCurrent) => {
        if (prevCurrent === slides.length - 1) {
          setHasCompletedCycle(true);
          if (autoplayRef.current) clearInterval(autoplayRef.current);
          return prevCurrent;
        }
        const nextIndex = prevCurrent + 1;
        const slide = trackRef.current?.children[nextIndex] as HTMLElement | undefined;
        if (slide && trackRef.current) {
          trackRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
        }
        return nextIndex;
      });
    }, 8000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isHovering, hasCompletedCycle]);

  const s = slides[current];

  return (
    <section
      className="py-6 md:py-8 max-w-6xl mx-auto px-4 md:px-6 w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Plataformas suportadas"
    >
      <div
        className="relative overflow-hidden rounded-3xl border border-brand-border bg-gradient-to-br from-brand-surface/80 to-brand-bg/60 backdrop-blur-md"
        style={{ boxShadow: `0 0 100px -20px ${s.color}40, inset 0 0 40px ${s.color}08` }}
      >
        {/* Glow de fundo dinamico */}
        <div
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700"
          style={{ background: s.color }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-colors duration-700"
          style={{ background: s.color }}
        />
        <div
          ref={trackRef}
          className="hero-carousel-track flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {slides.map((slide, idx) => (
            <article
              key={slide.id}
              className="hero-slide snap-center shrink-0 w-full"
              aria-label={`${idx + 1} / ${slides.length}: ${slide.name}`}
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 p-5 md:pl-16 lg:pl-20 md:p-10 lg:p-14 items-stretch min-h-[420px] md:h-[560px] lg:h-[600px]">
                <div className="flex flex-col h-full justify-between overflow-hidden">
                  <div>
                    <span className="inline-flex items-center gap-2 mb-3 text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.2em]" style={{ color: slide.color }}>
                      <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: slide.color }}></span>
                        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: slide.color }}></span>
                      </span>
                      {slide.users} de usuarios
                    </span>

                    <h2 className="font-display text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.02em] text-brand-text mb-3" style={{ color: slide.color }}>
                      {slide.name}
                    </h2>

                    <p className="text-base md:text-lg font-bold text-brand-text mb-2">{slide.hook}</p>

                    <p className="text-sm md:text-base text-brand-text-secondary/80 mb-2 leading-relaxed line-clamp-2 md:line-clamp-3">{slide.pain}</p>
                    <p className="text-sm md:text-base text-brand-text-secondary mb-2 leading-relaxed line-clamp-2 md:line-clamp-3">{slide.solution}</p>
                    <p className="text-sm md:text-base text-brand-text leading-relaxed mb-4 line-clamp-2">{slide.outcome}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {slide.features.map((feat) => (
                        <span key={feat} className="px-3 py-1.5 rounded-full border border-brand-border bg-brand-elevated/60 text-[10px] md:text-xs text-brand-text-secondary">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="border-l-2 pl-3" style={{ borderColor: `${slide.color}60` }}>
                      <span className="block text-2xl md:text-3xl font-black font-mono leading-none" style={{ color: slide.color }}>{slide.metric.value}</span>
                      <span className="text-[10px] md:text-xs text-brand-text-secondary mt-1 block">{slide.metric.label}</span>
                    </div>
                    <Link
                      href={`/${slide.id === 'google_business' ? 'google-business' : slide.id}-api`}
                      className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-xl font-bold text-xs md:text-sm hover:scale-105 transition-transform"
                      style={{ backgroundColor: slide.color, color: '#0A0A0A' }}
                    >
                      Ver integracao <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="relative w-full aspect-square md:aspect-auto md:h-full rounded-2xl overflow-hidden border border-brand-border shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)] flex items-center justify-center p-6 md:p-8" style={{ backgroundColor: `${slide.color}10` }}>
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${slide.color}, transparent 70%)` }}></div>
                  <PlatformIcon id={slide.id} size={120} color={slide.color} className="relative z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform duration-300 w-[120px] h-[120px]" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-bg/90 border border-brand-border text-brand-text hover:bg-brand-accent hover:text-brand-bg transition-colors flex items-center justify-center shadow-lg"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-bg/90 border border-brand-border text-brand-text hover:bg-brand-accent hover:text-brand-bg transition-colors flex items-center justify-center shadow-lg"
          aria-label="Proximo slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[80%] flex-wrap justify-center">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-brand-accent w-5' : 'bg-brand-text-secondary/40 w-2 hover:bg-brand-accent/60'}`}
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
