import { describe, expect, it } from "vitest";
import { computeAllInPrice } from "./allInPrice.js";

describe("computeAllInPrice", () => {
  it("calcola prezzo all-in con energia e fee fissa", () => {
    const quote = computeAllInPrice({
      cpoTariff: {
        id: "t1",
        currency: "EUR",
        components: [
          { type: "ENERGY", price: 0.45 },
          { type: "FLAT", price: 0.35 },
        ],
      },
      voltawayFee: { type: "flat", value: 0.29 },
      estimate: { kWh: 20, minutes: 40 },
    });

    expect(quote.totalEstimate).toBe(9.64);
    expect(quote.allInPerKwh).toBe(0.48);
    expect(quote.breakdown.energy).toBe(9);
    expect(quote.breakdown.voltawayFee).toBe(0.29);
  });

  it("applica markup percentuale", () => {
    const quote = computeAllInPrice({
      cpoTariff: {
        id: "t2",
        currency: "EUR",
        components: [{ type: "ENERGY", price: 0.5 }],
      },
      voltawayFee: { type: "percent", value: 5 },
      estimate: { kWh: 10, minutes: 30 },
    });

    expect(quote.totalEstimate).toBe(5.25);
    expect(quote.allInPerKwh).toBe(0.53);
  });
});
