import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
const SITE_NAME = 'StackPost';
const SITE_DESC = 'StackPost e a API unificada de redes sociais para SaaS, agencias e AI agents. Uma integracao, 15 plataformas, 114 endpoints, MCP server e analytics historico.';

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});
const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - API unificada de redes sociais`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: ['API redes sociais', 'publicacao multi-rede', 'Instagram API', 'TikTok API', 'LinkedIn API', 'MCP server', 'social media API', 'cross-post', 'agendamento posts'],
  authors: [{ name: 'ExpoStacker', url: 'https://expostacker.com.br' }],
  creator: 'ExpoStacker',
  publisher: 'ExpoStacker',
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
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'StackPost - API unificada de redes sociais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - API unificada de redes sociais`,
    description: SITE_DESC,
    images: ['/og.png'],
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
    icon: '/icon.svg',
    apple: '/icon.svg',
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
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESC,
  founder: {
    '@type': 'Organization',
    name: 'ExpoStacker',
    url: 'https://expostacker.com.br',
  },
  sameAs: [
    'https://github.com/expostacker',
    'https://instagram.com/expostacker',
    'https://linkedin.com/company/expostacker',
    'https://x.com/expostacker',
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
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen bg-brand-bg text-brand-text">
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <GoogleAnalytics gaMeasurementId={process.env.NEXT_PUBLIC_GA4_ID} trackPageViews />
        )}
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
