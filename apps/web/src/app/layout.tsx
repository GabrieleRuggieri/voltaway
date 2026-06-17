/**
 * @file layout.tsx
 * @module @voltaway/web
 *
 * Scopo: layout radice Next.js con font, metadata PWA e viewport mobile.
 * Flusso: App Router → layout → page (MapScreen).
 * Dipendenze: next/font, globals.css.
 */
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Voltaway — Ricarica EV',
  description: 'Mappa, prezzo all-in e avvio ricarica a Catania',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Voltaway',
  },
};

// Viewport bloccato per UX app-like; safe-area gestita nei componenti figli
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f5f8fb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
