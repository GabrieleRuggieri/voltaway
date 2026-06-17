'use client';

import type { ChargingSession, StationMarker } from '@/lib/api';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function StationPeekSummary({ stations }: { stations: StationMarker[] }) {
  const available = stations.filter((s) => s.status === 'AVAILABLE').length;
  const minPrice = stations.reduce<number | null>((min, s) => {
    if (s.allInPerKwh == null) return min;
    return min == null ? s.allInPerKwh : Math.min(min, s.allInPerKwh);
  }, null);

  return (
    <div className="sheet-peek">
      <p className="sheet-peek-title">{stations.length} colonnine in zona</p>
      <p className="sheet-peek-sub">
        {available} disponibili
        {minPrice != null && (
          <>
            {' '}
            · da <strong>€{minPrice.toFixed(2)}/kWh</strong> all-in
          </>
        )}
      </p>
      <p className="sheet-peek-hint">Scorri su per l&apos;elenco · tocca un pin sulla mappa</p>
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
    <ul className="station-list">
      {stations.map((s) => {
        const isSelected = selectedUid === s.ocpiEvseUid;
        const busy = activeSession?.status === 'ACTIVE' && activeSession.evseUid === s.ocpiEvseUid;
        const canStart = s.status === 'AVAILABLE' && !activeSession && loadingKey !== s.ocpiEvseUid;

        return (
          <li key={`${s.ocpiLocationId}-${s.ocpiEvseUid}`}>
            <button
              type="button"
              className={`station-list-item${isSelected ? ' station-list-item--selected' : ''}`}
              onClick={() => onSelect(s)}
            >
              <div className="station-list-item-top">
                <strong>{s.name}</strong>
                <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
              </div>
              <p className="station-list-item-meta">
                {s.maxPowerKw} kW · {s.address}
              </p>
              {s.allInPerKwh != null && (
                <p className="station-list-item-price">€{s.allInPerKwh.toFixed(2)}/kWh all-in</p>
              )}
              {busy ? (
                <p className="station-list-item-hint">Sessione attiva</p>
              ) : (
                <Button
                  variant="primary"
                  className="station-list-item-cta"
                  disabled={!canStart || loadingKey === s.ocpiEvseUid}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(s);
                  }}
                >
                  {loadingKey === s.ocpiEvseUid ? 'Avvio…' : 'Avvia ricarica'}
                </Button>
              )}
            </button>
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
    <div className="station-detail">
      <button type="button" className="station-detail-back" onClick={onBack}>
        ← Elenco
      </button>
      <h2>{station.name}</h2>
      <p className="station-detail-address">
        {station.address}, {station.city}
      </p>
      <div className="station-detail-specs">
        <Badge variant={statusVariant(station.status)}>{station.status}</Badge>
        <span>{station.maxPowerKw} kW</span>
      </div>
      {station.allInPerKwh != null && (
        <div className="price-hero">
          <span className="price-hero-value">€{station.allInPerKwh.toFixed(2)}</span>
          <span className="price-hero-unit">/kWh all-in</span>
          <p className="price-hero-note">Prezzo finale mostrato prima di attaccare il cavo</p>
        </div>
      )}
      {busy ? (
        <p className="station-detail-hint">Hai già una sessione attiva su questo punto</p>
      ) : (
        <Button
          variant="primary"
          className="station-detail-cta"
          disabled={!canStart || loadingKey === station.ocpiEvseUid}
          onClick={() => onStart(station)}
        >
          {loadingKey === station.ocpiEvseUid ? 'Avvio in corso…' : 'Avvia ricarica qui'}
        </Button>
      )}
    </div>
  );
}
