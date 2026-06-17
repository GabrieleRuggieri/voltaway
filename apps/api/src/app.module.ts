/**
 * @file app.module.ts
 * @module @voltaway/api
 *
 * Scopo: Modulo radice NestJS che registra controller, provider e moduli condivisi (DB, OCPI).
 * Flusso: main → app.module → controller/service → db / ocpi
 * Dipendenze: DbModule, OcpiModule, HealthController, StationsController, SessionsController, SessionsService, SessionsGateway, QueueService
 * Endpoint / export principali: AppModule
 */
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { QueueService } from './queue.service';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway';
import { SessionsService } from './sessions.service';
import { StationsController } from './stations.controller';
import { DbModule } from './db.module';
import { OcpiModule } from './ocpi.module';

@Module({
  imports: [DbModule, OcpiModule],
  controllers: [HealthController, StationsController, SessionsController],
  providers: [SessionsService, SessionsGateway, QueueService],
})
export class AppModule {}
