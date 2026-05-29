import type {
  BlueprintCustomField,
  BlueprintPricingRule,
  BlueprintWorkModule,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';

export const ENABLED_WORK_MODULES_KEY = 'enabledWorkModules';

export function getDefaultEnabledWorkModules(config: EstimateBlueprintConfig): string[] {
  if (!config.workModules?.length) return [];
  return config.workModules
    .filter((module) => module.defaultEnabled !== false)
    .map((module) => module.key);
}

export function readEnabledWorkModules(
  diagnostic: Record<string, unknown> | null | undefined,
  config: EstimateBlueprintConfig | null | undefined,
): string[] {
  if (!config?.workModules?.length) {
    const raw = diagnostic?.[ENABLED_WORK_MODULES_KEY];
    return Array.isArray(raw) ? raw.filter((key): key is string => typeof key === 'string') : [];
  }

  const validKeys = new Set(config.workModules.map((module) => module.key));
  const raw = diagnostic?.[ENABLED_WORK_MODULES_KEY];

  if (Array.isArray(raw)) {
    const selected = raw.filter(
      (key): key is string => typeof key === 'string' && validKeys.has(key),
    );
    if (selected.length) return selected;
  }

  return getDefaultEnabledWorkModules(config);
}

export function mergeEnabledWorkModulesIntoDiagnostic(
  diagnostic: Record<string, unknown>,
  config: EstimateBlueprintConfig | null | undefined,
): Record<string, unknown> {
  if (!config?.workModules?.length) return diagnostic;
  return {
    ...diagnostic,
    [ENABLED_WORK_MODULES_KEY]: readEnabledWorkModules(diagnostic, config),
  };
}

export function toggleWorkModule(
  enabledModules: string[],
  moduleKey: string,
  enabled: boolean,
): string[] {
  if (enabled) {
    return enabledModules.includes(moduleKey) ? enabledModules : [...enabledModules, moduleKey];
  }
  return enabledModules.filter((key) => key !== moduleKey);
}

export function findWorkModuleForField(
  config: EstimateBlueprintConfig | null | undefined,
  fieldKey: string,
): BlueprintWorkModule | undefined {
  return config?.workModules?.find((module) => module.fieldKeys.includes(fieldKey));
}

export function isCustomFieldActive(
  field: BlueprintCustomField,
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
  diagnostic?: Record<string, unknown> | null,
): boolean {
  // Check work module enablement
  const module = findWorkModuleForField(config, field.key);
  if (module && !enabledModules.includes(module.key)) {
    return false;
  }

  // Check direction filtering (IT categories)
  if (field.directionKeys?.length && diagnostic) {
    const currentDirection = String(diagnostic.itDirection ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
    if (currentDirection && !field.directionKeys.some(
      (d) => d.toLowerCase() === currentDirection,
    )) {
      return false;
    }
  }

  return true;
}

export function isCustomFieldRequired(
  field: BlueprintCustomField,
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
  diagnostic?: Record<string, unknown> | null,
): boolean {
  if (!field.required) return false;
  return isCustomFieldActive(field, config, enabledModules, diagnostic);
}

/**
 * Frontend mirror of backend `isPricingRuleActive` (work-modules.util.ts).
 * Used by the L-01 preview engine to filter pricing rules without an API call.
 */
export function isPricingRuleActive(
  rule: BlueprintPricingRule,
  enabledModules: string[],
  measurements: Record<string, number>,
  config: EstimateBlueprintConfig | null | undefined,
): boolean {
  if (!config?.workModules?.length) return true;

  const moduleKey = rule.moduleKey ?? rule.enabledWhen?.moduleEnabled;
  if (moduleKey && !enabledModules.includes(moduleKey)) {
    return false;
  }

  const when = rule.enabledWhen;
  if (when?.moduleEnabled && !enabledModules.includes(when.moduleEnabled)) {
    return false;
  }
  if (when?.anyQtyKeys?.length) {
    const hasQty = when.anyQtyKeys.some((key) => (measurements[key] ?? 0) > 0);
    if (!hasQty) return false;
  }
  if (when?.allQtyKeys?.length) {
    const allQty = when.allQtyKeys.every((key) => (measurements[key] ?? 0) > 0);
    if (!allQty) return false;
  }

  return true;
}
