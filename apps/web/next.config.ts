/**
 * @file next.config.ts
 * @module @voltaway/web
 *
 * Scopo: configurazione Next.js per build standalone e deploy containerizzato.
 * Flusso: build → output standalone → runtime Node.
 * Dipendenze: next.
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output standalone: bundle minimo per Docker/Netlify senza node_modules completo
  output: 'standalone',
};

export default nextConfig;
