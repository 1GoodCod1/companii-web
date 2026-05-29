import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, round2 } from '../utils/diagnosticReader';

export function resolveFacadeHeightMultiplier(buildingHeightM: unknown, overrides?: PricingModifierOverrides): number {
  const height = readNumber({ buildingHeightM }, 'buildingHeightM') ?? 0;
  return height > 9 ? modifierFactor('fatade.height.over9m', overrides, 20) : 1.0;
}

export type DerivedMeasurements = Record<string, number>;

export function deriveFatadeMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const m: DerivedMeasurements = {};
  if (!diagnostic) return m;

  const facadeArea = Math.max(1, readNumber(diagnostic, 'facadeArea') ?? 40);
  m.facadeArea = facadeArea;
  m.scaffoldingArea = readNumber(diagnostic, 'scaffoldingArea') ?? facadeArea;

  const insulationThicknessCm = readNumber(diagnostic, 'insulationThicknessCm') ?? 10;
  m.insulationThicknessCm = insulationThicknessCm;
  m.insulationVolumeM3 = round2(facadeArea * (insulationThicknessCm / 100));

  const wallMaterial = String(diagnostic.wallMaterial ?? 'brick').toLowerCase();
  const dowelDensityPerM2 =
    wallMaterial === 'bca' ? 8 :
    wallMaterial === 'panel' ? 5 :
    (wallMaterial === 'wood_frame' || wallMaterial === 'wood') ? 3 :
    6;
  m.dowelQty = Math.ceil(facadeArea * dowelDensityPerM2);
  m.meshArea = round2(facadeArea * 1.1);

  const buildingHeightM = readNumber(diagnostic, 'buildingHeightM') ?? 0;
  m.buildingHeightM = buildingHeightM;
  m.heightMultiplier = resolveFacadeHeightMultiplier(buildingHeightM, overrides);
  m.facadeAreaLabor = round2(facadeArea * m.heightMultiplier);
  m.meshAreaLabor = round2(m.meshArea * m.heightMultiplier);
  m.preparationArea = facadeArea;
  m.preparationAreaLabor = m.facadeAreaLabor;

  m.windowSlopeLengthM = readNumber(diagnostic, 'windowSlopeLengthM') ?? 0;
  m.decorativePlasterArea = readNumber(diagnostic, 'decorativePlasterArea') ?? 0;
  m.decorativePlasterAreaLabor = round2(m.decorativePlasterArea * m.heightMultiplier);
  m.basePlinthArea = readNumber(diagnostic, 'basePlinthArea') ?? 0;
  m.basePlinthAreaLabor = round2(m.basePlinthArea * m.heightMultiplier);
  m.paintingArea = m.decorativePlasterArea > 0 ? m.decorativePlasterArea : facadeArea;
  m.paintingAreaLabor = round2(m.paintingArea * m.heightMultiplier);

  return m;
}