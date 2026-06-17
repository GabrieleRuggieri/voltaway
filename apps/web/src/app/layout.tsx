import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voltaway — Ricarica EV',
  description: 'Mappa, prezzo all-in e avvio ricarica — come EasyPark per le colonnine',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Voltaway',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070b14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
