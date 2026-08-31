'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MessageSquare,
  CreditCard,
  Coins,
  CalendarClock,
  Webhook,
  Settings,
  BarChart3,
  Shield,
  LogOut,
} from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/organizations', label: 'Organizações', icon: Building2 },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/comments', label: 'Comentários', icon: MessageSquare },
  { href: '/admin/billing', label: 'Assinaturas', icon: CreditCard },
  { href: '/admin/credits', label: 'Créditos', icon: Coins },
  { href: '/admin/schedule', label: 'Agendamentos', icon: CalendarClock },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-brand-surface border-r border-brand-border flex flex-col">
      <div className="p-6 border-b border-brand-border">
        <Link href="/admin" className="text-xl font-bold text-brand-text">
          Admin
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-brand-border">
        <a
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated"
        >
          <LogOut className="w-4 h-4" />
          Voltar ao app
        </a>
      </div>
    </aside>
  );
}
