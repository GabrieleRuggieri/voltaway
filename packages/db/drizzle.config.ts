/**
 * @file drizzle.config.ts
 * @module @voltaway/db
 *
 * Scopo: Configurazione Drizzle Kit per generare migrazioni e introspezione schema.
 * Flusso: Punta a schema.ts e cartella drizzle/; legge DATABASE_URL dall'ambiente.
 * Dipendenze: drizzle-kit.
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://voltaway:voltaway@localhost:5432/voltaway',
  },
});
