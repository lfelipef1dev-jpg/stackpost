'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const nav = [
  { href: '/#platforms', label: 'Plataformas' },
  { href: '/plans', label: 'Planos' },
  { href: '/docs', label: 'Docs' },
  { href: '/demo', label: 'Demo' },
  { href: '/compare', label: 'Comparar' },
  { href: '/ai-agents', label: 'AI Agents' },
  { href: '/security', label: 'Segurança' },
];

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
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
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-brand-border/50 bg-brand-bg/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Image src="/brand/logo-header.png" alt="StackPost" width={40} height={40} className="h-10 w-auto" priority />
        </a>
        <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center" aria-label="Navegação principal">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-brand-text transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-brand-accent text-brand-bg text-sm font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Criar conta <ArrowRight className="w-3 h-3 ml-1" />
          </a>
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

      {mobileOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu de navegação" id="landing-mobile-menu">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-brand-surface border-l border-brand-border p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-brand-text">Menu</span>
              <button
                ref={closeButtonRef}
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1" aria-label="Navegação mobile">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition border-l-2 border-transparent text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href="/login"
              className="mt-4 w-full px-4 py-3 rounded-xl border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition text-sm font-medium text-center"
            >
              Entrar
            </a>
            <a
              href="/register"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-brand-accent text-brand-bg transition text-sm font-bold text-center"
            >
              Criar conta
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
