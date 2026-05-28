import type { EstimateStageDto } from '@/types/estimates';
import type { EstimateBlueprintConfig } from '@/types/estimate-blueprint-config.types';
import {
  computeStageVisibility,
  type StageVisibility,
} from './stageVisibility';

export type StageModuleGroup = {
  moduleKey: string | null;
  label: string;
  stages: StageVisibility[];
};

/**
 * J-04: Groups visible stages by their blueprint work module (moduleKey).
 *
 * Stages without a moduleKey are collected under a catch-all group with
 * `moduleKey: null`. Modules from config.workModules provide the label;
 * unlabeled stages (null module) use a fallback label.
 */
export function groupStagesByWorkModule(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
  unlabeledLabel: string,
): StageModuleGroup[] {
  const visibility = computeStageVisibility(stages, config, enabledModules);
  const visible = visibility.filter((v) => !v.hidden);

  const moduleLabelMap = new Map<string, string>();
  for (const m of config?.workModules ?? []) {
    moduleLabelMap.set(m.key, m.label);
  }

  const groupMap = new Map<string | null, StageVisibility[]>();

  for (const v of visible) {
    const key = v.blueprintDef?.moduleKey ?? null;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(v);
  }

  const groups: StageModuleGroup[] = [];
  const orderedKeys = new Set([...(config?.workModules ?? []).map((m) => m.key)]);

  // First, output groups in work module order
  for (const key of orderedKeys) {
    const items = groupMap.get(key);
    if (items && items.length > 0) {
      groups.push({
        moduleKey: key,
        label: moduleLabelMap.get(key) ?? key,
        stages: items,
      });
      groupMap.delete(key);
    }
  }

  // Then, output any remaining groups (catch-all: null moduleKey)
  for (const [key, items] of groupMap) {
    if (items.length === 0) continue;
    groups.push({
      moduleKey: key,
      label: key ? (moduleLabelMap.get(key) ?? key) : unlabeledLabel,
      stages: items,
    });
  }

  return groups;
}