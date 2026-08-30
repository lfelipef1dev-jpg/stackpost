import type { Metadata } from 'next';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin — StackPost',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
