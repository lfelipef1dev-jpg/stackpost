'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Bot, ChevronRight, Menu, PlayCircle, Scale, Share2, ShieldCheck, Tag, X } from 'lucide-react';

const nav = [
  { href: '/#platforms', label: 'Plataformas', icon: Share2, desc: '15 redes integradas' },
  { href: '/plans', label: 'Planos', icon: Tag, desc: 'Preços e limites' },
  { href: '/docs', label: 'Docs', icon: BookOpen, desc: 'Guias e API reference' },
  { href: '/demo', label: 'Demo', icon: PlayCircle, desc: 'Veja funcionando' },
  { href: '/compare', label: 'Comparar', icon: Scale, desc: 'StackPost vs alternativas' },
  { href: '/ai-agents', label: 'AI Agents', icon: Bot, desc: 'MCP e automação' },
  { href: '/security', label: 'Segurança', icon: ShieldCheck, desc: 'Criptografia e compliance' },
];

const CLOSE_MS = 180;

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function close() {
    if (closing || !mobileOpen) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      wasOpenRef.current = true;
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = '';
      if (wasOpenRef.current) {
        menuButtonRef.current?.focus();
        wasOpenRef.current = false;
      }
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen && !closing) close();
      if (e.key === 'Tab' && mobileOpen) {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>('#landing-mobile-menu a, #landing-mobile-menu button')
        ).filter((el) => !el.hasAttribute('aria-hidden'));
        const current = document.activeElement as HTMLElement;
        const idx = items.indexOf(current);
        if (e.shiftKey) {
          if (idx <= 0) {
            e.preventDefault();
            items[items.length - 1]?.focus();
          }
        } else if (idx === items.length - 1 || idx === -1) {
          e.preventDefault();
          items[0]?.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, closing]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-brand-border/50 bg-brand-bg/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo-header.webp" alt="StackPost" width={40} height={40} className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center" aria-label="Navegação principal">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-text transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-brand-accent text-brand-bg text-sm font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Criar conta <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
            <button
              ref={menuButtonRef}
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Dialog fora do <header>: backdrop-filter no header criaria um containing block
          e quebraria o posicionamento fixed/inset-0 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação" id="landing-mobile-menu">
          <div
            className={`absolute inset-0 bg-black/60 ${closing ? 'menu-overlay-out' : 'menu-overlay-in'}`}
            onClick={close}
            aria-hidden="true"
          />
          <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-b from-brand-surface to-brand-bg border-l border-brand-border flex flex-col shadow-2xl ${closing ? 'menu-panel-out' : 'menu-panel-in'}`}>
            <div className="flex items-center justify-between h-16 px-5 border-b border-brand-border/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <Image src="/brand/logo-header.webp" alt="" width={28} height={28} className="h-7 w-auto" />
                <span className="text-sm font-bold font-display tracking-tight text-brand-text">StackPost</span>
              </div>
              <button
                ref={closeButtonRef}
                onClick={close}
                className="p-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Navegação mobile">
              {nav.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    style={{ animationDelay: `${120 + i * 40}ms` }}
                    className="menu-item-in group flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/80 transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-brand-elevated border border-brand-border/70 flex items-center justify-center shrink-0 group-hover:border-brand-accent/50 group-hover:text-brand-accent transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-brand-text-secondary/70 leading-tight mt-0.5">{item.desc}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pt-3 pb-5 border-t border-brand-border/60 shrink-0">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary/50">Conta</p>
              <Link
                href="/login"
                onClick={close}
                className="block w-full px-4 py-3 rounded-xl border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition text-sm font-medium text-center"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-brand-accent text-brand-bg transition text-sm font-bold text-center flex items-center justify-center gap-1.5"
              >
                Criar conta grátis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
