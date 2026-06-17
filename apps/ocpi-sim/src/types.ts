export type { EvseStatus } from '@voltaway/core';

export interface OcpiConnector {
  id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
}

export interface OcpiEvse {
  uid: string;
  evse_id: string;
  status: import('@voltaway/core').EvseStatus;
  connectors: OcpiConnector[];
  max_power_kw: number;
  tariff_id?: string;
}

export interface OcpiLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: { latitude: string; longitude: string };
  evses: OcpiEvse[];
}

export interface OcpiTariff {
  id: string;
  currency: string;
  elements: Array<{
    price_components: Array<{ type: string; price: number; step_size?: number }>;
  }>;
}

export interface SessionRef {
  sessionId: string;
  authorizationReference: string;
}

export interface OcpiCdr {
  id: string;
  session_id: string;
  total_energy: number;
  total_time: number;
  total_cost: { excl_vat: number; incl_vat: number };
  currency: string;
}
