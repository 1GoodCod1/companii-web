import type {
  BlueprintCustomField,
  BlueprintPricingRule,
  BlueprintWorkModule,
  EstimateBlueprintConfig,
} from '@/entities/estimate/model/estimate-blueprint-config.types';

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
    return raw.filter(
      (key): key is string => typeof key === 'string' && validKeys.has(key),
    );
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

export { readEnabledWorkModulesForCategory, readCleaningEnabledWorkModules } from './cleaningWorkModules';

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

export function findWorkModulesForField(
  config: EstimateBlueprintConfig | null | undefined,
  fieldKey: string,
): BlueprintWorkModule[] {
  return config?.workModules?.filter((module) => module.fieldKeys.includes(fieldKey)) ?? [];
}

export function isCustomFieldActive(
  field: BlueprintCustomField,
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
  diagnostic?: Record<string, unknown> | null,
): boolean {
  const modules = findWorkModulesForField(config, field.key);
  if (modules.length > 0 && !modules.some((module) => enabledModules.includes(module.key))) {
    return false;
  }

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

  if (field.dependentOnKey && diagnostic) {
    const val = diagnostic[field.dependentOnKey];
    if (field.dependentOnValues?.length) {
      if (!field.dependentOnValues.includes(String(val ?? ''))) {
        return false;
      }
    } else if (!val) {
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
