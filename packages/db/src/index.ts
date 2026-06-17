/**
 * @file index.ts
 * @module @voltaway/db
 *
 * Scopo: Factory per la connessione Drizzle e re-export dello schema.
 * Flusso: createDb(connectionString) → client postgres-js + drizzle tipizzato con schema.
 * Dipendenze: drizzle-orm, postgres, ./schema.js.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export function createDb(connectionString: string) {
  const client = postgres(connectionString, { max: 10 });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
export * from './schema.js';
