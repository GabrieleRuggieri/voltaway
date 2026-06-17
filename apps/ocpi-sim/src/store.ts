import type { EvseStatus } from './types.js';
import type { OcpiCdr, OcpiLocation, OcpiTariff, SessionRef } from './types.js';

interface ActiveSession extends SessionRef {
  locationId: string;
  evseUid: string;
  startedAt: Date;
  kWhDelivered: number;
}

const TOKEN = process.env.OCPI_TOKEN ?? 'sim-token';

const tariffs: Record<string, OcpiTariff> = {
  'tariff-standard': {
    id: 'tariff-standard',
    currency: 'EUR',
    elements: [
      {
        price_components: [
          { type: 'ENERGY', price: 0.42, step_size: 1 },
          { type: 'FLAT', price: 0.35, step_size: 1 },
        ],
      },
    ],
  },
  'tariff-economy': {
    id: 'tariff-economy',
    currency: 'EUR',
    elements: [
      {
        price_components: [
          { type: 'ENERGY', price: 0.36, step_size: 1 },
          { type: 'TIME', price: 0.05, step_size: 15 },
        ],
      },
    ],
  },
};

const locations: OcpiLocation[] = [
  {
    id: 'loc-catania-duomo',
    name: 'Hub Duomo',
    address: 'Piazza del Duomo',
    city: 'Catania',
    country: 'IT',
    coordinates: { latitude: '37.5079', longitude: '15.0830' },
    evses: [
      {
        uid: 'loc-catania-duomo-evse-1',
        evse_id: 'IT*SIM*E001',
        status: 'AVAILABLE',
        max_power_kw: 50,
        tariff_id: 'tariff-standard',
        connectors: [
          {
            id: '1',
            standard: 'IEC_62196_T2_COMBO',
            format: 'CABLE',
            power_type: 'DC',
            max_voltage: 500,
            max_amperage: 125,
          },
        ],
      },
      {
        uid: 'loc-catania-duomo-evse-2',
        evse_id: 'IT*SIM*E002',
        status: 'AVAILABLE',
        max_power_kw: 22,
        tariff_id: 'tariff-economy',
        connectors: [
          {
            id: '1',
            standard: 'IEC_62196_T2',
            format: 'SOCKET',
            power_type: 'AC_3_PHASE',
            max_voltage: 400,
            max_amperage: 32,
          },
        ],
      },
    ],
  },
  {
    id: 'loc-catania-porto',
    name: 'Porto Charge',
    address: 'Via Cardinale Dusmet 2',
    city: 'Catania',
    country: 'IT',
    coordinates: { latitude: '37.5028', longitude: '15.0962' },
    evses: [
      {
        uid: 'loc-catania-porto-evse-1',
        evse_id: 'IT*SIM*E003',
        status: 'CHARGING',
        max_power_kw: 50,
        tariff_id: 'tariff-standard',
        connectors: [
          {
            id: '1',
            standard: 'IEC_62196_T2_COMBO',
            format: 'CABLE',
            power_type: 'DC',
            max_voltage: 500,
            max_amperage: 125,
          },
        ],
      },
      {
        uid: 'loc-catania-porto-evse-2',
        evse_id: 'IT*SIM*E004',
        status: 'OUTOFORDER',
        max_power_kw: 22,
        tariff_id: 'tariff-economy',
        connectors: [
          {
            id: '1',
            standard: 'IEC_62196_T2',
            format: 'SOCKET',
            power_type: 'AC_3_PHASE',
            max_voltage: 400,
            max_amperage: 32,
          },
        ],
      },
    ],
  },
];

const sessions = new Map<string, ActiveSession>();
const cdrs = new Map<string, OcpiCdr>();

export function isAuthorized(authHeader?: string): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Token\s+/i, '').trim();
  return token === TOKEN;
}

export function listLocations(): OcpiLocation[] {
  return locations;
}

export function getTariff(id: string): OcpiTariff | undefined {
  return tariffs[id];
}

export function setEvseStatus(evseUid: string, status: EvseStatus): void {
  for (const loc of locations) {
    const evse = loc.evses.find((e) => e.uid === evseUid);
    if (evse) {
      evse.status = status;
      return;
    }
  }
}

export function startSession(input: {
  locationId: string;
  evseUid: string;
  tokenUid: string;
}): SessionRef {
  const loc = locations.find((l) => l.id === input.locationId);
  const evse = loc?.evses.find((e) => e.uid === input.evseUid);
  if (!loc || !evse) throw new Error('Location or EVSE not found');
  if (evse.status !== 'AVAILABLE') throw new Error('EVSE not available');

  const sessionId = `sess-${Date.now()}`;
  const ref: ActiveSession = {
    sessionId,
    authorizationReference: `auth-${input.tokenUid}-${Date.now()}`,
    locationId: input.locationId,
    evseUid: input.evseUid,
    startedAt: new Date(),
    kWhDelivered: 0,
  };
  sessions.set(sessionId, ref);
  evse.status = 'CHARGING';
  return { sessionId: ref.sessionId, authorizationReference: ref.authorizationReference };
}

export function stopSession(sessionId: string): OcpiCdr {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');

  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt.getTime()) / 60000));
  const kWh = Math.max(2, Math.round(minutes * 0.8 * 10) / 10);
  session.kWhDelivered = kWh;

  setEvseStatus(session.evseUid, 'AVAILABLE');
  sessions.delete(sessionId);

  const tariff = getTariff(
    locations.find((l) => l.id === session.locationId)?.evses.find((e) => e.uid === session.evseUid)
      ?.tariff_id ?? 'tariff-standard',
  );
  const energyRate =
    tariff?.elements[0]?.price_components.find((c) => c.type === 'ENERGY')?.price ?? 0.4;
  const flat = tariff?.elements[0]?.price_components.find((c) => c.type === 'FLAT')?.price ?? 0;
  const total = kWh * energyRate + flat;

  const cdr: OcpiCdr = {
    id: `cdr-${sessionId}`,
    session_id: sessionId,
    total_energy: kWh,
    total_time: minutes * 60,
    total_cost: { excl_vat: total, incl_vat: total * 1.22 },
    currency: 'EUR',
  };
  cdrs.set(sessionId, cdr);
  return cdr;
}

export function getCdr(sessionId: string): OcpiCdr | undefined {
  return cdrs.get(sessionId);
}
