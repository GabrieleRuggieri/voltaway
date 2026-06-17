'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchStations,
  startSession,
  stopSession,
  type ChargingSession,
  type StationMarker,
} from '@/lib/api';
import { useSessionSocket } from '@/hooks/useSessionSocket';
import { BottomSheet, type SheetHeight } from '@/components/ui/BottomSheet';
import { StationsMap } from '@/components/StationsMap';
import { SessionBanner } from '@/components/map/SessionBanner';
import {
  StationDetailPanel,
  StationListItems,
  StationPeekSummary,
} from '@/components/map/StationSheetContent';

export function MapScreen() {
  const [stations, setStations] = useState<StationMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>('peek');
  const [selected, setSelected] = useState<StationMarker | null>(null);
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore rete');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSocketUpdate = useCallback(
    (session: ChargingSession) => {
      setActiveSession(session);
      if (session.status === 'COMPLETED' || session.status === 'FAILED') {
        void load();
      }
    },
    [load],
  );

  useSessionSocket(activeSession?.id ?? null, handleSocketUpdate);

  function selectStation(station: StationMarker) {
    setSelected(station);
    setSheetHeight('half');
  }

  async function handleStart(station: StationMarker) {
    setActionKey(station.ocpiEvseUid);
    setError(null);
    try {
      const session = await startSession({
        ocpiLocationId: station.ocpiLocationId,
        ocpiEvseUid: station.ocpiEvseUid,
      });
      setActiveSession(session);
      setSheetHeight('peek');
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Avvio fallito');
    } finally {
      setActionKey(null);
    }
  }

  async function handleStop() {
    if (!activeSession) return;
    setActionKey('stop');
    setError(null);
    try {
      const session = await stopSession(activeSession.id);
      setActiveSession(session);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stop fallito');
    } finally {
      setActionKey(null);
    }
  }

  return (
    <div className="map-screen">
      <StationsMap
        stations={stations}
        selectedUid={selected?.ocpiEvseUid}
        onSelect={selectStation}
      />

      <header className="map-top-bar">
        <div className="map-brand">
          <span className="map-brand-mark">⚡</span>
          <span className="map-brand-name">Voltaway</span>
        </div>
        <button
          type="button"
          className="map-refresh"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? '…' : '↻'}
        </button>
      </header>

      {activeSession && (
        <SessionBanner
          session={activeSession}
          loading={actionKey === 'stop'}
          onStop={() => void handleStop()}
          onTap={() => setSheetHeight('half')}
        />
      )}

      {error && (
        <div className="map-toast" role="alert">
          {error}
        </div>
      )}

      <BottomSheet height={sheetHeight} onHeightChange={setSheetHeight}>
        {selected && sheetHeight !== 'peek' ? (
          <StationDetailPanel
            station={selected}
            activeSession={activeSession}
            loadingKey={actionKey}
            onBack={() => {
              setSelected(null);
              setSheetHeight('half');
            }}
            onStart={handleStart}
          />
        ) : sheetHeight === 'peek' ? (
          <StationPeekSummary stations={stations} />
        ) : (
          <>
            <h3 className="sheet-list-title">Colonnine vicine</h3>
            <StationListItems
              stations={stations}
              selectedUid={selected?.ocpiEvseUid}
              activeSession={activeSession}
              loadingKey={actionKey}
              onSelect={selectStation}
              onStart={handleStart}
            />
          </>
        )}
      </BottomSheet>
    </div>
  );
}
