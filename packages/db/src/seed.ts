import { eq } from "drizzle-orm";
import { createDb, cpos, stations, evses } from "./index.js";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const db = createDb(url);

  const existing = await db.select().from(cpos).where(eq(cpos.code, "sim-cpo")).limit(1);
  let cpoId = existing[0]?.id;

  if (!cpoId) {
    const [inserted] = await db.insert(cpos).values({ code: "sim-cpo", name: "Voltaway Sim CPO" }).returning();
    cpoId = inserted!.id;
  }

  const stationRows = [
    {
      cpoId,
      ocpiLocationId: "loc-milano-centro",
      name: "Hub Duomo",
      address: "Piazza del Duomo",
      city: "Milano",
      latitude: 45.4642,
      longitude: 9.19,
    },
    {
      cpoId,
      ocpiLocationId: "loc-milano-navigli",
      name: "Navigli Charge",
      address: "Alzaia Naviglio Grande 12",
      city: "Milano",
      latitude: 45.4481,
      longitude: 9.1762,
    },
  ];

  for (const row of stationRows) {
    const [station] = await db.insert(stations).values(row).onConflictDoNothing().returning();
    if (!station) continue;

    await db.insert(evses).values([
      {
        stationId: station.id,
        ocpiEvseUid: `${row.ocpiLocationId}-evse-1`,
        status: "AVAILABLE",
        maxPowerKw: 50,
        tariffId: "tariff-standard",
      },
      {
        stationId: station.id,
        ocpiEvseUid: `${row.ocpiLocationId}-evse-2`,
        status: "AVAILABLE",
        maxPowerKw: 22,
        tariffId: "tariff-economy",
      },
    ]).onConflictDoNothing();
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
