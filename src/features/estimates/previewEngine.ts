import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';
import { isPricingRuleActive } from './workModules';
import type { CustomPricingValues } from './customPricing';

export type PreviewLine = {
  stageCode: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  kind: 'labor' | 'material';
};

export type PreviewTotals = {
  laborTotal: number;
  materialTotal: number;
  subtotal: number;
  marginAmount: number;
  grandTotal: number;
  lineCount: number;
  /** True when the user has at least one enabled module that produced lines. */
  hasContent: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * L-01: client-side preview engine. Mirrors a subset of backend
 * `buildLinesFromRules`: filters rules by enabledModules + enabledWhen,
 * multiplies qty × unitPrice, applies wastePct. Skips advanced derive
 * helpers (per-category measurement derivation) — relies on diagnostic
 * answers and plan-derived counts that already live in the answers map.
 *
 * Used purely for live UI feedback. Authoritative totals always come
 * from backend `/calculate` (L-02).
 */
export function computePreviewLines(
  config: EstimateBlueprintConfig | null | undefined,
  measurements: Record<string, number>,
  enabledModules: string[],
): PreviewLine[] {
  if (!config?.pricingRules?.length) return [];

  const out: PreviewLine[] = [];
  for (const rule of config.pricingRules) {
    if (config.workModules?.length) {
      if (!isPricingRuleActive(rule, enabledModules, measurements, config)) {
        continue;
      }
    }
    const rawQty = measurements[rule.qtyKey] ?? 0;
    if (rawQty <= 0) continue;

    const waste = rule.wastePct ? 1 + rule.wastePct / 100 : 1;
    const qty = round2(rawQty * waste);
    const unitPrice = rule.unitPrice;
    const lineTotal = round2(qty * unitPrice);
    out.push({
      stageCode: rule.stageCode,
      description: rule.description,
      qty,
      unit: rule.unit,
      unitPrice,
      lineTotal,
      kind: rule.kind ?? 'material',
    });
  }
  return out;
}

export function computePreviewTotals(
  lines: PreviewLine[],
  marginPct: number,
  customPricing?: CustomPricingValues,
): PreviewTotals {
  let laborTotal = 0;
  let materialTotal = 0;
  for (const line of lines) {
    if (line.kind === 'labor') laborTotal += line.lineTotal;
    else materialTotal += line.lineTotal;
  }
  laborTotal = round2(laborTotal);
  materialTotal = round2(materialTotal);

  // J-06/E-04: respect customLaborTotal override if provided.
  if (customPricing?.customLaborTotal && customPricing.customLaborTotal > 0) {
    laborTotal = round2(customPricing.customLaborTotal);
  }

  const subtotal = round2(laborTotal + materialTotal);
  const margin = Number.isFinite(marginPct) ? marginPct : 0;
  const marginAmount = round2(subtotal * (margin / 100));
  const grandTotal = round2(subtotal + marginAmount);

  return {
    laborTotal,
    materialTotal,
    subtotal,
    marginAmount,
    grandTotal,
    lineCount: lines.length,
    hasContent: lines.length > 0,
  };
}

/**
 * Extracts the subset of `diagnosticAnswers` that looks like measurement numbers.
 * `enabledWorkModules` is excluded (it's not a measurement). Boolean values pass
 * through as 0/1 so rules keyed by them (e.g. waterHeater) still trigger.
 */
export function extractMeasurementsFromDiagnostic(
  diagnostic: Record<string, unknown> | null | undefined,
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
  return out;
}
