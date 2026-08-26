import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLd, breadcrumbSchema } from './JsonLd';

interface BreadcrumbProps {
  items: { name: string; path: string }[];
}

/**
 * Breadcrumb visual + Schema BreadcrumbList.
 * O primeiro item deve ser a home, o ultimo e a pagina atual.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const schema = breadcrumbSchema(items);

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-brand-text-secondary flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {i === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                {isLast ? (
                  <span className="text-brand-text font-medium" aria-current="page">{item.name}</span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-brand-accent transition-colors">
                      {item.name}
                    </Link>
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
