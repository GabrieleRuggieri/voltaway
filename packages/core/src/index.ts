/**
 * @file index.ts
 * @module @voltaway/core
 *
 * Scopo: Punto di ingresso pubblico del package core; re-esporta tipi e funzioni di pricing.
 * Flusso: Consumato da app web, API e package OCPI tramite import da @voltaway/core.
 * Dipendenze: ./types.js, ./pricing/allInPrice.js.
 */

export * from './types.js';
export { computeAllInPrice } from './pricing/allInPrice.js';
