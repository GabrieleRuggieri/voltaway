/**
 * @file ocpi.module.ts
 * @module @voltaway/api
 *
 * Scopo: Registra globalmente il client OCPI configurato da variabili d'ambiente.
 * Flusso: app.module → ocpi.module → @voltaway/ocpi (CPO simulato o reale)
 * Dipendenze: @nestjs/common, @voltaway/ocpi (OcpiClient)
 * Endpoint / export principali: OCPI (Symbol), OcpiModule
 */
import { Global, Module } from '@nestjs/common';
import { OcpiClient } from '@voltaway/ocpi';

export const OCPI = Symbol('OCPI');

@Global()
@Module({
  providers: [
    {
      provide: OCPI,
      useFactory: () =>
        new OcpiClient({
          baseUrl: process.env.OCPI_BASE_URL ?? 'http://ocpi-sim:4000',
          token: process.env.OCPI_TOKEN ?? 'sim-token',
        }),
    },
  ],
  exports: [OCPI],
})
export class OcpiModule {}
