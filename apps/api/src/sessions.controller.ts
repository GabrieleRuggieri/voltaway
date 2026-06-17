/**
 * @file sessions.controller.ts
 * @module @voltaway/api
 *
 * Scopo: Espone REST per avviare, consultare e terminare sessioni di ricarica EV.
 * Flusso: web → api (sessions.controller) → sessions.service → ocpi / db
 * Dipendenze: @nestjs/common, SessionsService
 * Endpoint / export principali: GET /sessions/:id, POST /sessions, POST /sessions/:id/stop
 */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';

type StartSessionDto = {
  ocpiLocationId: string;
  ocpiEvseUid: string;
  estimateKwh?: number;
  estimateMinutes?: number;
};

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.sessions.get(id) };
  }

  @Post()
  async start(@Body() body: StartSessionDto) {
    return { data: await this.sessions.start(body) };
  }

  @Post(':id/stop')
  async stop(@Param('id') id: string) {
    return { data: await this.sessions.stop(id) };
  }
}
