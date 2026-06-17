'use client';

import type { ChargingSession } from '@/lib/api';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function SessionBanner({
  session,
  loading,
  onStop,
  onTap,
}: {
  session: ChargingSession;
  loading?: boolean;
  onStop: () => void;
  onTap?: () => void;
}) {
  return (
    <div className="session-banner" role="status">
      <button
        type="button"
        className="session-banner-tap"
        onClick={onTap}
        aria-label="Dettagli sessione"
      >
        <div className="session-banner-pulse" />
        <div className="session-banner-body">
          <div>
            <p className="session-banner-label">Ricarica in corso</p>
            <p className="session-banner-title">{session.stationName ?? 'Sessione attiva'}</p>
          </div>
          <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
        </div>
        {session.status === 'COMPLETED' && session.finalTotal != null && (
          <p className="session-banner-total">
            Totale <strong>€{session.finalTotal.toFixed(2)}</strong>
            {session.finalKwh != null && ` · ${session.finalKwh} kWh`}
          </p>
        )}
      </button>
      {session.status === 'ACTIVE' && (
        <Button variant="danger" className="session-banner-cta" disabled={loading} onClick={onStop}>
          {loading ? 'Stop…' : 'Ferma'}
        </Button>
      )}
    </div>
  );
}
