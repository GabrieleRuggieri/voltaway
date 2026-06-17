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
      ocpiLocationId: 'loc-milano-centro',
      name: 'Hub Duomo',
      address: 'Piazza del Duomo',
      city: 'Milano',
      latitude: 45.4642,
      longitude: 9.19,
    },
    {
      cpoId,
      ocpiLocationId: 'loc-milano-navigli',
      name: 'Navigli Charge',
      address: 'Alzaia Naviglio Grande 12',
      city: 'Milano',
      latitude: 45.4481,
      longitude: 9.1762,
    },
  ];

  for (const row of stationRows) {
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
