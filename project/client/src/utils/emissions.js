export const EMISSION_FACTORS_KG_PER_MILE = {
  car: 0.404,
  bus: 0.150,
  bike: 0,
  walk: 0
};

export function computeEmissions(distanceMiles, mode) {
  const d = Number(distanceMiles) || 0;

  const car = d * EMISSION_FACTORS_KG_PER_MILE.car;
  const chosen = d * (EMISSION_FACTORS_KG_PER_MILE[mode] ?? 0);
  const saved = car - chosen;

  return {
    distanceMiles: round2(d),
    mode,
    carKg: round2(car),
    chosenKg: round2(chosen),
    savedKg: round2(saved),
    factors: EMISSION_FACTORS_KG_PER_MILE
  };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}