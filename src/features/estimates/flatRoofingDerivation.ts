/**
 * Frontend mirror of backend deriveFlatRoofMeasurements (flat-roofing-measurements.util.ts).
 * Diagnostic-only (no plan2d). Flat roof: labor area === roof area (no slope).
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

function normalizeMembraneType(type: unknown): 'bitumen' | 'tpo' | 'pvc' | 'epdm' {
  const n = String(type ?? 'bitumen_membrane').toLowerCase();
  if (n === 'tpo') return 'tpo';
  if (n === 'pvc') return 'pvc';
  if (n === 'epdm') return 'epdm';
  return 'bitumen';
}

export type DerivedMeasurements = Record<string, number>;

export function deriveFlatRoofMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const roofArea = Math.max(
    5,
    readNumber(diagnostic, 'roofArea') ?? readNumber(diagnostic, 'baseArea') ?? 30,
  );
  m.roofArea = roofArea;
  m.baseArea = roofArea;
  m.roofAreaLabor = roofArea;

  const perimeterEstimate = round2(Math.sqrt(roofArea) * 4);

  const insulationThicknessCm = readNumber(diagnostic, 'insulationThicknessCm') ?? 10;
  m.insulationThicknessCm = insulationThicknessCm;
  m.insulationArea = roofArea;
  m.insulationVolumeM3 = round2(roofArea * (insulationThicknessCm / 100));
  m.vaporBarrierArea = roofArea;

  const membraneType = normalizeMembraneType(diagnostic.waterproofingType);
  m.membraneAreaBitumen = membraneType === 'bitumen' ? roofArea : 0;
  m.membraneAreaTpo = membraneType === 'tpo' ? roofArea : 0;
  m.membraneAreaPvc = membraneType === 'pvc' ? roofArea : 0;
  m.membraneAreaEpdm = membraneType === 'epdm' ? roofArea : 0;

  m.drainCount = Math.max(0, readNumber(diagnostic, 'drainCount') ?? 0);

  const parapetLengthM = readNumber(diagnostic, 'parapetLengthM') ?? Math.max(0, perimeterEstimate);
  const parapetHeightM = Math.max(0, readNumber(diagnostic, 'parapetHeightM') ?? 0.5);
  m.parapetLengthM = parapetLengthM;
  m.parapetHeightM = parapetHeightM;
  m.parapetFaceArea = round2(parapetLengthM * parapetHeightM);

  const isTerrace = readBoolean(diagnostic, 'isTerrace');
  m.terraceArea = Math.max(0, readNumber(diagnostic, 'terraceArea') ?? (isTerrace ? roofArea : 0));
  m.skylightCount = Math.max(0, readNumber(diagnostic, 'skylightCount') ?? 0);
  m.oldRoofRemovalArea = readBoolean(diagnostic, 'oldRoofRemoval') ? roofArea : 0;
  m.ballastArea = readBoolean(diagnostic, 'ballastIncluded') ? roofArea : 0;
  m.requiresManualReview = roofArea > 500 ? 1 : 0;

  return m;
}
