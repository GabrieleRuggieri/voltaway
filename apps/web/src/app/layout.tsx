import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voltaway — Prezzo reale EV',
  description: 'Trova, avvia e paga la ricarica con prezzo all-in trasparente',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
