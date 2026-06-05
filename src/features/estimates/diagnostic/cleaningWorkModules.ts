import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimate-blueprint-config.types';
import { readBoolean } from '../utils/diagnosticReader';
import { ENABLED_WORK_MODULES_KEY, readEnabledWorkModules } from './workModules';

export function augmentCleaningEnabledWorkModules(
  diagnostic: Record<string, unknown> | null | undefined,
  config: EstimateBlueprintConfig | null | undefined,
  enabled: string[],
): string[] {
  if (!config?.workModules?.length) return enabled;

  const next = new Set(enabled);
  if (readBoolean(diagnostic, 'trashRemoval')) {
    next.add('trash_removal');
  }
  if (readBoolean(diagnostic, 'kitchenDeepClean')) {
    next.add('kitchen');
  }
  return [...next];
}

export function readCleaningEnabledWorkModules(
  diagnostic: Record<string, unknown> | null | undefined,
  config: EstimateBlueprintConfig | null | undefined,
): string[] {
  return augmentCleaningEnabledWorkModules(
    diagnostic,
    config,
    readEnabledWorkModules(diagnostic, config),
  );
}

export function readEnabledWorkModulesForCategory(
  categorySlug: string | null | undefined,
  diagnostic: Record<string, unknown> | null | undefined,
  config: EstimateBlueprintConfig | null | undefined,
): string[] {
  if (categorySlug === 'cleaning') {
    return readCleaningEnabledWorkModules(diagnostic, config);
  }
  const enabled = readEnabledWorkModules(diagnostic, config);
  if (categorySlug === 'okna-dveri') {
    const installationType = String(diagnostic?.installationType ?? '').toLowerCase();
    if (
      (installationType === 'warm_installation' ||
        installationType === 'warm-installation' ||
        installationType === 'warm') &&
      !enabled.includes('warm_installation')
    ) {
      return [...enabled, 'warm_installation'];
    }
  }
  return enabled;
}

export function mergeCleaningEnabledWorkModulesIntoDiagnostic(
  diagnostic: Record<string, unknown>,
  config: EstimateBlueprintConfig | null | undefined,
): Record<string, unknown> {
  return {
    ...diagnostic,
    [ENABLED_WORK_MODULES_KEY]: readCleaningEnabledWorkModules(diagnostic, config),
  };
}
