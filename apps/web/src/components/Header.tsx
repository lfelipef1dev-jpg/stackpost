'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/composer', label: 'Criar post' },
  { href: '/calendar', label: 'Calendário' },
  { href: '/accounts', label: 'Contas' },
  { href: '/analytics', label: 'Métricas' },
  { href: '/billing', label: 'Cobrança' },
  { href: '/settings', label: 'Configurações' },
];

export default function Header({ activeHref }: { activeHref?: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

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
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
      if (e.key === 'Tab' && mobileOpen) {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>('#mobile-menu a, #mobile-menu button')
        ).filter((el) => !el.hasAttribute('aria-hidden'));
        const current = document.activeElement as HTMLElement;
        const idx = items.indexOf(current);
        if (e.shiftKey) {
          if (idx <= 0) {
            e.preventDefault();
            items[items.length - 1]?.focus();
          }
        } else {
          if (idx === items.length - 1 || idx === -1) {
            e.preventDefault();
            items[0]?.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/logo.png" alt="StackPost" width={56} height={56} className="h-14 w-auto" priority />
        </a>

        <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center" aria-label="Navegação principal">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === activeHref ? 'text-brand-text font-medium' : 'hover:text-brand-text'}
              aria-current={item.href === activeHref ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
          >
            Sair
          </button>
        </nav>

        <button
          ref={menuButtonRef}
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu de navegação" id="mobile-menu">
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
              {nav.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <a
                    key={item.href}
                    id={`mobile-nav-${item.href}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition border-l-2 ${
                      isActive
                        ? 'bg-brand-surface border-brand-accent text-brand-text'
                        : 'border-transparent text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <button
              id="mobile-logout"
              onClick={logout}
              className="mt-4 w-full px-4 py-3 rounded-xl border border-brand-border text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
