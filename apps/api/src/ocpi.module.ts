import { Global, Module } from '@nestjs/common';
import { OcpiClient } from '@voltaway/ocpi';

export const OCPI = Symbol('OCPI');

@Global()
@Module({
  providers: [
    {
      provide: OCPI,
      useFactory: () =>
        new OcpiClient({
          baseUrl: process.env.OCPI_BASE_URL ?? 'http://ocpi-sim:4000',
          token: process.env.OCPI_TOKEN ?? 'sim-token',
        }),
    },
  ],
  exports: [OCPI],
})
export class OcpiModule {}
