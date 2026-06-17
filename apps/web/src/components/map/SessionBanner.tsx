'use client';

import type { ChargingSession } from '@/lib/api';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card
      className="absolute left-3 right-3 top-[calc(4.25rem+env(safe-area-inset-top,0px))] z-[11] border-emerald-200/60 bg-white/85"
      role="status"
    >
      <CardContent className="flex items-stretch gap-2 p-3">
        <button
          type="button"
          className="relative flex-1 border-none bg-transparent p-0 text-left"
          onClick={onTap}
          aria-label="Dettagli sessione"
        >
          <span className="absolute left-0 top-1 size-2 rounded-full bg-emerald-500 charge-pulse" />
          <div className="flex items-start justify-between gap-2 pl-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Ricarica in corso
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {session.stationName ?? 'Sessione attiva'}
              </p>
            </div>
            <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
          </div>
          {session.status === 'COMPLETED' && session.finalTotal != null && (
            <p className="mt-2 pl-4 text-sm text-muted-foreground">
              Totale <strong className="text-foreground">€{session.finalTotal.toFixed(2)}</strong>
              {session.finalKwh != null && ` · ${session.finalKwh} kWh`}
            </p>
          )}
        </button>
        {session.status === 'ACTIVE' && (
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0 self-center"
            disabled={loading}
            onClick={onStop}
          >
            {loading ? 'Stop…' : 'Ferma'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
