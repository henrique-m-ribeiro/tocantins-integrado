import type { Metadata } from 'next';
import { Providers } from './providers';
import { LeafletStyles } from '@/components/LeafletStyles';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tocantins Integrado',
  description: 'Plataforma de Superinteligência Territorial do Tocantins',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <LeafletStyles />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
