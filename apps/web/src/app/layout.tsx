import type { Metadata } from 'next';
import { Hanken_Grotesk, IBM_Plex_Mono, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VENTRA ARG · Sistema POS para kioscos y almacenes',
  description: 'Gestioná tu kiosco desde cualquier lugar. Punto de venta, inventario, fiados, proveedores y reportes. 7 días gratis, sin tarjeta.',
  metadataBase: new URL('https://ventra-arg.vercel.app'),
  openGraph: {
    title: 'VENTRA ARG · Sistema POS para kioscos',
    description: 'Punto de venta, inventario, fiados y reportes para tu kiosco. 7 días gratis · $24.990/mes · Todo incluido.',
    url: 'https://ventra-arg.vercel.app',
    siteName: 'VENTRA ARG',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VENTRA ARG · Sistema POS para kioscos',
    description: 'Punto de venta, inventario, fiados y reportes para tu kiosco. 7 días gratis.',
  },
  manifest: '/manifest.json',
  themeColor: '#0d9f6e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VENTRA ARG',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className={`${hanken.variable} ${ibmMono.variable} ${fraunces.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
