import { StationsMap } from '@/components/StationsMap';
import { StationList } from '@/components/StationList';
import { fetchStations } from '@/lib/api';

export default async function HomePage() {
  let stations: Awaited<ReturnType<typeof fetchStations>> = [];
  let error: string | null = null;

  try {
    stations = await fetchStations();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Errore caricamento stazioni';
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Voltaway</p>
          <h1>Prezzo reale prima di attaccare</h1>
          <p className="subtitle">Mappa demo con stazioni simulate via OCPI — Milano beachhead</p>
        </div>
        <div className="stats">
          <span>{stations.length} punti</span>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : <StationsMap stations={stations} />}

      <StationList stations={stations} />
    </main>
  );
}
