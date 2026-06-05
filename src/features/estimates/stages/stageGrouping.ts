import type { EstimateStageDto } from '@/entities/estimate/model/estimates';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import {
  computeStageVisibility,
  type StageVisibility,
} from './stageVisibility';

export type StageModuleGroup = {
  moduleKey: string | null;
  label: string;
  stages: StageVisibility[];
};

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
  const enabledSet = new Set(enabledModules);
  const enabledModuleByStageCode = new Map<string, string>();
  for (const module of config?.workModules ?? []) {
    if (!enabledSet.has(module.key)) continue;
    for (const stageCode of module.stageCodes) {
      if (!enabledModuleByStageCode.has(stageCode)) {
        enabledModuleByStageCode.set(stageCode, module.key);
      }
    }
  }

  for (const v of visible) {
    const defaultKey = v.blueprintDef?.moduleKey;
    const stageCode = v.blueprintDef?.code;
    let resolvedKey = defaultKey;
    if (defaultKey && !enabledSet.has(defaultKey) && stageCode) {
      const alternateKey = enabledModuleByStageCode.get(stageCode);
      if (alternateKey) {
        resolvedKey = alternateKey;
      }
    }

    const key = resolvedKey ?? null;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(v);
  }

  const groups: StageModuleGroup[] = [];
  const orderedKeys = new Set([...(config?.workModules ?? []).map((m) => m.key)]);

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