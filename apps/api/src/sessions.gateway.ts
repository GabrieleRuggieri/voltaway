/**
 * @file sessions.gateway.ts
 * @module @voltaway/api
 *
 * Scopo: Gateway WebSocket che notifica in tempo reale gli aggiornamenti di stato delle sessioni.
 * Flusso: sessions.service → sessions.gateway → web (Socket.IO namespace /sessions)
 * Dipendenze: @nestjs/websockets, socket.io, sessions.service (SessionResponse)
 * Endpoint / export principali: emitSessionUpdate()
 */
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import type { SessionResponse } from './sessions.service';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/sessions',
})
export class SessionsGateway {
  @WebSocketServer()
  server!: Server;

  emitSessionUpdate(sessionId: string, payload: SessionResponse) {
    // Room dedicata + broadcast globale per client che non hanno fatto join esplicito
    this.server?.to(`session:${sessionId}`).emit('session.updated', payload);
    this.server?.emit('session.updated', payload);
  }
}
