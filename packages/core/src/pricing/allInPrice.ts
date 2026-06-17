import type {
  AllInQuote,
  CpoTariff,
  FeePolicy,
  SessionEstimate,
  TariffComponentType,
} from '../types.js';

function componentCost(
  type: TariffComponentType,
  components: CpoTariff['components'],
  estimate: SessionEstimate,
): number {
  const items = components.filter((c) => c.type === type);
  return items.reduce((sum, item) => {
    if (item.type === 'ENERGY') return sum + item.price * estimate.kWh;
    if (item.type === 'TIME' || item.type === 'PARKING_TIME') {
      const step = item.stepSize ?? 1;
      const units = Math.ceil(estimate.minutes / step);
      return sum + item.price * units;
    }
    return sum + item.price;
  }, 0);
}

export function computeAllInPrice(input: {
  cpoTariff: CpoTariff;
  voltawayFee: FeePolicy;
  estimate: SessionEstimate;
}): AllInQuote {
  const { cpoTariff, voltawayFee, estimate } = input;
  const energy = componentCost('ENERGY', cpoTariff.components, estimate);
  const time = componentCost('TIME', cpoTariff.components, estimate);
  const flat = componentCost('FLAT', cpoTariff.components, estimate);
  const parking = componentCost('PARKING_TIME', cpoTariff.components, estimate);
  const subtotal = energy + time + flat + parking;

  const discount = voltawayFee.premiumDiscountPercent ?? 0;
  const feeBase = subtotal * (1 - discount / 100);
  const voltawayFeeAmount =
    voltawayFee.type === 'percent' ? feeBase * (voltawayFee.value / 100) : voltawayFee.value;

  const totalEstimate = subtotal + voltawayFeeAmount;
  const allInPerKwh = estimate.kWh > 0 ? totalEstimate / estimate.kWh : totalEstimate;

  return {
    allInPerKwh: round2(allInPerKwh),
    totalEstimate: round2(totalEstimate),
    currency: cpoTariff.currency,
    breakdown: {
      energy: round2(energy),
      time: round2(time),
      flat: round2(flat),
      parking: round2(parking),
      voltawayFee: round2(voltawayFeeAmount),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
