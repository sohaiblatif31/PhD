import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PhD Tracker — Canada Application Manager',
  description: 'Track your PhD applications, scholarships, supervisors, and deadlines for Canadian universities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', padding: '32px', paddingLeft: '24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
