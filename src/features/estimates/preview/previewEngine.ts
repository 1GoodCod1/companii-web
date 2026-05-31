import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';
import type { Plan2dData } from '@/types/estimate-plan2d.types';
import { isPricingRuleActive } from '../diagnostic/workModules';
import type { CustomPricingValues } from '../utils/customPricing';
import { deriveItNetworksMeasurements } from '../derivations/itNetworksDerivation';
import { deriveItHardwareMeasurements } from '../derivations/itHardwareDerivation';
import { deriveItWebMeasurements } from '../derivations/itWebDerivation';
import { deriveMobilaMeasurements } from '../derivations/mobilaDerivation';
import { deriveElektrikaMeasurements } from '../derivations/elektrikaDerivation';
import { deriveSantehnikaMeasurements } from '../derivations/santehnikaDerivation';
import { deriveConstructiiMeasurements } from '../derivations/constructiiDerivation';
import { deriveFinisajMeasurements } from '../derivations/finishingDerivation';
import { deriveFatadeMeasurements } from '../derivations/facadeDerivation';
import { deriveAcoperisMeasurements } from '../derivations/roofingDerivation';
import { deriveFlatRoofMeasurements } from '../derivations/flatRoofingDerivation';
import { deriveClimaMeasurements } from '../derivations/climaDerivation';
import { deriveOknaDveriMeasurements } from '../derivations/windowsDoorsDerivation';
import { derivePanouriSolareMeasurements } from '../derivations/solarDerivation';
import { derivePavajMeasurements } from '../derivations/pavajDerivation';
import { deriveCleaningMeasurements } from '../derivations/cleaningDerivation';
import { appendStageDefaultPreviewLines } from './stageDefaultPreview';

export type PreviewLine = {
  stageCode: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  kind: 'labor' | 'material';
  source?: string;
};

export type PreviewTotals = {
  laborTotal: number;
  materialTotal: number;
  subtotal: number;
  riskReserveAmount: number;
  marginAmount: number;
  grandTotal: number;
  lineCount: number;
  hasContent: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export type AccessDifficultyLevel = 'easy' | 'medium' | 'difficult';
export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';

function normalizeAccessLevel(raw: unknown): AccessDifficultyLevel {
  if (raw == null || raw === '') return 'easy';
  const n = String(raw).trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (n === 'difficult' || n === 'dificil' || n === 'hard') return 'difficult';
  if (n === 'medium' || n === 'mediu') return 'medium';
  return 'easy';
}

function normalizeUrgencyLevel(raw: unknown): UrgencyLevel {
  if (raw == null || raw === '') return 'normal';
  const n = String(raw).trim().toLowerCase();
  if (n === 'emergency') return 'emergency';
  if (n === 'urgent') return 'urgent';
  return 'normal';
}

function resolveAccessMultipliers(
  config: EstimateBlueprintConfig | null | undefined,
  level: AccessDifficultyLevel,
): { labor: number; material: number } {
  const impact = config?.accessDifficultyImpact;
  if (!impact) return { labor: 1, material: 1 };
  const pick = impact[level];
  const labor = Number.isFinite(pick) ? pick : 1;
  const material = impact.appliesToMaterial ? labor : 1;
  return { labor, material };
}

function resolveUrgencyMultipliers(
  config: EstimateBlueprintConfig | null | undefined,
  level: UrgencyLevel,
): { labor: number; material: number } {
  if (level === 'normal') return { labor: 1, material: 1 };
  const impact = config?.urgencyImpact;
  if (!impact) return { labor: 1, material: 1 };
  const pick = level === 'emergency' ? impact.emergency : impact.urgent;
  const labor = Number.isFinite(pick) ? pick : 1;
  const material = impact.appliesToMaterial ? labor : 1;
  return { labor, material };
}

const round2v = (n: number) => Math.round(n * 100) / 100;

export function computePreviewLines(
  config: EstimateBlueprintConfig | null | undefined,
  measurements: Record<string, number>,
  enabledModules: string[],
  accessDifficulty?: unknown,
  urgency?: unknown,
  includeMaterials = true,
  diagnostic?: Record<string, unknown> | null,
): PreviewLine[] {
  if (!config?.pricingRules?.length) return [];

  const access = resolveAccessMultipliers(config, normalizeAccessLevel(accessDifficulty));
  const urg = resolveUrgencyMultipliers(config, normalizeUrgencyLevel(urgency));
  const laborMult = round2v(access.labor * urg.labor);
  const materialMult = round2v(access.material * urg.material);

  const out: PreviewLine[] = [];
  for (const rule of config.pricingRules) {
    if (!includeMaterials && (rule.kind ?? 'material') === 'material') {
      continue;
    }
    if (config.workModules?.length) {
      if (!isPricingRuleActive(rule, enabledModules, measurements, config)) {
        continue;
      }
    }
    const rawQty = measurements[rule.qtyKey] ?? 0;
    if (rawQty <= 0) continue;

    const waste = rule.wastePct ? 1 + rule.wastePct / 100 : 1;
    const qty = round2(rawQty * waste);
    const kind = rule.kind ?? 'material';
    const ruleLaborMult =
      kind === 'labor' && rule.laborUnitPriceMultiplierKey
        ? (measurements[rule.laborUnitPriceMultiplierKey] ?? 1)
        : 1;
    const ruleMaterialMult =
      kind === 'material' && rule.materialUnitPriceMultiplierKey
        ? (measurements[rule.materialUnitPriceMultiplierKey] ?? 1)
        : 1;
    const accessMult = kind === 'labor' ? laborMult * ruleLaborMult : materialMult * ruleMaterialMult;
    const unitPrice = round2(rule.unitPrice * accessMult);
    const lineTotal = round2(qty * unitPrice);

    let description = rule.description;
    if (rule.qtyKey === 'scaffoldingRentalArea') {
      const scaffoldingArea = measurements.scaffoldingArea ?? measurements.facadeArea ?? 0;
      const duration = Number(diagnostic?.scaffoldingRentalDuration ?? 1);
      const period = String(diagnostic?.scaffoldingRentalPeriod ?? 'months').toLowerCase();
      
      let durationInMonths = duration;
      let label = 'luni';
      if (period === 'days') {
        durationInMonths = duration / 30;
        label = `zile (${round2(durationInMonths)} luni)`;
      } else if (period === 'weeks') {
        durationInMonths = (duration * 7) / 30;
        label = `săpt. (${round2(durationInMonths)} luni)`;
      } else {
        label = duration === 1 ? 'lună' : 'luni';
      }
      const formattedDuration = duration === 1 && period === 'months' ? '1 lună' : `${duration} ${label}`;
      description = `Închiriere schelă (${scaffoldingArea} m² × ${formattedDuration})`;
    }

    out.push({
      stageCode: rule.stageCode,
      description,
      qty,
      unit: rule.unit,
      unitPrice,
      lineTotal,
      kind,
      source: 'rule',
    });
  }
  return out;
}

export function computePreviewLinesWithStageDefaults(
  config: EstimateBlueprintConfig | null | undefined,
  measurements: Record<string, number>,
  enabledModules: string[],
  accessDifficulty?: unknown,
  urgency?: unknown,
  includeMaterials = true,
  diagnostic?: Record<string, unknown> | null,
): PreviewLine[] {
  const access = resolveAccessMultipliers(config, normalizeAccessLevel(accessDifficulty));
  const urg = resolveUrgencyMultipliers(config, normalizeUrgencyLevel(urgency));
  const laborMult = round2v(access.labor * urg.labor);
  const ruleLines = computePreviewLines(
    config,
    measurements,
    enabledModules,
    accessDifficulty,
    urgency,
    includeMaterials,
    diagnostic,
  );
  return appendStageDefaultPreviewLines(config, ruleLines, enabledModules, measurements, laborMult);
}

export function computePreviewTotals(
  lines: PreviewLine[],
  marginPct: number,
  customPricing?: CustomPricingValues,
  riskReservePct = 0,
): PreviewTotals {
  let laborTotal = 0;
  let materialTotal = 0;
  for (const line of lines) {
    if (line.kind === 'labor') laborTotal += line.lineTotal;
    else materialTotal += line.lineTotal;
  }
  laborTotal = round2(laborTotal);
  materialTotal = round2(materialTotal);

  if (customPricing?.customLaborTotal && customPricing.customLaborTotal > 0) {
    laborTotal = round2(customPricing.customLaborTotal);
  }

  const subtotal = round2(laborTotal + materialTotal);
  const reserve = Number.isFinite(riskReservePct) ? riskReservePct : 0;
  const margin = Number.isFinite(marginPct) ? marginPct : 0;
  const riskReserveAmount = round2(subtotal * (reserve / 100));
  const adjustedSubtotal = round2(subtotal + riskReserveAmount);
  const marginAmount = round2(adjustedSubtotal * (margin / 100));
  const grandTotal = round2(adjustedSubtotal + marginAmount);

  return {
    laborTotal,
    materialTotal,
    subtotal,
    riskReserveAmount,
    marginAmount,
    grandTotal,
    lineCount: lines.length,
    hasContent: lines.length > 0,
  };
}

export function extractMeasurementsFromDiagnostic(
  diagnostic: Record<string, unknown> | null | undefined,
  categorySlug?: string | null,
  pricingOverrides?: Record<string, number> | null,
  plan2d?: Plan2dData | null,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!diagnostic) return out;
  for (const [key, raw] of Object.entries(diagnostic)) {
    if (key === 'enabledWorkModules') continue;
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      out[key] = raw;
    } else if (raw === true) {
      out[key] = 1;
    } else if (raw === false) {
      out[key] = 0;
    }
  }

  if (categorySlug === 'it-networks') {
    Object.assign(out, deriveItNetworksMeasurements(diagnostic));
  }
  if (categorySlug === 'it-hardware') {
    Object.assign(out, deriveItHardwareMeasurements(diagnostic));
  }
  if (categorySlug === 'it-web') {
    Object.assign(out, deriveItWebMeasurements(diagnostic));
  }
  if (categorySlug === 'mobila') {
    Object.assign(out, deriveMobilaMeasurements(diagnostic, pricingOverrides, plan2d));
  }
  if (categorySlug === 'elektrika') {
    Object.assign(out, deriveElektrikaMeasurements(diagnostic, plan2d, pricingOverrides));
  }
  if (categorySlug === 'santehnika') {
    Object.assign(out, deriveSantehnikaMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'constructii') {
    Object.assign(out, deriveConstructiiMeasurements(diagnostic));
  }
  if (categorySlug === 'lucrari-finisaj') {
    Object.assign(out, deriveFinisajMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'fatade') {
    Object.assign(out, deriveFatadeMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'acoperis') {
    Object.assign(out, deriveAcoperisMeasurements(diagnostic, pricingOverrides, plan2d));
  }
  if (categorySlug === 'acoperis-plat') {
    Object.assign(out, deriveFlatRoofMeasurements(diagnostic));
  }
  if (categorySlug === 'clima') {
    Object.assign(out, deriveClimaMeasurements(diagnostic, plan2d, pricingOverrides));
  }
  if (categorySlug === 'okna-dveri') {
    Object.assign(out, deriveOknaDveriMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'panouri-solare') {
    Object.assign(out, derivePanouriSolareMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'pavaj') {
    Object.assign(out, derivePavajMeasurements(diagnostic, pricingOverrides));
  }
  if (categorySlug === 'cleaning') {
    Object.assign(out, deriveCleaningMeasurements(diagnostic, pricingOverrides));
  }

  return out;
}
