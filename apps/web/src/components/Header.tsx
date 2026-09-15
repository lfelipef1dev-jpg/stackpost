'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, CalendarDays, ChevronRight, CreditCard, LayoutDashboard, Link2, LogOut, Menu, Settings, SquarePen, X } from 'lucide-react';
import ReportButton from '@/components/ReportButton';
import ThemeToggle from '@/components/ThemeToggle';

const nav = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/composer', label: 'Criar post', icon: SquarePen },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/accounts', label: 'Contas', icon: Link2 },
  { href: '/analytics', label: 'Métricas', icon: BarChart3 },
  { href: '/billing', label: 'Cobrança', icon: CreditCard },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

const CLOSE_MS = 180;

export default function Header({ activeHref }: { activeHref?: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

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
      if (e.key === 'Escape' && mobileOpen && !closing) {
        close();
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
  }, [mobileOpen, closing]);

  return (
    <>
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/brand/logo-header.webp" alt="StackPost" width={56} height={56} className="h-14 w-auto" priority />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center" aria-label="Navegação principal">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.href === activeHref ? 'text-brand-text font-medium' : 'hover:text-brand-text'}
                aria-current={item.href === activeHref ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
            <ReportButton />
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
      </header>

      {/* Dialog fora do <header>: backdrop-filter no header criaria um containing block
          e quebraria o posicionamento fixed/inset-0 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação" id="mobile-menu">
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
                const isActive = item.href === activeHref;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    id={`mobile-nav-${item.href}`}
                    href={item.href}
                    onClick={close}
                    style={{ animationDelay: `${120 + i * 40}ms` }}
                    className={`menu-item-in group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-brand-elevated text-brand-text border border-brand-accent/40'
                        : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/80'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-brand-accent/10 border-brand-accent/50 text-brand-accent'
                        : 'bg-brand-elevated border-brand-border/70 group-hover:border-brand-accent/50 group-hover:text-brand-accent'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0 text-sm font-semibold leading-tight">{item.label}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pt-3 pb-5 border-t border-brand-border/60 shrink-0">
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary/50">Ajuda</span>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <ReportButton />
                </div>
              </div>
              <button
                id="mobile-logout"
                onClick={logout}
                className="w-full px-4 py-3 rounded-xl border border-error/30 text-error hover:bg-error/10 transition text-sm font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
