import { Worker } from "bullmq";
import { OcpiClient } from "@voltaway/ocpi";

const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";
const apiBase = process.env.API_INTERNAL_URL ?? "http://api:3001";

const connection = { url: redisUrl };

const ocpi = new OcpiClient({
  baseUrl: process.env.OCPI_BASE_URL ?? "http://ocpi-sim:4000",
  token: process.env.OCPI_TOKEN ?? "sim-token",
});

async function syncAvailability() {
  const locations = await ocpi.getLocations();
  const res = await fetch(`${apiBase}/stations/sync`, { method: "GET" });
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
  console.log(`availability.sync: ${locations.length} locations, api sync ok`);
}

const worker = new Worker(
  "voltaway",
  async (job) => {
    if (job.name === "availability.sync") {
      await syncAvailability();
      return;
    }
    console.log(`unknown job: ${job.name}`);
  },
  { connection },
);

worker.on("ready", () => console.log("worker ready"));

// Schedule periodic sync every 60s in dev
setInterval(async () => {
  try {
    await syncAvailability();
  } catch (err) {
    console.error("sync error:", err);
  }
}, 60_000);

console.log("worker started");
