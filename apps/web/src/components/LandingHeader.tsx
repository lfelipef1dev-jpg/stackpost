import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-brand-border/50 bg-brand-bg/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Image src="/brand/logo.png" alt="StackPost" width={40} height={40} className="h-10 w-auto" priority />
        </a>
        <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center">
          <a href="#platforms" className="hover:text-brand-text transition-colors">Plataformas</a>
          <a href="/plans" className="hover:text-brand-text transition-colors">Planos</a>
          <a href="/docs" className="hover:text-brand-text transition-colors">Docs</a>
          <a href="/demo" className="hover:text-brand-text transition-colors">Demo</a>
          <a href="/compare" className="hover:text-brand-text transition-colors">Comparar</a>
          <a href="/ai-agents" className="hover:text-brand-text transition-colors">AI Agents</a>
          <a href="/security" className="hover:text-brand-text transition-colors">Security</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center px-4 py-2 bg-brand-accent text-brand-bg text-sm font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Criar conta <ArrowRight className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </header>
  );
}
