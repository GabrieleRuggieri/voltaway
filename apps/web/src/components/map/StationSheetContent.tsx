'use client';

import { ChevronLeft, Zap } from 'lucide-react';

import type { ChargingSession, StationMarker } from '@/lib/api';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StationPeekSummary({ stations }: { stations: StationMarker[] }) {
  const available = stations.filter((s) => s.status === 'AVAILABLE').length;
  const minPrice = stations.reduce<number | null>((min, s) => {
    if (s.allInPerKwh == null) return min;
    return min == null ? s.allInPerKwh : Math.min(min, s.allInPerKwh);
  }, null);

  return (
    <div>
      <p className="text-base font-bold tracking-tight">{stations.length} colonnine in zona</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {available} disponibili
        {minPrice != null && (
          <>
            {' '}
            · da <strong className="text-primary">€{minPrice.toFixed(2)}/kWh</strong> all-in
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-muted-foreground/80">
        Scorri su per l&apos;elenco · tocca un pin sulla mappa
      </p>
    </div>
  );
}

export function StationListItems({
  stations,
  selectedUid,
  activeSession,
  loadingKey,
  onSelect,
  onStart,
}: {
  stations: StationMarker[];
  selectedUid?: string;
  activeSession: ChargingSession | null;
  loadingKey: string | null;
  onSelect: (s: StationMarker) => void;
  onStart: (s: StationMarker) => void;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {stations.map((s) => {
        const isSelected = selectedUid === s.ocpiEvseUid;
        const busy = activeSession?.status === 'ACTIVE' && activeSession.evseUid === s.ocpiEvseUid;
        const canStart = s.status === 'AVAILABLE' && !activeSession && loadingKey !== s.ocpiEvseUid;

        return (
          <li key={`${s.ocpiLocationId}-${s.ocpiEvseUid}`}>
            <Card
              className={cn(
                'cursor-pointer transition-all hover:bg-white/90',
                isSelected && 'ring-2 ring-primary/30',
              )}
            >
              <button
                type="button"
                className="w-full border-none bg-transparent p-0 text-left"
                onClick={() => onSelect(s)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-[15px]">{s.name}</strong>
                    <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {s.maxPowerKw} kW · {s.address}
                  </p>
                  {s.allInPerKwh != null && (
                    <p className="mt-2 text-sm font-bold text-primary">
                      €{s.allInPerKwh.toFixed(2)}/kWh all-in
                    </p>
                  )}
                  {busy ? (
                    <p className="mt-2 text-sm text-cyan-600">Sessione attiva</p>
                  ) : (
                    <Button
                      variant="default"
                      className="mt-3 w-full"
                      disabled={!canStart || loadingKey === s.ocpiEvseUid}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(s);
                      }}
                    >
                      {loadingKey === s.ocpiEvseUid ? 'Avvio…' : 'Avvia ricarica'}
                    </Button>
                  )}
                </CardContent>
              </button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function StationDetailPanel({
  station,
  activeSession,
  loadingKey,
  onBack,
  onStart,
}: {
  station: StationMarker;
  activeSession: ChargingSession | null;
  loadingKey: string | null;
  onBack: () => void;
  onStart: (s: StationMarker) => void;
}) {
  const busy = activeSession?.status === 'ACTIVE' && activeSession.evseUid === station.ocpiEvseUid;
  const canStart =
    station.status === 'AVAILABLE' && !activeSession && loadingKey !== station.ocpiEvseUid;

  return (
    <div>
      <button
        type="button"
        className="mb-2 flex items-center gap-1 border-none bg-transparent p-0 text-sm font-semibold text-primary"
        onClick={onBack}
      >
        <ChevronLeft className="size-4" />
        Elenco
      </button>
      <h2 className="text-xl font-bold tracking-tight">{station.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {station.address}, {station.city}
      </p>
      <div className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground">
        <Badge variant={statusVariant(station.status)}>{station.status}</Badge>
        <span>{station.maxPowerKw} kW</span>
      </div>
      {station.allInPerKwh != null && (
        <Card className="mt-4 border-primary/20 bg-gradient-to-br from-emerald-50/90 to-cyan-50/70">
          <CardContent className="p-4">
            <div className="flex items-baseline gap-1">
              <Zap className="mb-1 size-5 text-primary" />
              <span className="text-3xl font-extrabold tracking-tight text-primary">
                €{station.allInPerKwh.toFixed(2)}
              </span>
              <span className="text-base font-medium text-primary/80">/kWh all-in</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Prezzo finale mostrato prima di attaccare il cavo
            </p>
          </CardContent>
        </Card>
      )}
      {busy ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Hai già una sessione attiva su questo punto
        </p>
      ) : (
        <Button
          variant="default"
          size="lg"
          className="mt-4 w-full"
          disabled={!canStart || loadingKey === station.ocpiEvseUid}
          onClick={() => onStart(station)}
        >
          {loadingKey === station.ocpiEvseUid ? 'Avvio in corso…' : 'Avvia ricarica qui'}
        </Button>
      )}
    </div>
  );
}
