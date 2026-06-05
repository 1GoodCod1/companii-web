import type {
  BlueprintStageDef,
  EstimateBlueprintConfig,
} from '@/entities/estimate/model/estimate-blueprint-config.types';
import type { EstimateStageDto } from '@/entities/estimate/model/estimates';

export type StageVisibility = {
  stage: EstimateStageDto;
  blueprintDef?: BlueprintStageDef;
  meaningfulLineCount: number;
  hidden: boolean;
  hiddenReason?: 'optional-module-off' | 'optional-empty';
};

export function computeStageVisibility(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): StageVisibility[] {
  const defByCode = new Map<string, BlueprintStageDef>();
  for (const def of config?.defaultStages ?? []) {
    defByCode.set(def.code, def);
  }
  const enabledSet = new Set(enabledModules);

  return stages.map((stage) => {
    const blueprintDef = defByCode.get(stage.code);
    const meaningfulLineCount = (stage.lines ?? []).filter(
      (l) => l.source !== 'stage-default',
    ).length;

    let hidden = false;
    let hiddenReason: StageVisibility['hiddenReason'];

    const defaultKey = blueprintDef?.moduleKey;
    const stageCode = blueprintDef?.code;
    let resolvedKey = defaultKey;
    if (defaultKey && !enabledSet.has(defaultKey) && stageCode) {
      const alternateModule = config?.workModules?.find(
        (m) => enabledSet.has(m.key) && m.stageCodes.includes(stageCode)
      );
      if (alternateModule) {
        resolvedKey = alternateModule.key;
      }
    }

    if (resolvedKey && !enabledSet.has(resolvedKey)) {
      if (meaningfulLineCount === 0) {
        hidden = true;
        hiddenReason = 'optional-module-off';
      }
    } else if (blueprintDef?.optional && meaningfulLineCount === 0 && !resolvedKey) {
      hidden = true;
      hiddenReason = 'optional-empty';
    }

    return { stage, blueprintDef, meaningfulLineCount, hidden, hiddenReason };
  });
}

export function getVisibleStages(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): EstimateStageDto[] {
  return computeStageVisibility(stages, config, enabledModules).reduce<EstimateStageDto[]>((acc, s) => {
    if (!s.hidden) {
      acc.push(s.stage);
    }
    return acc;
  }, []);
}

export function getHiddenStagesCount(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): number {
  return computeStageVisibility(stages, config, enabledModules).filter((s) => s.hidden).length;
}

export function filterStagesForClientDisplay(stages: EstimateStageDto[]): EstimateStageDto[] {
  return stages.filter((stage) => {
    const lines = stage.lines ?? [];
    if (lines.length > 0) return true;
    return Number(stage.stageTotal ?? 0) > 0;
  });
}
