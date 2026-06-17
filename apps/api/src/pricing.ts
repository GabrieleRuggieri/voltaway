/**
 * @file pricing.ts
 * @module @voltaway/api
 *
 * Scopo: Adatta tariffe OCPI al motore di pricing Voltaway e calcola quote/prezzi finali per le sessioni.
 * Flusso: stations/sessions → pricing → @voltaway/core (computeAllInPrice)
 * Dipendenze: @voltaway/core, @voltaway/ocpi
 * Endpoint / export principali: mapOcpiTariff, quoteFromOcpiTariff, finalTotalFromCdr, DEFAULT_VOLTAWAY_FEE
 */
import { computeAllInPrice } from '@voltaway/core';
import type { AllInQuote, CpoTariff, FeePolicy, SessionEstimate } from '@voltaway/core';
import type { OcpiTariff } from '@voltaway/ocpi';

export const DEFAULT_VOLTAWAY_FEE: FeePolicy = { type: 'flat', value: 0.29 };
export const DEFAULT_ESTIMATE: SessionEstimate = { kWh: 20, minutes: 40 };

export function mapOcpiTariff(tariff: OcpiTariff): CpoTariff {
  // OCPI annida i componenti prezzo negli elementi; li appiattiamo per il motore core
  const components = tariff.elements.flatMap((e) => e.price_components);
  return {
    id: tariff.id,
    currency: tariff.currency,
    components: components.map((c) => ({
      type: c.type as CpoTariff['components'][number]['type'],
      price: c.price,
      stepSize: c.step_size,
    })),
  };
}

export function quoteFromOcpiTariff(
  tariff: OcpiTariff,
  estimate: SessionEstimate = DEFAULT_ESTIMATE,
): AllInQuote {
  return computeAllInPrice({
    cpoTariff: mapOcpiTariff(tariff),
    voltawayFee: DEFAULT_VOLTAWAY_FEE,
    estimate,
  });
}

export function finalTotalFromCdr(cpoInclVat: number): number {
  // Somma fee flat Voltaway al costo CPO (IVA inclusa) e arrotonda a 2 decimali
  return Math.round((cpoInclVat + DEFAULT_VOLTAWAY_FEE.value) * 100) / 100;
}
