'use client';

import Image from 'next/image';
import Link from 'next/link';
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
          <div className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-brand-surface border-l border-brand-border p-4 flex flex-col shadow-2xl ${closing ? 'menu-panel-out' : 'menu-panel-in'}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-brand-text">Menu</span>
              <button
                ref={closeButtonRef}
                onClick={close}
                className="p-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto" aria-label="Navegação mobile">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition border-l-2 border-transparent text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/login"
              onClick={close}
              className="mt-4 w-full px-4 py-3 rounded-xl border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition text-sm font-medium text-center"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              onClick={close}
              className="mt-2 w-full px-4 py-3 rounded-xl bg-brand-accent text-brand-bg transition text-sm font-bold text-center"
            >
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
