/**
 * @file types.ts
 * @module @voltaway/core
 *
 * Scopo: Definisce i tipi condivisi del dominio Voltaway (tariffe, quote, geografia, stato EVSE).
 * Flusso: Importati da pricing, API e client OCPI per garantire contratti tipizzati coerenti.
 * Dipendenze: Nessuna (tipi puri TypeScript).
 */

export type TariffComponentType = 'ENERGY' | 'TIME' | 'FLAT' | 'PARKING_TIME';

export interface TariffComponent {
  type: TariffComponentType;
  price: number;
  stepSize?: number;
}

export interface CpoTariff {
  id: string;
  currency: string;
  components: TariffComponent[];
}

export interface FeePolicy {
  type: 'percent' | 'flat';
  value: number;
  /** Sconto premium applicato al subtotale CPO prima del calcolo fee Voltaway */
  premiumDiscountPercent?: number;
}

export interface SessionEstimate {
  kWh: number;
  minutes: number;
}

export interface AllInQuoteBreakdown {
  energy: number;
  time: number;
  flat: number;
  parking: number;
  voltawayFee: number;
}

export interface AllInQuote {
  allInPerKwh: number;
  totalEstimate: number;
  currency: string;
  breakdown: AllInQuoteBreakdown;
}

export type EvseStatus = 'AVAILABLE' | 'CHARGING' | 'BLOCKED' | 'OUTOFORDER' | 'UNKNOWN';

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Rettangolo geografico per filtrare location OCPI per area mappa */
export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}
