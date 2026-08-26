'use client';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface/30 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-text-secondary">
        <div>© 2026 StackPost. Feito por ExpoStacker.</div>
        <div className="flex gap-4">
          <a href="/plans" className="hover:text-brand-text">Planos</a>
          <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
          <a href="/settings" className="hover:text-brand-text">Configuracoes</a>
        </div>
      </div>
    </footer>
  );
}
