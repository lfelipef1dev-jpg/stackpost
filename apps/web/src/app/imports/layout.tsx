import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'imports | StackPost',
  description: 'Area protegida do StackPost.',
  robots: { index: false, follow: false },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}