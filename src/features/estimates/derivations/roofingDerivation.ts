import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, round2 } from '../utils/diagnosticReader';
import type { Plan2dData } from '@/entities/estimate/model/estimates';
import {
  computeRectangularRoofBaseArea,
  computeRectangularRoofPerimeter,
  computeRidgeLength,
  computeRoofAreaFromSlope,
  computeRoofSlopeCoefficient,
  deriveValleyLengthFromShape,
  getPrimaryRoofDimensions,
  getRoofInteractiveDrawingReasons,
  inferRoofShapeFromPlan,
  normalizeRoofShape,
} from './roofGeometry';

export function resolveRoofShapeMultiplier(roofShape: unknown, overrides?: PricingModifierOverrides): number {
  const n = normalizeRoofShape(roofShape);
  if (n === 'complex') return modifierFactor('acoperis.roofShape.complex', overrides, 50);
  if (n === 'l-shape' || n === 'l') return modifierFactor('acoperis.roofShape.l-shape', overrides, 20);
  if (n === 't-shape' || n === 't') return modifierFactor('acoperis.roofShape.t-shape', overrides, 35);
  if (n === 'u-shape' || n === 'u') return modifierFactor('acoperis.roofShape.u-shape', overrides, 35);
  return 1.0;
}

function resolveCoveringMultiplier(coveringType: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(coveringType ?? 'metal_tile').trim().toLowerCase();
  if (normalized === 'ceramic_tile') return modifierFactor('acoperis.covering.ceramic_tile', overrides, 45);
  if (normalized === 'bituminous_shingle') return modifierFactor('acoperis.covering.bituminous_shingle', overrides, 15);
  if (normalized === 'standing_seam') return modifierFactor('acoperis.covering.standing_seam', overrides, 35);
  if (normalized === 'ondulin') return modifierFactor('acoperis.covering.ondulin', overrides, -20);
  if (normalized === 'other') return modifierFactor('acoperis.covering.other', overrides, 10);
  return 1.0;
}

function resolveMembraneMultiplier(membraneType: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(membraneType ?? 'anticondens').trim().toLowerCase();
  if (normalized === 'anticondens') return modifierFactor('acoperis.membrane.anticondens', overrides, 20);
  if (normalized === 'diffusion') return modifierFactor('acoperis.membrane.diffusion', overrides, 35);
  if (normalized === 'superdiffusion') return modifierFactor('acoperis.membrane.superdiffusion', overrides, 55);
  if (normalized === 'premium') return modifierFactor('acoperis.membrane.premium', overrides, 80);
  return 1.0;
}

function resolveInsulationMultiplier(thickness: unknown): number {
  const mm = Number(thickness ?? 150);
  if (mm >= 250) return 2.5;
  if (mm >= 200) return 2.0;
  if (mm >= 150) return 1.5;
  return 1.0;
}

export { computeRoofAreaFromSlope, deriveValleyLengthFromShape } from './roofGeometry';

export type DerivedMeasurements = Record<string, number>;

export function deriveAcoperisMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
  plan2d?: Plan2dData | null,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const baseArea = Math.max(5, readNumber(diagnostic, 'baseArea') ?? 30);
  const roofSlope = Math.min(75, Math.max(0, readNumber(diagnostic, 'roofSlope') ?? 30));
  const roofShape = diagnostic.roofShape ?? inferRoofShapeFromPlan(plan2d) ?? 'rectangle';
  const pointsCount = (type: string) => plan2d?.points?.filter((point) => point.type === type).length ?? 0;
  const roofOverhangM = Math.max(0, readNumber(diagnostic, 'roofOverhangM') ?? plan2d?.globalParameters?.roofOverhangM ?? 0.4);
  const primaryRoof = getPrimaryRoofDimensions(plan2d, baseArea);
  const geometricBaseArea = plan2d?.rooms?.length
    ? computeRectangularRoofBaseArea(primaryRoof.width, primaryRoof.length, roofOverhangM)
    : baseArea;

  m.baseArea = baseArea;
  m.roofSlope = roofSlope;
  m.roofOverhangM = roofOverhangM;
  m.roofSlopeCoefficient = computeRoofSlopeCoefficient(roofSlope);
  m.roofArea = computeRoofAreaFromSlope(geometricBaseArea, roofSlope);
  m.coveringAreaQty = m.roofArea;
  m.membraneAreaQty = m.roofArea;
  m.timberVolumeM3 = round2(m.roofArea * 0.07);

  const complexityMultiplier = resolveRoofShapeMultiplier(roofShape, overrides);
  m.complexityMultiplier = complexityMultiplier;
  m.roofAreaLabor = round2(m.roofArea * complexityMultiplier);
  m.coveringMaterialMultiplier = resolveCoveringMultiplier(diagnostic.coveringType, overrides);
  m.coveringLaborMultiplier = m.coveringMaterialMultiplier > 1 ? round2(1 + (m.coveringMaterialMultiplier - 1) * 0.5) : 1;
  m.membraneMaterialMultiplier = resolveMembraneMultiplier(diagnostic.membraneType, overrides);

  m.valleyLengthM = deriveValleyLengthFromShape(roofShape, readNumber(diagnostic, 'valleyLengthM'));
  m.wallIntersectionLengthM =
    readNumber(diagnostic, 'wallIntersectionLengthM') ??
    (plan2d?.rooms && plan2d.rooms.length > 1 ? 8 : 0);

  const perimeterEstimate = plan2d?.rooms?.length
    ? computeRectangularRoofPerimeter(primaryRoof.width, primaryRoof.length, roofOverhangM)
    : round2(Math.sqrt(baseArea) * 4);
  const manualGutterLength = readNumber(diagnostic, 'gutterLengthM') ?? plan2d?.globalParameters?.roofGutterLengthM;
  m.gutterLengthM = manualGutterLength ?? Math.max(10, perimeterEstimate);
  m.ridgeLengthM = readNumber(diagnostic, 'ridgeLengthM') ?? computeRidgeLength({
    width: primaryRoof.width,
    length: primaryRoof.length,
    roofType: primaryRoof.roofType,
    overhangM: roofOverhangM,
  });
  m.soffitLengthM = readNumber(diagnostic, 'soffitLengthM') ?? Math.max(10, perimeterEstimate);
  m.roofDripEdgeLengthM = readNumber(diagnostic, 'roofDripEdgeLengthM') ?? m.gutterLengthM;
  m.chimneyCount = readNumber(diagnostic, 'chimneyCount') ?? Math.max(0, pointsCount('chimney'));
  m.skylightCount = Math.max(0, readNumber(diagnostic, 'skylightCount') ?? pointsCount('skylight'));

  m.oldRoofRemovalArea = readBoolean(diagnostic, 'oldRoofRemoval') ? m.roofArea : 0;
  m.demolitionArea = m.oldRoofRemovalArea;
  m.wasteRemovalArea = m.oldRoofRemovalArea;
  m.insulationArea = readBoolean(diagnostic, 'insulationRequired') ? m.roofArea : 0;
  m.insulationThicknessMm = readNumber(diagnostic, 'insulationThicknessMm') ?? 150;
  m.insulationMaterialMultiplier = resolveInsulationMultiplier(m.insulationThicknessMm);
  const snowGuardLengthM = readNumber(diagnostic, 'snowGuardLengthM') ?? m.ridgeLengthM;
  const snowGuardRows = Math.max(1, readNumber(diagnostic, 'snowGuardRows') ?? 1);
  m.snowGuardLengthM = snowGuardLengthM;
  m.snowGuardRows = snowGuardRows;
  m.snowGuardTotalM = round2(snowGuardLengthM * snowGuardRows);
  const buildingHeightM = readNumber(diagnostic, 'buildingHeightM') ?? 0;
  const storyCount = readNumber(diagnostic, 'storyCount') ?? 1;
  const scaffoldingRequired = readBoolean(diagnostic, 'scaffoldingRequired') || buildingHeightM >= 6 || storyCount >= 2;
  m.buildingHeightM = buildingHeightM;
  m.storyCount = storyCount;
  m.scaffoldingLengthM = scaffoldingRequired ? m.gutterLengthM : 0;
  m.requiresManualReview = roofSlope > 60 || normalizeRoofShape(roofShape) === 'complex' ? 1 : 0;
  const interactiveDrawingReasons = getRoofInteractiveDrawingReasons({
    plan2d,
    roofSlopeDegrees: roofSlope,
    roofShape,
    valleyLengthM: m.valleyLengthM,
    wallIntersectionLengthM: m.wallIntersectionLengthM,
    chimneyCount: m.chimneyCount,
    skylightCount: m.skylightCount,
  });
  m.requiresInteractiveDrawing = interactiveDrawingReasons.length > 0 ? 1 : 0;
  m.roofGeometryComplexityScore = interactiveDrawingReasons.length;

  return m;
}