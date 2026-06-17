/**
 * @file index.ts
 * @module @voltaway/ocpi
 *
 * Scopo: Punto di ingresso pubblico del client OCPI.
 * Flusso: Re-esporta tipi e OcpiClient per uso da API e servizi Voltaway.
 * Dipendenze: ./types.js, ./client.js.
 */

export * from './types.js';
export { OcpiClient } from './client.js';
