'use client';

import { useCallback, useState } from 'react';
import { startSession, stopSession, type ChargingSession, type StationMarker } from '@/lib/api';
import { useSessionSocket } from '@/hooks/useSessionSocket';

type Props = {
  stations: StationMarker[];
  onSessionChange?: () => void;
};

function statusClass(status: string): string {
  if (status === 'AVAILABLE') return 'badge badge-available';
  if (status === 'CHARGING') return 'badge badge-charging';
  if (status === 'OUTOFORDER') return 'badge badge-down';
  return 'badge';
}

export function StationList({ stations, onSessionChange }: Props) {
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocketUpdate = useCallback(
    (session: ChargingSession) => {
      setActiveSession(session);
      if (session.status === 'COMPLETED' || session.status === 'FAILED') {
        onSessionChange?.();
      }
    },
    [onSessionChange],
  );

  useSessionSocket(activeSession?.id ?? null, handleSocketUpdate);

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
      onSessionChange?.();
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
      onSessionChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stop fallito');
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <>
      {activeSession && (
        <section className="session-panel">
          <div className="session-panel-main">
            <p className="eyebrow">Sessione live</p>
            <h2>{activeSession.stationName ?? 'Ricarica'}</h2>
            <div className="session-meta">
              <span className={`badge badge-session badge-${activeSession.status.toLowerCase()}`}>
                {activeSession.status}
              </span>
              {activeSession.quotedAllInPerKwh != null && (
                <span>Preventivo €{activeSession.quotedAllInPerKwh.toFixed(2)}/kWh</span>
              )}
            </div>
            {activeSession.status === 'COMPLETED' && activeSession.finalTotal != null && (
              <p className="session-total">
                Totale <strong>€{activeSession.finalTotal.toFixed(2)}</strong>
                {activeSession.finalKwh != null && (
                  <span> · {activeSession.finalKwh} kWh erogati</span>
                )}
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
                onClick={() => void handleStop()}
              >
                {loadingKey === 'stop' ? 'Stop…' : 'Ferma ricarica'}
              </button>
            )}
            {['COMPLETED', 'FAILED'].includes(activeSession.status) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveSession(null)}
              >
                Chiudi
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
              <div className="card-top">
                <h2>{s.name}</h2>
                <span className={statusClass(s.status)}>{s.status}</span>
              </div>
              <p className="card-address">
                {s.address}, {s.city}
              </p>
              <div className="card-specs">
                <span>{s.maxPowerKw} kW</span>
                {s.allInPerKwh != null && (
                  <span className="price-tag">€{s.allInPerKwh.toFixed(2)}/kWh all-in</span>
                )}
              </div>
              {busy ? (
                <p className="card-hint">Sessione attiva su questo punto</p>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canStart || loadingKey === s.ocpiEvseUid}
                  onClick={() => void handleStart(s)}
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
