/**
 * @file useSessionSocket.ts
 * @module @voltaway/web
 *
 * Scopo: sottoscrizione WebSocket per aggiornamenti real-time della sessione attiva.
 * Flusso: web → Socket.IO (/sessions) → evento session.updated → stato UI.
 * Dipendenze: socket.io-client, @/lib/api.
 */
'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { ChargingSession } from '@/lib/api';
import { publicApiBase } from '@/lib/api';

export function useSessionSocket(
  sessionId: string | null,
  onUpdate: (session: ChargingSession) => void,
) {
  useEffect(() => {
    if (!sessionId) return;

    // Connessione al namespace sessioni; fallback polling se WebSocket non disponibile
    const socket = io(`${publicApiBase()}/sessions`, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    socket.on('session.updated', (payload: ChargingSession) => {
      // Ignora eventi di altre sessioni (es. tab multipli)
      if (payload.id === sessionId) onUpdate(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, onUpdate]);
}
