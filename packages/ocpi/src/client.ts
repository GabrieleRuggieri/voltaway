import type { BoundingBox, EvseStatus } from '@voltaway/core';
import type {
  OcpiClientConfig,
  OcpiCdr,
  OcpiLocation,
  OcpiProvider,
  OcpiTariff,
  SessionRef,
  StartSessionInput,
} from './types.js';

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Token ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function inBBox(loc: OcpiLocation, area: BoundingBox): boolean {
  const lat = Number(loc.coordinates.latitude);
  const lng = Number(loc.coordinates.longitude);
  return lat >= area.minLat && lat <= area.maxLat && lng >= area.minLng && lng <= area.maxLng;
}

export class OcpiClient implements OcpiProvider {
  constructor(private readonly config: OcpiClientConfig) {}

  private url(path: string): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }

  async getLocations(area?: BoundingBox): Promise<OcpiLocation[]> {
    const res = await fetch(this.url('/ocpi/2.2.1/locations'), {
      headers: authHeaders(this.config.token),
    });
    if (!res.ok) throw new Error(`OCPI locations failed: ${res.status}`);
    const body = (await res.json()) as { data: OcpiLocation[] };
    const locations = body.data ?? [];
    return area ? locations.filter((l) => inBBox(l, area)) : locations;
  }

  async getTariff(tariffId: string): Promise<OcpiTariff | null> {
    const res = await fetch(this.url(`/ocpi/2.2.1/tariffs/${tariffId}`), {
      headers: authHeaders(this.config.token),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`OCPI tariff failed: ${res.status}`);
    const body = (await res.json()) as { data: OcpiTariff };
    return body.data;
  }

  async getStatus(evseIds: string[]): Promise<Array<{ evseUid: string; status: EvseStatus }>> {
    const res = await fetch(this.url('/ocpi/2.2.1/locations'), {
      headers: authHeaders(this.config.token),
    });
    if (!res.ok) throw new Error(`OCPI status failed: ${res.status}`);
    const body = (await res.json()) as { data: OcpiLocation[] };
    const wanted = new Set(evseIds);
    const out: Array<{ evseUid: string; status: EvseStatus }> = [];
    for (const loc of body.data ?? []) {
      for (const evse of loc.evses) {
        if (wanted.has(evse.uid)) {
          out.push({ evseUid: evse.uid, status: evse.status });
        }
      }
    }
    return out;
  }

  async startSession(input: StartSessionInput): Promise<SessionRef> {
    const res = await fetch(this.url('/ocpi/2.2.1/commands/START_SESSION'), {
      method: 'POST',
      headers: authHeaders(this.config.token),
      body: JSON.stringify({
        location_id: input.locationId,
        evse_uid: input.evseUid,
        token: { uid: input.tokenUid, type: 'APP_USER' },
      }),
    });
    if (!res.ok) throw new Error(`OCPI START_SESSION failed: ${res.status}`);
    const body = (await res.json()) as { data: SessionRef };
    return body.data;
  }

  async stopSession(ref: SessionRef): Promise<void> {
    const res = await fetch(this.url('/ocpi/2.2.1/commands/STOP_SESSION'), {
      method: 'POST',
      headers: authHeaders(this.config.token),
      body: JSON.stringify({ session_id: ref.sessionId }),
    });
    if (!res.ok) throw new Error(`OCPI STOP_SESSION failed: ${res.status}`);
  }

  async getCdr(ref: SessionRef): Promise<OcpiCdr> {
    const res = await fetch(this.url(`/ocpi/2.2.1/cdrs/${ref.sessionId}`), {
      headers: authHeaders(this.config.token),
    });
    if (!res.ok) throw new Error(`OCPI CDR failed: ${res.status}`);
    const body = (await res.json()) as { data: OcpiCdr };
    return body.data;
  }
}
