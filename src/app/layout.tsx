import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Beacon',
  description: 'Gestión de incidentes',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <header className="topbar">
            <Link href="/" className="brand">
              Beacon
            </Link>
            <span className="tagline">Gestión de incidentes</span>
          </header>
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
