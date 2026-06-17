import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SessionsController } from './sessions.controller';
import { StationsController } from './stations.controller';
import { DbModule } from './db.module';
import { OcpiModule } from './ocpi.module';

@Module({
  imports: [DbModule, OcpiModule],
  controllers: [HealthController, StationsController, SessionsController],
})
export class AppModule {}
