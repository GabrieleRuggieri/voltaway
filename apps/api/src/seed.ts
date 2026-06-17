/**
 * @file seed.ts
 * @module @voltaway/api
 *
 * Scopo: Popola il database con CPO, stazioni ed EVSE di demo (Catania) se assenti.
 * Flusso: main (bootstrap) → seed → db (cpos, stations, evses)
 * Dipendenze: drizzle-orm, @voltaway/db
 * Endpoint / export principali: seedDatabase()
 */
import { eq } from 'drizzle-orm';
import { cpos, evses, stations, type Db } from '@voltaway/db';

export async function seedDatabase(db: Db) {
  const existing = await db.select().from(cpos).where(eq(cpos.code, 'sim-cpo')).limit(1);
  let cpoId = existing[0]?.id;

  if (!cpoId) {
    const [inserted] = await db
      .insert(cpos)
      .values({ code: 'sim-cpo', name: 'Voltaway Sim CPO' })
      .returning();
    cpoId = inserted!.id;
  }

  const stationRows = [
    {
      cpoId,
      ocpiLocationId: 'loc-catania-duomo',
      name: 'Hub Duomo',
      address: 'Piazza del Duomo',
      city: 'Catania',
      latitude: 37.5079,
      longitude: 15.083,
    },
    {
      cpoId,
      ocpiLocationId: 'loc-catania-porto',
      name: 'Porto Charge',
      address: 'Via Cardinale Dusmet 2',
      city: 'Catania',
      latitude: 37.5028,
      longitude: 15.0962,
    },
  ];

  for (const row of stationRows) {
    // Upsert per ocpiLocationId: evita duplicati se il seed viene rieseguito
    const found = await db
      .select()
      .from(stations)
      .where(eq(stations.ocpiLocationId, row.ocpiLocationId))
      .limit(1);

    let stationId = found[0]?.id;
    if (!stationId) {
      const [inserted] = await db.insert(stations).values(row).returning();
      stationId = inserted!.id;
    }

    const evseRows = [
      {
        stationId,
        ocpiEvseUid: `${row.ocpiLocationId}-evse-1`,
        status: 'AVAILABLE' as const,
        maxPowerKw: 50,
        tariffId: 'tariff-standard',
      },
      {
        stationId,
        ocpiEvseUid: `${row.ocpiLocationId}-evse-2`,
        status: 'AVAILABLE' as const,
        maxPowerKw: 22,
        tariffId: 'tariff-economy',
      },
    ];

    for (const evse of evseRows) {
      const evseFound = await db
        .select()
        .from(evses)
        .where(eq(evses.ocpiEvseUid, evse.ocpiEvseUid))
        .limit(1);
      if (evseFound.length === 0) {
        await db.insert(evses).values(evse);
      }
    }
  }
}
