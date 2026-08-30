'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/billing', label: 'Visão geral' },
  { href: '/billing/usage', label: 'Uso' },
  { href: '/billing/invoices', label: 'Faturas' },
  { href: '/billing/plans', label: 'Planos' },
];

/**
 * Tabs de navegação do portal de cobrança.
 * Usa usePathname para destacar a tab ativa com brand-accent.
 */
export function BillingTabs() {
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-1 p-1.5 rounded-2xl bg-brand-surface border border-brand-border overflow-x-auto"
      role="tablist"
      aria-label="Navegação do portal de cobrança"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/billing'
            ? pathname === '/billing'
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-brand-accent text-brand-bg'
                : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
