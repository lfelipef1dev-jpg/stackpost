'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/composer', label: 'Criar post' },
  { href: '/calendar', label: 'Calendario' },
  { href: '/accounts', label: 'Contas' },
  { href: '/analytics', label: 'Metricas' },
  { href: '/billing', label: 'Cobranca' },
  { href: '/settings', label: 'Config' },
];

export default function Header({ activeHref }: { activeHref?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/logo.png" alt="StackPost" width={56} height={56} className="h-14 w-auto" priority />
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
