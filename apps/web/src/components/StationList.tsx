'use client';

import { useState } from 'react';
import {
  fetchSession,
  startSession,
  stopSession,
  type ChargingSession,
  type StationMarker,
} from '@/lib/api';

type Props = {
  stations: StationMarker[];
};

export function StationList({ stations }: Props) {
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(station: StationMarker) {
    const key = station.ocpiEvseUid;
    setLoadingKey(key);
    setError(null);
    try {
      const session = await startSession({
        ocpiLocationId: station.ocpiLocationId,
        ocpiEvseUid: station.ocpiEvseUid,
      });
      setActiveSession(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Avvio fallito');
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleStop() {
    if (!activeSession) return;
    setLoadingKey('stop');
    setError(null);
    try {
      const session = await stopSession(activeSession.id);
      setActiveSession(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stop fallito');
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleRefresh() {
    if (!activeSession) return;
    setLoadingKey('refresh');
    setError(null);
    try {
      const session = await fetchSession(activeSession.id);
      setActiveSession(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Aggiornamento fallito');
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <>
      {activeSession && (
        <section className="session-panel">
          <div>
            <p className="eyebrow">Sessione</p>
            <h2>{activeSession.stationName ?? 'Ricarica in corso'}</h2>
            <p>
              Stato: <strong>{activeSession.status}</strong>
              {activeSession.quotedAllInPerKwh != null && (
                <> · preventivo €{activeSession.quotedAllInPerKwh.toFixed(2)}/kWh</>
              )}
            </p>
            {activeSession.status === 'COMPLETED' && activeSession.finalTotal != null && (
              <p>
                Totale: <strong>€{activeSession.finalTotal.toFixed(2)}</strong>
                {activeSession.finalKwh != null && <> · {activeSession.finalKwh} kWh</>}
              </p>
            )}
            {activeSession.failureReason && (
              <p className="session-error">{activeSession.failureReason}</p>
            )}
          </div>
          <div className="session-actions">
            {activeSession.status === 'ACTIVE' && (
              <button
                type="button"
                className="btn btn-danger"
                disabled={loadingKey === 'stop'}
                onClick={handleStop}
              >
                {loadingKey === 'stop' ? 'Stop…' : 'Ferma ricarica'}
              </button>
            )}
            {activeSession.status === 'COMPLETED' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveSession(null)}
              >
                Chiudi
              </button>
            )}
            {activeSession.status === 'FAILED' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveSession(null)}
              >
                Chiudi
              </button>
            )}
            {!['COMPLETED', 'FAILED'].includes(activeSession.status) && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loadingKey === 'refresh'}
                onClick={handleRefresh}
              >
                Aggiorna
              </button>
            )}
          </div>
        </section>
      )}

      {error && <div className="error">{error}</div>}

      <section className="list">
        {stations.map((s) => {
          const busy =
            activeSession?.status === 'ACTIVE' && activeSession.evseUid === s.ocpiEvseUid;
          const canStart =
            s.status === 'AVAILABLE' && !activeSession && loadingKey !== s.ocpiEvseUid;

          return (
            <article key={`${s.ocpiLocationId}-${s.ocpiEvseUid}`} className="card">
              <h2>{s.name}</h2>
              <p>
                {s.address}, {s.city}
              </p>
              <p>
                {s.maxPowerKw} kW · {s.status}
                {s.allInPerKwh != null && (
                  <>
                    {' '}
                    · <strong>€{s.allInPerKwh.toFixed(2)}/kWh all-in</strong>
                  </>
                )}
              </p>
              {busy ? (
                <p className="card-hint">Sessione attiva su questo punto</p>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canStart || loadingKey === s.ocpiEvseUid}
                  onClick={() => handleStart(s)}
                >
                  {loadingKey === s.ocpiEvseUid ? 'Avvio…' : 'Avvia ricarica'}
                </button>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
