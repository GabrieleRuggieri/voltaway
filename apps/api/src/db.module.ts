/**
 * @file db.module.ts
 * @module @voltaway/api
 *
 * Scopo: Fornisce globalmente l'istanza Drizzle del database tramite token di injection DB.
 * Flusso: app.module → db.module → @voltaway/db (Postgres)
 * Dipendenze: @nestjs/common, @voltaway/db (createDb)
 * Endpoint / export principali: DB (Symbol), DbModule
 */
import { Global, Module } from '@nestjs/common';
import { createDb, type Db } from '@voltaway/db';

export const DB = Symbol('DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: (): Db => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is required');
        return createDb(url);
      },
    },
  ],
  exports: [DB],
})
export class DbModule {}
