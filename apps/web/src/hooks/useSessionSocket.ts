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

    const socket = io(`${publicApiBase()}/sessions`, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    socket.on('session.updated', (payload: ChargingSession) => {
      if (payload.id === sessionId) onUpdate(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, onUpdate]);
}
