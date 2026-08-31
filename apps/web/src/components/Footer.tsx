'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { FaInstagram, FaFacebook, FaXTwitter, FaLinkedin, FaYoutube, FaGithub, FaTiktok, FaThreads, FaPinterest, FaReddit, FaBluesky, FaMastodon, FaDiscord, FaSlack, FaGoogle, FaSnapchat } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';

function SocialIcon({ s }: { s: { label: string; href: string; color: string; icon: any } }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  const [hover, setHover] = useState(false);
  const Icon = s.icon;

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };

  return (
    <a
      ref={ref}
      href={s.href}
      target={s.href.startsWith('http') ? '_blank' : undefined}
      rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="relative w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-300 hover:scale-115 overflow-hidden"
      style={{
        borderColor: hover ? s.color : `${s.color}30`,
        color: s.color,
        boxShadow: hover ? `0 0 24px -4px ${s.color}60, 0 0 12px -2px ${s.color}30` : 'none',
        transform: hover ? 'translateY(-4px) scale(1.12)' : 'translateY(0) scale(1)',
        background: `radial-gradient(circle 50px at ${spot.x}px ${spot.y}px, ${s.color}20, transparent)`,
      }}
      aria-label={s.label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setSpot({ x: 0, y: 0, active: false }); }}
      onMouseMove={handleMove}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${s.color}10, transparent)`,
          opacity: hover ? 1 : 0,
        }}
      />
      <Icon className="w-5 h-5 relative z-10" style={{ filter: hover ? `drop-shadow(0 0 6px ${s.color})` : 'none' }} />
    </a>
  );
}

const columns = [
  {
    title: 'Produto',
    href: '/features',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Planos', href: '/plans' },
      { label: 'Documentacao', href: '/docs' },
      { label: 'FAQ', href: '/plans#faq' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Desenvolvedores',
    href: '/docs/api',
    links: [
      { label: 'API Reference', href: '/docs/api' },
      { label: 'SDK', href: '/docs/sdk' },
      { label: 'CLI', href: '/docs/cli' },
      { label: 'MCP Server', href: '/docs/mcp' },
      { label: 'Webhooks', href: '/docs/webhooks' },
    ],
  },
  {
    title: 'Plataformas',
    href: '/platforms',
    links: [
      { label: 'Instagram API', href: '/instagram-api' },
      { label: 'Facebook API', href: '/facebook-api' },
      { label: 'TikTok API', href: '/tiktok-api' },
      { label: 'YouTube API', href: '/youtube-api' },
      { label: 'LinkedIn API', href: '/linkedin-api' },
    ],
  },
  {
    title: 'Core APIs',
    href: '/social-media-api',
    links: [
      { label: 'Social Media API', href: '/social-media-api' },
      { label: 'Unified API', href: '/unified-api' },
      { label: 'Posting API', href: '/posting-api' },
      { label: 'Scheduling API', href: '/scheduling-api' },
      { label: 'Media Upload API', href: '/media-upload-api' },
    ],
  },
  {
    title: 'Comparacao',
    href: '/comparisons',
    links: [
      { label: 'Ayrshare', href: '/ayrshare-alternative' },
      { label: 'Zernio', href: '/zernio-alternative' },
      { label: 'Upload-Post', href: '/upload-post-alternative' },
      { label: 'Postiz', href: '/postiz-alternative' },
      { label: 'Buffer', href: '/buffer-alternative' },
    ],
  },
  {
    title: 'Empresa',
    href: '/about',
    links: [
      { label: 'Sobre', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contact' },
      { label: 'Status', href: '/status' },
      { label: 'StackPost', href: 'https://stackpost.com.br' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-surface/20 border-t border-brand-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Colunas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-text-secondary hover:text-brand-accent transition-colors"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={col.href} className="text-sm text-brand-accent hover:underline transition-colors inline-flex items-center gap-1">
                    Ver todos <span aria-hidden="true">→</span>
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Redes sociais */}
        <div className="flex flex-wrap gap-3 justify-center py-8 border-t border-brand-border mt-10" aria-label="Redes sociais">
          {[
            { label: 'Instagram', href: 'https://instagram.com', color: '#E4405F', icon: FaInstagram },
            { label: 'Facebook', href: 'https://facebook.com', color: '#1877F2', icon: FaFacebook },
            { label: 'TikTok', href: 'https://tiktok.com', color: '#25F4EE', icon: FaTiktok },
            { label: 'YouTube', href: 'https://youtube.com', color: '#FF0000', icon: FaYoutube },
            { label: 'LinkedIn', href: 'https://linkedin.com', color: '#0A66C2', icon: FaLinkedin },
            { label: 'X', href: 'https://x.com', color: '#FFFFFF', icon: FaXTwitter },
            { label: 'Threads', href: 'https://threads.net', color: '#FFFFFF', icon: FaThreads },
            { label: 'Pinterest', href: 'https://pinterest.com', color: '#E60023', icon: FaPinterest },
            { label: 'Reddit', href: 'https://reddit.com', color: '#FF4500', icon: FaReddit },
            { label: 'Bluesky', href: 'https://bsky.app', color: '#0085FF', icon: FaBluesky },
            { label: 'Mastodon', href: 'https://mastodon.social', color: '#6364FF', icon: FaMastodon },
            { label: 'Discord', href: 'https://discord.com', color: '#5865F2', icon: FaDiscord },
            { label: 'Slack', href: 'https://slack.com', color: '#FFFFFF', icon: FaSlack },
            { label: 'Google Business', href: 'https://google.com/business', color: '#4285F4', icon: FaGoogle },
            { label: 'Snapchat', href: 'https://snapchat.com', color: '#FFFC00', icon: FaSnapchat },
            { label: 'GitHub', href: 'https://github.com', color: '#FFFFFF', icon: FaGithub },
            { label: 'E-mail', href: 'mailto:contato@stackpost.com.br', color: '#EA4335', icon: MdEmail },
          ].map((s) => (
            <SocialIcon key={s.label} s={s} />
          ))}
        </div>

        {/* Contato */}
        <div className="text-center mb-4">
          <a href="mailto:contato@stackpost.com.br" className="text-sm text-brand-text-secondary hover:text-brand-accent font-mono transition-colors">
            contato@stackpost.com.br
          </a>
        </div>

        {/* Legal */}
        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <p className="text-xs text-brand-text-secondary">© 2026 StackPost · Pagamento em R$ (BRL)</p>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/terms" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Termos</Link>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/privacy" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Privacidade</Link>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/status" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Status</Link>
        </div>
      </div>
    </footer>
  );
}
