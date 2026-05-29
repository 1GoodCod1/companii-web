import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';

const ROOF_COS_GUARD = 0.1;

function normalizeRoofShape(shape: unknown): string {
  return String(shape ?? 'rectangle').trim().toLowerCase().replace(/_/g, '-');
}

export function resolveRoofShapeMultiplier(roofShape: unknown, overrides?: PricingModifierOverrides): number {
  const n = normalizeRoofShape(roofShape);
  if (n === 'complex') return modifierFactor('acoperis.roofShape.complex', overrides, 50);
  if (n === 'l-shape' || n === 'l') return modifierFactor('acoperis.roofShape.l-shape', overrides, 20);
  if (n === 't-shape' || n === 't') return modifierFactor('acoperis.roofShape.t-shape', overrides, 35);
  if (n === 'u-shape' || n === 'u') return modifierFactor('acoperis.roofShape.u-shape', overrides, 35);
  return 1.0;
}

export function computeRoofAreaFromSlope(baseArea: number, roofSlopeDegrees: number): number {
  const slope = Math.min(75, Math.max(0, roofSlopeDegrees));
  const cosVal = Math.cos((slope * Math.PI) / 180);
  if (slope >= 70 || cosVal <= ROOF_COS_GUARD) return round2(baseArea * 1.15);
  return round2((baseArea / cosVal) * 1.12);
}

function deriveValleyLengthFromShape(roofShape: unknown, manualValley?: number): number {
  if (manualValley != null && manualValley > 0) return manualValley;
  const n = normalizeRoofShape(roofShape);
  if (n === 'l-shape' || n === 'l') return 12;
  if (n === 't-shape' || n === 'u-shape' || n === 't' || n === 'u') return 18;
  if (n === 'complex') return 24;
  return 0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveAcoperisMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const baseArea = Math.max(5, readNumber(diagnostic, 'baseArea') ?? 30);
  const roofSlope = Math.min(75, Math.max(0, readNumber(diagnostic, 'roofSlope') ?? 30));
  const roofShape = diagnostic.roofShape ?? 'rectangle';

  m.baseArea = baseArea;
  m.roofSlope = roofSlope;
  m.roofArea = computeRoofAreaFromSlope(baseArea, roofSlope);
  m.timberVolumeM3 = round2(m.roofArea * 0.07);

  const complexityMultiplier = resolveRoofShapeMultiplier(roofShape, overrides);
  m.complexityMultiplier = complexityMultiplier;
  m.roofAreaLabor = round2(m.roofArea * complexityMultiplier);

  m.valleyLengthM = deriveValleyLengthFromShape(roofShape, readNumber(diagnostic, 'valleyLengthM'));
  m.wallIntersectionLengthM = readNumber(diagnostic, 'wallIntersectionLengthM') ?? 0;

  const perimeterEstimate = round2(Math.sqrt(baseArea) * 4);
  m.gutterLengthM = readNumber(diagnostic, 'gutterLengthM') ?? Math.max(10, perimeterEstimate);
  m.ridgeLengthM = readNumber(diagnostic, 'ridgeLengthM') ?? round2(Math.sqrt(baseArea) * 2);
  m.soffitLengthM = readNumber(diagnostic, 'soffitLengthM') ?? Math.max(10, perimeterEstimate);
  m.roofDripEdgeLengthM = readNumber(diagnostic, 'roofDripEdgeLengthM') ?? m.gutterLengthM;
  m.chimneyCount = readNumber(diagnostic, 'chimneyCount') ?? 0;

  m.oldRoofRemovalArea = readBoolean(diagnostic, 'oldRoofRemoval') ? m.roofArea : 0;
  m.demolitionArea = m.oldRoofRemovalArea;
  m.insulationArea = readBoolean(diagnostic, 'insulationRequired') ? m.roofArea : 0;
  m.snowGuardLengthM = m.ridgeLengthM;
  m.requiresManualReview = roofSlope > 60 || normalizeRoofShape(roofShape) === 'complex' ? 1 : 0;

  return m;
}