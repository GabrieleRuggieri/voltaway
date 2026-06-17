import { computeAllInPrice } from '@voltaway/core';
import type { AllInQuote, CpoTariff, FeePolicy, SessionEstimate } from '@voltaway/core';
import type { OcpiTariff } from '@voltaway/ocpi';

export const DEFAULT_VOLTAWAY_FEE: FeePolicy = { type: 'flat', value: 0.29 };
export const DEFAULT_ESTIMATE: SessionEstimate = { kWh: 20, minutes: 40 };

export function mapOcpiTariff(tariff: OcpiTariff): CpoTariff {
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
  return Math.round((cpoInclVat + DEFAULT_VOLTAWAY_FEE.value) * 100) / 100;
}
