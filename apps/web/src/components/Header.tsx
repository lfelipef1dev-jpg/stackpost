'use client';

export default function Header() {
  return (
    <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
        <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
          <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
          <a href="/composer" className="hover:text-brand-text">Criar post</a>
          <a href="/calendar" className="hover:text-brand-text">Calendario</a>
          <a href="/accounts" className="hover:text-brand-text">Contas</a>
          <a href="/analytics" className="hover:text-brand-text">Analytics</a>
          <a href="/webhooks" className="hover:text-brand-text">Webhooks</a>
          <a href="/settings" className="hover:text-brand-text">Config</a>
        </nav>
      </div>
    </header>
  );
}
