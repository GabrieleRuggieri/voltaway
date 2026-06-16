export type StationMarker = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  allInPerKwh: number | null;
  maxPowerKw: number;
};

export async function fetchStations(): Promise<StationMarker[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://api.voltaway.localhost";
  const res = await fetch(`${base}/stations`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Failed to load stations: ${res.status}`);
  const body = (await res.json()) as { data: StationMarker[] };
  return body.data;
}
