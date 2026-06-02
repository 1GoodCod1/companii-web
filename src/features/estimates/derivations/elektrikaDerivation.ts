import type { Plan2dData } from '@/entities/estimate/model/estimate-plan2d.types';
import { type PricingModifierOverrides, modifierFactor } from '../utils/pricingModifierOverrides';
import { readNumber, readBoolean, readSelect, round2 } from '../utils/diagnosticReader';

function resolveWallMaterialMultiplier(wallMaterial: unknown, overrides?: PricingModifierOverrides): number {
  const normalized = String(wallMaterial ?? 'gips')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (normalized === 'beton' || normalized === 'concrete') return modifierFactor('elektrika.wallMaterial.beton', overrides, 45);
  if (normalized === 'caramida' || normalized === 'brick') return modifierFactor('elektrika.wallMaterial.caramida', overrides, 20);
  if (normalized === 'bca' || normalized === 'aac') return modifierFactor('elektrika.wallMaterial.bca', overrides, 10);
  return 1.0;
};

function resolveCableSegmentMultiplier(segment: string, overrides?: PricingModifierOverrides): number {
  if (segment === '4 mm²') return modifierFactor('elektrika.cableSegment.4', overrides, 40);
  if (segment === '6 mm²') return modifierFactor('elektrika.cableSegment.6', overrides, 70);
  return 1.0;
};

function resolveDeviceTierMultiplier(tier: string, overrides?: PricingModifierOverrides): number {
  if (tier === 'premium') return modifierFactor('elektrika.deviceTier.premium', overrides, 150);
  if (tier === 'standard') return modifierFactor('elektrika.deviceTier.standard', overrides, 50);
  return 1.0;
};

function estimateWallChasingM(cableLengthM: number, electricPoints: number): number {
  return round2(Math.max(10, cableLengthM * 0.25 + electricPoints * 1.2));
};

export type DerivedMeasurements = Record<string, number>;

export function deriveElektrikaMeasurements(
  diagnostic: Record<string, unknown> | null | undefined,
  plan2d?: Plan2dData | null,
  overrides?: PricingModifierOverrides,
): DerivedMeasurements {
  const measurements: DerivedMeasurements = {};

  if (!diagnostic) return measurements;

  const pointsCount = (type: string) => plan2d?.points?.filter((point) => point.type === type).length ?? 0;
  const roomCount = Math.max(1, readNumber(diagnostic, 'roomCount') ?? 1);
  const cableReplace = readBoolean(diagnostic, 'cableReplace');
  const newPanel = readBoolean(diagnostic, 'newPanel');
  const smartHomeRequired = readBoolean(diagnostic, 'smartHomeRequired');
  const groundingRequired = readBoolean(diagnostic, 'groundingRequired');
  const voltageStabilizer = readBoolean(diagnostic, 'voltageStabilizer');
  const isNewConstruction = readBoolean(diagnostic, 'isNewConstruction');
  const dedicatedLinesCount = readNumber(diagnostic, 'dedicatedLinesCount') ?? 0;
  const manualWallChasingM = readNumber(diagnostic, 'wallChasingM');
  const panelModulesInput = readNumber(diagnostic, 'panelModules') ?? 12;

  measurements.roomCount = roomCount;

  const planSocketCount = pointsCount('socket');
  const planSwitchCount = pointsCount('switch');
  const planLightCount = pointsCount('light');
  const manualSocketCount = readNumber(diagnostic, 'socketCount');
  const manualSwitchCount = readNumber(diagnostic, 'switchCount');
  const manualLightCount = readNumber(diagnostic, 'lightPointCount');

  measurements.socketCount =
    manualSocketCount ?? (planSocketCount > 0 ? planSocketCount : Math.max(0, roomCount * 2));
  measurements.switchCount =
    manualSwitchCount ?? (planSwitchCount > 0 ? planSwitchCount : Math.max(0, roomCount));
  measurements.lightPointCount =
    manualLightCount ?? (planLightCount > 0 ? planLightCount : Math.max(0, roomCount));
  measurements.electricPoints =
    measurements.socketCount + measurements.switchCount + measurements.lightPointCount;

  const planPanelCount = pointsCount('panel');
  measurements.panelCount = planPanelCount + (newPanel ? 1 : 0);
  measurements.panelModules = measurements.panelCount > 0 ? panelModulesInput : 0;
  measurements.dedicatedLinesCount = dedicatedLinesCount;
  measurements.cableLengthM =
    Math.max(15, roomCount * 12) +
    (cableReplace ? 25 : 0) +
    dedicatedLinesCount * 12;

  const cableSegmentMultiplier = resolveCableSegmentMultiplier(readSelect(diagnostic, 'cableSegmentMm2') || '2.5 mm²', overrides);
  measurements.cableSegmentMultiplier = cableSegmentMultiplier;
  const deviceTierMultiplier = resolveDeviceTierMultiplier(readSelect(diagnostic, 'deviceTier') || 'standard', overrides);
  measurements.deviceTierMultiplier = deviceTierMultiplier;

  if (isNewConstruction) {
    measurements.wallChasingM = 0;
  } else if (manualWallChasingM !== undefined) {
    measurements.wallChasingM = manualWallChasingM > 0 ? manualWallChasingM : 0;
  } else {
    measurements.wallChasingM = estimateWallChasingM(measurements.cableLengthM, measurements.electricPoints);
  };

  const materialMultiplier = resolveWallMaterialMultiplier(diagnostic.wallMaterial, overrides);
  measurements.materialMultiplier = materialMultiplier;
  measurements.wallChasingCostM = round2(measurements.wallChasingM * materialMultiplier);
  measurements.cableLengthMLabor = round2(measurements.cableLengthM);
  measurements.smartHomeCount = smartHomeRequired ? 1 : 0;
  measurements.lowVoltageLineCount = dedicatedLinesCount;
  measurements.groundingUnits = groundingRequired ? 1 : 0;
  measurements.stabilizerCount = voltageStabilizer ? 1 : 0;
  measurements.demolitionHours = cableReplace ? Math.max(2, roomCount) : 0;
  measurements.projectHours = Math.max(2, Math.ceil(roomCount / 2));
  measurements.testingHours = measurements.electricPoints > 0 ? 0 : 2;
  measurements.cableMaterialM = round2(measurements.cableLengthM * cableSegmentMultiplier);

  return measurements;
};

