import { StationsMap } from "@/components/StationsMap";
import { fetchStations, type StationMarker } from "@/lib/api";

export default async function HomePage() {
  let stations: StationMarker[] = [];
  let error: string | null = null;

  try {
    stations = await fetchStations();
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento stazioni";
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Voltaway</p>
          <h1>Prezzo reale prima di attaccare</h1>
          <p className="subtitle">
            Mappa demo con stazioni simulate via OCPI — Milano beachhead
          </p>
        </div>
        <div className="stats">
          <span>{stations.length} punti</span>
        </div>
      </header>

      {error ? (
        <div className="error">{error}</div>
      ) : (
        <StationsMap stations={stations} />
      )}

      <section className="list">
        {stations.map((s) => (
          <article key={s.id} className="card">
            <h2>{s.name}</h2>
            <p>{s.address}, {s.city}</p>
            <p>
              {s.maxPowerKw} kW · {s.status}
              {s.allInPerKwh != null && (
                <> · <strong>€{s.allInPerKwh.toFixed(2)}/kWh all-in</strong></>
              )}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
