'use client';

import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/composer', label: 'Criar post' },
  { href: '/calendar', label: 'Calendario' },
  { href: '/accounts', label: 'Contas' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/billing', label: 'Billing' },
  { href: '/settings', label: 'Config' },
];

export default function Header({ activeHref }: { activeHref?: string }) {
  const router = useRouter();

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  return (
    <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2">
          <img src="/brand/logo.png" alt="StackPost" className="h-14 w-auto" />
        </a>
        <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === activeHref ? 'text-brand-text' : 'hover:text-brand-text'}
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
      </div>
    </header>
  );
}
