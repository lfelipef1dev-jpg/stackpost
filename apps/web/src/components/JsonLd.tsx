interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Injeta JSON-LD no <head> da pagina.
 * Uso: <JsonLd data={breadcrumbSchema} />
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';

/**
 * Gera schema BreadcrumbList a partir de uma lista de {name, path}.
 */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Schema SoftwareApplication para features/api pages.
 */
export function softwareApplicationSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * Schema Service para paginas de API especificas.
 */
export function serviceSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    serviceType: 'Social Media API',
  };
}

/**
 * Schema Product + Offer para planos.
 */
export function productSchema(name: string, description: string, price: number | null, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `${SITE_URL}${path}`,
    brand: { '@id': `${SITE_URL}/#organization` },
    offers: price !== null
      ? {
          '@type': 'Offer',
          price: String(price),
          priceCurrency: 'BRL',
          availability: 'https://schema.org/InStock',
        }
      : {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'BRL',
          },
          availability: 'https://schema.org/InStock',
        },
  };
}

/**
 * Schema Article para blog posts.
 */
export function articleSchema(title: string, description: string, datePublished: string, dateModified: string, path: string, authorName = 'ExpoStacker') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    dateModified,
    url: `${SITE_URL}${path}`,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://expostacker.com.br',
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}
