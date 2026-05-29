/**
 * Frontend mirror of backend derivePavajMeasurements (pavaj-measurements.util.ts).
 * Diagnostic-only (no plan2d). Closes the preview gap for excavation/gravel/sand
 * volumes, borders, geotextile, drainage and pattern/load-adjusted labor.
 */

function readNumber(source: Record<string, unknown> | null | undefined, key: string): number | undefined {
  const value = source?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readBoolean(source: Record<string, unknown> | null | undefined, key: string): boolean {
  const value = source?.[key];
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return false;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const estimatePerimeterFromArea = (area: number) => round2(Math.sqrt(area) * 4);

export function resolvePatternMultiplier(patternComplexity: unknown): number {
  const n = String(patternComplexity ?? 'simple').trim().toLowerCase();
  if (n === 'decorative') return 1.3;
  if (n === 'mixed') return 1.15;
  return 1.0;
}

export function resolveLoadMultiplier(vehicleLoad: unknown): number {
  const n = String(vehicleLoad ?? 'pedestrian').trim().toLowerCase();
  if (n === 'heavy') return 1.35;
  if (n === 'car') return 1.15;
  return 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function derivePavajMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const pavementArea = Math.max(1, readNumber(diagnostic, 'pavementArea') ?? 20);
  m.pavementArea = pavementArea;

  const manualBorderLength = readNumber(diagnostic, 'borderLengthM');
  m.borderLengthM =
    manualBorderLength != null && manualBorderLength > 0
      ? manualBorderLength
      : Math.max(4, estimatePerimeterFromArea(pavementArea));

  const baseLayerCm = readNumber(diagnostic, 'baseLayerCm') ?? 25;
  const gravelLayerCm = readNumber(diagnostic, 'gravelLayerCm') ?? 15;
  const sandLayerCm = readNumber(diagnostic, 'sandLayerCm') ?? 5;

  m.excavationVolumeM3 = round2((pavementArea * baseLayerCm) / 100);

  const loadMultiplier = resolveLoadMultiplier(diagnostic.vehicleLoad);
  m.loadMultiplier = loadMultiplier;
  m.gravelVolumeM3 = round2(((pavementArea * gravelLayerCm) / 100) * loadMultiplier);
  m.sandVolumeM3 = round2(((pavementArea * sandLayerCm) / 100) * loadMultiplier);

  m.geotextileArea = readBoolean(diagnostic, 'geotextileRequired') ? round2(pavementArea * 1.05) : 0;
  m.drainageLengthM = readBoolean(diagnostic, 'drainageRequired') ? round2(m.borderLengthM * 0.3) : 0;
  m.oldSurfaceRemovalArea = Math.max(0, readNumber(diagnostic, 'oldSurfaceRemovalArea') ?? 0);

  const patternMultiplier = resolvePatternMultiplier(diagnostic.patternComplexity);
  m.patternMultiplier = patternMultiplier;
  m.pavementLaborQty = round2(pavementArea * patternMultiplier * loadMultiplier);
  m.compactionArea = pavementArea;
  m.handoverUnits = 1;

  m.concreteBaseArea = Math.max(0, readNumber(diagnostic, 'concreteBaseArea') ?? 0);
  m.manholeCount = Math.max(0, readNumber(diagnostic, 'manholeCount') ?? 0);
  m.stepsLengthM = Math.max(0, readNumber(diagnostic, 'stepsLengthM') ?? 0);

  return m;
}
