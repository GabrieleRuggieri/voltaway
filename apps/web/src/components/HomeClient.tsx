'use client';

import { useCallback, useEffect, useState } from 'react';
import { StationsMap } from '@/components/StationsMap';
import { StationList } from '@/components/StationList';
import { fetchStations, type StationMarker } from '@/lib/api';

export function HomeClient() {
  const [stations, setStations] = useState<StationMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento stazioni');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Voltaway</p>
          <h1>Prezzo reale prima di attaccare</h1>
          <p className="subtitle">
            Mappa live con stazioni simulate via OCPI — Milano beachhead. Avvia, monitora e ferma la
            ricarica in tempo reale.
          </p>
        </div>
        <div className="header-actions">
          <div className="stats">
            <span className="stats-value">{loading ? '…' : stations.length}</span>
            <span className="stats-label">punti</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void load()}
            disabled={loading}
          >
            Aggiorna mappa
          </button>
        </div>
      </header>

      {loading && <div className="loading">Caricamento stazioni…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <StationsMap stations={stations} />
          <StationList stations={stations} onSessionChange={() => void load()} />
        </>
      )}
    </main>
  );
}
