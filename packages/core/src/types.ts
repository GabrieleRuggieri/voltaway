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

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}
