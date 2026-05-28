import type {
  BlueprintStageDef,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import type { EstimateStageDto } from '@/types/estimates';

export type StageVisibility = {
  stage: EstimateStageDto;
  /** Definition from blueprint (optional flag, moduleKey) if found. */
  blueprintDef?: BlueprintStageDef;
  /** Total non-empty lines (excluding stage-default scaffold). */
  meaningfulLineCount: number;
  hidden: boolean;
  hiddenReason?: 'optional-module-off' | 'optional-empty';
};

/**
 * J-01: hide stage when it is **optional**, has **no meaningful lines** and either
 * its blueprint module is disabled or no module is attached. Required stages
 * (no `optional: true`) always show even if empty — they prompt the manager
 * to address them.
 */
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

    if (blueprintDef?.optional && meaningfulLineCount === 0) {
      if (blueprintDef.moduleKey && !enabledSet.has(blueprintDef.moduleKey)) {
        hidden = true;
        hiddenReason = 'optional-module-off';
      } else if (!blueprintDef.moduleKey) {
        hidden = true;
        hiddenReason = 'optional-empty';
      }
    }

    return { stage, blueprintDef, meaningfulLineCount, hidden, hiddenReason };
  });
}

export function getVisibleStages(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): EstimateStageDto[] {
  return computeStageVisibility(stages, config, enabledModules)
    .filter((s) => !s.hidden)
    .map((s) => s.stage);
}

export function getHiddenStagesCount(
  stages: EstimateStageDto[],
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): number {
  return computeStageVisibility(stages, config, enabledModules).filter((s) => s.hidden).length;
}
