/**
 * @file MapScreen.tsx
 * @module @voltaway/web
 *
 * Scopo: schermata principale — mappa, bottom sheet, sessione attiva e azioni ricarica.
 * Flusso: web → API (/stations, /sessions) + WebSocket → UI mappa/sheet/banner.
 * Dipendenze: @/lib/api, useSessionSocket, StationsMap, GlassBottomSheet.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Zap } from 'lucide-react';

import {
  fetchStations,
  startSession,
  stopSession,
  type ChargingSession,
  type StationMarker,
} from '@/lib/api';
import { useSessionSocket } from '@/hooks/useSessionSocket';
import { GlassBottomSheet, type SheetHeight } from '@/components/ui/glass-bottom-sheet';
import { Button } from '@/components/ui/button';
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
      // Ricarica colonnine al termine sessione per aggiornare stati EVSE
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
      setSheetHeight('peek'); // Riduce sheet per mostrare banner sessione sulla mappa
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
    <div className="fixed inset-0 overflow-hidden bg-sky-50/50">
      <StationsMap
        stations={stations}
        selectedUid={selected?.ocpiEvseUid}
        onSelect={selectStation}
      />

      <header className="pointer-events-none absolute left-3 right-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-10 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2.5 shadow-lg shadow-slate-900/8 backdrop-blur-xl">
          <Zap className="size-4 text-primary" strokeWidth={2.5} />
          <span className="text-sm font-bold tracking-tight text-foreground">Voltaway</span>
        </div>
        <Button
          type="button"
          variant="glass"
          size="icon"
          className="pointer-events-auto rounded-full"
          onClick={() => void load()}
          disabled={loading}
          aria-label="Aggiorna colonnine"
        >
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        </Button>
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
        <div
          className="absolute left-3 right-3 top-[calc(5.5rem+env(safe-area-inset-top,0px))] z-[12] rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-lg backdrop-blur-md"
          role="alert"
        >
          {error}
        </div>
      )}

      <GlassBottomSheet height={sheetHeight} onHeightChange={setSheetHeight}>
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
            <h3 className="mb-3 text-lg font-bold tracking-tight">Colonnine vicine</h3>
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
      </GlassBottomSheet>
    </div>
  );
}
