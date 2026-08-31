'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Code, Terminal, Bot, Webhook, Key, ChevronDown } from 'lucide-react';

const sections = [
  { href: '/docs', label: 'Visão geral', icon: BookOpen },
  { href: '/docs/api', label: 'API Reference', icon: Code },
  { href: '/docs/sdk', label: 'SDK', icon: BookOpen },
  { href: '/docs/cli', label: 'CLI', icon: Terminal },
  { href: '/docs/mcp', label: 'MCP Server', icon: Bot },
  { href: '/docs/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/docs/oauth', label: 'OAuth', icon: Key },
];

const platforms = [
  { href: '/facebook-api', label: 'Facebook', color: '#1877F2' },
  { href: '/youtube-api', label: 'YouTube', color: '#FF0000' },
  { href: '/instagram-api', label: 'Instagram', color: '#E4405F' },
  { href: '/tiktok-api', label: 'TikTok', color: '#25F4EE' },
  { href: '/linkedin-api', label: 'LinkedIn', color: '#0A66C2' },
  { href: '/x-api', label: 'X / Twitter', color: '#FFFFFF' },
  { href: '/threads-api', label: 'Threads', color: '#FFFFFF' },
  { href: '/pinterest-api', label: 'Pinterest', color: '#E60023' },
  { href: '/reddit-api', label: 'Reddit', color: '#FF4500' },
  { href: '/bluesky-api', label: 'Bluesky', color: '#0085FF' },
  { href: '/mastodon-api', label: 'Mastodon', color: '#6364FF' },
  { href: '/discord-api', label: 'Discord', color: '#5865F2' },
  { href: '/slack-api', label: 'Slack', color: '#4A154B' },
  { href: '/google-business-api', label: 'Google Business', color: '#4285F4' },
  { href: '/snapchat-api', label: 'Snapchat', color: '#FFFC00' },
];

function AccordionGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-brand-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-left group"
      >
        <span className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-brand-text-secondary group-hover:text-brand-accent transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-brand-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-3 space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="pt-6 pb-8">
      {/* Secao Documentacao - sempre visivel */}
      <div className="mb-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-brand-text-secondary/60 mb-3 px-1">
          Documentação
        </h3>
        <ul className="space-y-0.5">
          {sections.map((s) => {
            const active = pathname === s.href;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-brand-accent/10 text-brand-accent font-semibold border-l-2 border-brand-accent'
                      : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/40 border-l-2 border-transparent'
                  }`}
                >
                  <s.icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-accent' : ''}`} />
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Plataformas - accordion */}
      <div className="mt-6">
        <AccordionGroup title="Plataformas">
          {platforms.map((p) => {
            const active = pathname === p.href;
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                    : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/40'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
                />
                {p.label}
              </Link>
            );
          })}
        </AccordionGroup>
      </div>

      {/* Recursos - accordion */}
      <div className="mt-2">
        <AccordionGroup title="Recursos">
          <Link href="/plans" className="block px-3 py-1.5 rounded-lg text-sm text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/40 transition-colors">
            Planos e preços
          </Link>
          <Link href="/features" className="block px-3 py-1.5 rounded-lg text-sm text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/40 transition-colors">
            Recursos
          </Link>
          <Link href="/contact" className="block px-3 py-1.5 rounded-lg text-sm text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated/40 transition-colors">
            Contato
          </Link>
        </AccordionGroup>
      </div>
    </nav>
  );
}
