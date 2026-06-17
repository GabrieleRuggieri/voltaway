export type StationMarker = {
  id: string;
  ocpiLocationId: string;
  ocpiEvseUid: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  allInPerKwh: number | null;
  totalEstimate: number | null;
  maxPowerKw: number;
  currency: string;
};

export type ChargingSession = {
  id: string;
  status: string;
  ocpiSessionId: string | null;
  quotedAllInPerKwh: number | null;
  quotedTotal: number | null;
  finalKwh: number | null;
  finalTotal: number | null;
  failureReason: string | null;
  currency: string | null;
  stationName: string | null;
  evseUid: string | null;
};

export function publicApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://api.voltaway.localhost';
}

export function apiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.API_INTERNAL_URL ?? publicApiBase();
  }
  return publicApiBase();
}

export function wsBase(): string {
  const base = publicApiBase();
  return base.replace(/^http/, 'ws');
}

export async function fetchStations(): Promise<StationMarker[]> {
  const res = await fetch(`${apiBase()}/stations`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load stations: ${res.status}`);
  const body = (await res.json()) as { data: StationMarker[] };
  return body.data;
}

export async function startSession(input: {
  ocpiLocationId: string;
  ocpiEvseUid: string;
}): Promise<ChargingSession> {
  const res = await fetch(`${publicApiBase()}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as { data?: ChargingSession; message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(msg ?? `Start failed: ${res.status}`);
  }
  return body.data!;
}

export async function stopSession(sessionId: string): Promise<ChargingSession> {
  const res = await fetch(`${publicApiBase()}/sessions/${sessionId}/stop`, { method: 'POST' });
  const body = (await res.json()) as { data?: ChargingSession; message?: string | string[] };
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(msg ?? `Stop failed: ${res.status}`);
  }
  return body.data!;
}

export async function fetchSession(sessionId: string): Promise<ChargingSession> {
  const res = await fetch(`${publicApiBase()}/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to load session: ${res.status}`);
  const body = (await res.json()) as { data: ChargingSession };
  return body.data;
}
