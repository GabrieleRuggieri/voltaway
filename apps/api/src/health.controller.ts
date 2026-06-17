/**
 * @file health.controller.ts
 * @module @voltaway/api
 *
 * Scopo: Espone un endpoint di health check per monitoraggio e orchestrazione (Docker, load balancer).
 * Flusso: web / infra → api → GET /health
 * Dipendenze: @nestjs/common
 * Endpoint / export principali: GET /health
 */
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'api' };
  }
}
