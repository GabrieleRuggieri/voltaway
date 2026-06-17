import type { BoundingBox, EvseStatus } from '@voltaway/core';

export interface OcpiLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: { latitude: string; longitude: string };
  evses: OcpiEvse[];
}

export interface OcpiEvse {
  uid: string;
  evse_id: string;
  status: EvseStatus;
  connectors: OcpiConnector[];
  max_power_kw: number;
  tariff_id?: string;
}

export interface OcpiConnector {
  id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
}

export interface OcpiTariff {
  id: string;
  currency: string;
  elements: Array<{
    price_components: Array<{
      type: string;
      price: number;
      step_size?: number;
    }>;
  }>;
}

export interface StartSessionInput {
  locationId: string;
  evseUid: string;
  tokenUid: string;
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

export interface OcpiProvider {
  getLocations(area?: BoundingBox): Promise<OcpiLocation[]>;
  getTariff(tariffId: string): Promise<OcpiTariff | null>;
  getStatus(evseIds: string[]): Promise<Array<{ evseUid: string; status: EvseStatus }>>;
  startSession(input: StartSessionInput): Promise<SessionRef>;
  stopSession(ref: SessionRef): Promise<void>;
  getCdr(ref: SessionRef): Promise<OcpiCdr>;
}

export interface OcpiClientConfig {
  baseUrl: string;
  token: string;
}
