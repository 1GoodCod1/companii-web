import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import type { PreviewLine } from './previewEngine';

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isStageDefaultLaborChargeable(
  def: { optional?: boolean; moduleKey?: string } | undefined,
  enabledModules: string[],
  config: EstimateBlueprintConfig,
  measurements: Record<string, number>,
): boolean {
  if (def?.moduleKey && !enabledModules.includes(def.moduleKey)) {
    return false;
  }

  const requiresQtyKeys = def?.moduleKey
    ? config.workModules?.find((m) => m.key === def.moduleKey)?.requiresQtyKeys
    : undefined;
  if (requiresQtyKeys?.length && requiresQtyKeys.every((key) => (measurements[key] ?? 0) <= 0)) {
    return false;
  }

  return true;
}

export function appendStageDefaultPreviewLines(
  config: EstimateBlueprintConfig | null | undefined,
  ruleLines: PreviewLine[],
  enabledModules: string[],
  measurements: Record<string, number>,
  laborMultiplier = 1,
): PreviewLine[] {
  if (!config?.defaultStages?.length) return ruleLines;

  const stagesWithRuleLines = new Set(ruleLines.map((line) => line.stageCode));
  const out = [...ruleLines];
  const rate = config.defaultLaborRate ?? 185;

  for (const def of config.defaultStages) {
    if (stagesWithRuleLines.has(def.code)) continue;
    if (!isStageDefaultLaborChargeable(def, enabledModules, config, measurements)) continue;

    const hours = def.defaultLaborHours ?? 0;
    if (hours <= 0) continue;

    const unitPrice = round2(rate * laborMultiplier);
    out.push({
      stageCode: def.code,
      description: `Cost Lucrări — ${def.name}`,
      qty: hours,
      unit: 'ore',
      unitPrice,
      lineTotal: round2(hours * unitPrice),
      kind: 'labor',
      source: 'stage-default',
    });
  }

  return out;
}
