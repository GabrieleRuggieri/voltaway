import express from "express";
import {
  getCdr,
  getTariff,
  isAuthorized,
  listLocations,
  startSession,
  stopSession,
} from "./store.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (!isAuthorized(req.header("authorization") ?? undefined)) {
    res.status(401).json({ status_code: 2001, status_message: "Unauthorized" });
    return;
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ocpi-sim" });
});

app.get("/ocpi/2.2.1/locations", (_req, res) => {
  res.json({ data: listLocations(), status_code: 1000, timestamp: new Date().toISOString() });
});

app.get("/ocpi/2.2.1/tariffs/:id", (req, res) => {
  const tariff = getTariff(req.params.id);
  if (!tariff) {
    res.status(404).json({ status_code: 2003, status_message: "Unknown tariff" });
    return;
  }
  res.json({ data: tariff, status_code: 1000, timestamp: new Date().toISOString() });
});

app.post("/ocpi/2.2.1/commands/START_SESSION", (req, res) => {
  try {
    const data = startSession({
      locationId: req.body.location_id,
      evseUid: req.body.evse_uid,
      tokenUid: req.body.token?.uid ?? "anonymous",
    });
    res.json({ data, status_code: 1000, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({
      status_code: 2000,
      status_message: err instanceof Error ? err.message : "Start failed",
    });
  }
});

app.post("/ocpi/2.2.1/commands/STOP_SESSION", (req, res) => {
  try {
    const cdr = stopSession(req.body.session_id);
    res.json({ data: cdr, status_code: 1000, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({
      status_code: 2000,
      status_message: err instanceof Error ? err.message : "Stop failed",
    });
  }
});

app.get("/ocpi/2.2.1/cdrs/:sessionId", (req, res) => {
  const cdr = getCdr(req.params.sessionId);
  if (!cdr) {
    res.status(404).json({ status_code: 2003, status_message: "CDR not found" });
    return;
  }
  res.json({ data: cdr, status_code: 1000, timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`ocpi-sim listening on :${port}`);
});
