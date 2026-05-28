/**
 * Допустимые единицы измерения для смет (A-04).
 * Синхронизировано с companii-api/prisma/estimate-measurement-units.ts
 */
export const ESTIMATE_MEASUREMENT_UNITS = [
  'm²',
  'm³',
  'm',
  'buc',
  'ore',
  'grade',
  'kWh',
] as const;

export type EstimateMeasurementUnit = (typeof ESTIMATE_MEASUREMENT_UNITS)[number];

const UNIT_ALIASES: Record<string, EstimateMeasurementUnit> = {
  m2: 'm²',
  'm²': 'm²',
  m3: 'm³',
  'm³': 'm³',
  m: 'm',
  buc: 'buc',
  ore: 'ore',
  h: 'ore',
  grade: 'grade',
  kwh: 'kWh',
  kWh: 'kWh',
};

export function normalizeEstimateUnit(raw: string): EstimateMeasurementUnit | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase() === 'kwh' ? 'kwh' : trimmed.toLowerCase();
  const normalized = UNIT_ALIASES[key] ?? UNIT_ALIASES[trimmed];
  if (normalized) return normalized;
  return (ESTIMATE_MEASUREMENT_UNITS as readonly string[]).includes(trimmed)
    ? (trimmed as EstimateMeasurementUnit)
    : null;
}

export function isEstimateMeasurementUnit(value: string): value is EstimateMeasurementUnit {
  return normalizeEstimateUnit(value) !== null;
}
