import type {
  BlueprintCustomField,
  BlueprintWorkModule,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import type { EstimateStageDto } from '@/types/estimates';

export type ScopeModuleEntry = {
  key: string;
  label: string;
  lineCount: number;
  amount: number;
  /**
   * For `enabledWithoutLines` only: user-facing field labels whose value looks
   * empty (null / 0 / false / blank). These are the most likely reason the
   * module produced no lines — surface them so the user knows what to fill.
   */
  missingFieldLabels?: string[];
};

export type ScopeSummary = {
  /** Modules user enabled AND that produced lines after calculate. */
  included: ScopeModuleEntry[];
  /** Modules user enabled BUT with no lines yet (likely missing qty / module empty). */
  enabledWithoutLines: ScopeModuleEntry[];
  /** Modules available in config but NOT enabled by user. */
  available: ScopeModuleEntry[];
  /** Total amount of all `included` entries (sum of stage totals attributable to those modules). */
  includedAmount: number;
};

/**
 * J-05: build a scope summary for ReviewStep — what is included in this estimate,
 * what was enabled but produced no lines, what is still available for the user
 * to add. Modules without `stageCodes` are still counted as available so the
 * client sees the full menu.
 *
 * Pass `diagnostic` to get explanations for `enabledWithoutLines` entries —
 * each entry will list the customField labels that look empty.
 */
export function buildScopeSummary(
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
  stages: EstimateStageDto[],
  diagnostic?: Record<string, unknown> | null,
): ScopeSummary {
  const summary: ScopeSummary = {
    included: [],
    enabledWithoutLines: [],
    available: [],
    includedAmount: 0,
  };

  const modules = config?.workModules ?? [];
  if (!modules.length) return summary;

  const enabledSet = new Set(enabledModules);
  const stageByCode = new Map<string, EstimateStageDto>();
  for (const s of stages) stageByCode.set(s.code, s);

  const customFieldByKey = new Map<string, BlueprintCustomField>();
  for (const f of config?.customFields ?? []) customFieldByKey.set(f.key, f);

  for (const module of modules) {
    const entry = collectModuleStats(module, stageByCode);

    if (!enabledSet.has(module.key)) {
      summary.available.push(entry);
      continue;
    }

    if (entry.lineCount > 0) {
      summary.included.push(entry);
      summary.includedAmount += entry.amount;
    } else {
      if (diagnostic) {
        entry.missingFieldLabels = findEmptyFieldLabels(module, customFieldByKey, diagnostic);
      }
      summary.enabledWithoutLines.push(entry);
    }
  }

  return summary;
}

function collectModuleStats(
  module: BlueprintWorkModule,
  stageByCode: Map<string, EstimateStageDto>,
): ScopeModuleEntry {
  let lineCount = 0;
  let amount = 0;

  for (const code of module.stageCodes ?? []) {
    const stage = stageByCode.get(code);
    if (!stage) continue;
    const lines = (stage.lines ?? []).filter((l) => l.source !== 'stage-default');
    lineCount += lines.length;
    amount += Number(stage.stageTotal ?? 0);
  }

  return {
    key: module.key,
    label: module.label,
    lineCount,
    amount,
  };
}

function isEmptyValue(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (typeof v === 'number') return v === 0;
  if (typeof v === 'boolean') return v === false;
  return false;
}

function findEmptyFieldLabels(
  module: BlueprintWorkModule,
  customFieldByKey: Map<string, BlueprintCustomField>,
  diagnostic: Record<string, unknown>,
): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  const keys = [
    ...(module.fieldKeys ?? []),
    ...(module.requiresQtyKeys ?? []),
  ];
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const field = customFieldByKey.get(key);
    if (!field) continue;
    if (isEmptyValue(diagnostic[key])) labels.push(field.label);
  }
  return labels;
}

export function hasManualLines(stages: EstimateStageDto[]): boolean {
  return stages.some((s) => (s.lines ?? []).some((l) => l.source === 'manual'));
}
