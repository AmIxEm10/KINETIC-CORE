import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KINETIC·CORE — Orbital Defense',
  description:
    'Tower Defense circulaire ultra-premium, propulsé par React Three Fiber et un noyau réactif.'
};

export const viewport: Viewport = {
  themeColor: '#05070C'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen overflow-hidden bg-core-bg font-body text-core-accent antialiased">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,240,255,0.08),transparent_60%)]" />
        <div
          className="pointer-events-none fixed inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(110,240,255,0.08) 0 1px, transparent 1px 3px)'
          }}
        />
        {children}
      </body>
    </html>
  );
}
