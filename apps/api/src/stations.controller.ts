import { Controller, Get, Inject, Query } from '@nestjs/common';
import { evses, stations, type Db } from '@voltaway/db';
import type { OcpiClient } from '@voltaway/ocpi';
import { eq } from 'drizzle-orm';
import { DB } from './db.module';
import { OCPI } from './ocpi.module';
import { quoteFromOcpiTariff } from './pricing';

@Controller('stations')
export class StationsController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(OCPI) private readonly ocpi: OcpiClient,
  ) {}

  @Get()
  async list(
    @Query('minLat') minLat?: string,
    @Query('minLng') minLng?: string,
    @Query('maxLat') maxLat?: string,
    @Query('maxLng') maxLng?: string,
  ) {
    const bbox =
      minLat && minLng && maxLat && maxLng
        ? {
            minLat: Number(minLat),
            minLng: Number(minLng),
            maxLat: Number(maxLat),
            maxLng: Number(maxLng),
          }
        : undefined;

    const ocpiLocations = await this.ocpi.getLocations(bbox);
    const dbStations = await this.db.select().from(stations);

    const items = await Promise.all(
      ocpiLocations.flatMap((loc) =>
        loc.evses.map(async (evse) => {
          const dbStation = dbStations.find((s) => s.ocpiLocationId === loc.id);
          const tariffId = evse.tariff_id ?? 'tariff-standard';
          const ocpiTariff = await this.ocpi.getTariff(tariffId);

          let allInPerKwh: number | null = null;
          let totalEstimate: number | null = null;

          if (ocpiTariff) {
            const quote = quoteFromOcpiTariff(ocpiTariff);
            allInPerKwh = quote.allInPerKwh;
            totalEstimate = quote.totalEstimate;
          }

          return {
            id: dbStation?.id ?? loc.id,
            ocpiLocationId: loc.id,
            ocpiEvseUid: evse.uid,
            name: loc.name,
            address: loc.address,
            city: loc.city,
            latitude: Number(loc.coordinates.latitude),
            longitude: Number(loc.coordinates.longitude),
            status: evse.status,
            maxPowerKw: evse.max_power_kw,
            tariffId,
            allInPerKwh,
            totalEstimate,
            currency: ocpiTariff?.currency ?? 'EUR',
          };
        }),
      ),
    );

    return { data: items, count: items.length };
  }

  @Get('sync')
  async syncFromOcpi() {
    const locations = await this.ocpi.getLocations();
    let synced = 0;

    for (const loc of locations) {
      const existing = await this.db
        .select()
        .from(stations)
        .where(eq(stations.ocpiLocationId, loc.id))
        .limit(1);

      if (existing.length === 0) continue;

      for (const evse of loc.evses) {
        await this.db
          .update(evses)
          .set({ status: evse.status, tariffId: evse.tariff_id ?? null })
          .where(eq(evses.ocpiEvseUid, evse.uid));
        synced++;
      }
    }

    return { synced };
  }
}
