import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackPost - Publicacao multi-rede',
  description: 'Crie, agende e publique conteudo em todas as redes sociais de um so lugar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-bg text-brand-text">
        {children}
      </body>
    </html>
  );
}
