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
    this.server?.to(`session:${sessionId}`).emit('session.updated', payload);
    this.server?.emit('session.updated', payload);
  }
}
