import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.com.br';
const SITE_NAME = 'StackPost';
const SITE_DESC = 'StackPost e a API unificada de redes sociais para SaaS, agências e AI agents. Uma integração, 15 plataformas, 114 endpoints, MCP server e analytics histórico.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - API unificada de redes sociais`,
    template: '%s',
  },
  description: SITE_DESC,
  keywords: ['API redes sociais', 'publicação multi-rede', 'Instagram API', 'TikTok API', 'LinkedIn API', 'MCP server', 'social media API', 'cross-post', 'agendamento posts'],
  authors: [{ name: 'StackPost', url: 'https://stackpost.com.br' }],
  creator: 'StackPost',
  publisher: 'StackPost',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - API unificada de redes sociais`,
    description: SITE_DESC,
    images: [
      {
        url: '/brand/og.png',
        width: 1254,
        height: 1254,
        alt: 'StackPost - API unificada de redes sociais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - API unificada de redes sociais`,
    description: SITE_DESC,
    images: ['/brand/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/brand/icon-sm.png',
    apple: '/brand/icon-sm.png',
    shortcut: '/brand/icon-sm.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  description: SITE_DESC,
  founder: {
    '@type': 'Organization',
    name: 'StackPost',
    url: 'https://stackpost.com.br',
  },
  sameAs: [
    'https://github.com/stackpost',
    'https://instagram.com/stackpost',
    'https://linkedin.com/company/stackpost',
    'https://x.com/stackpost',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESC,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'pt-BR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`min-h-screen bg-brand-bg text-brand-text ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
        {process.env.NEXT_PUBLIC_GA4_ID ? (
          <GoogleAnalytics gaMeasurementId={process.env.NEXT_PUBLIC_GA4_ID} trackPageViews />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
