import type {
  BlueprintCustomField,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import { isCustomFieldActive } from './workModules';

export const DEFAULT_SECTION_KEY = '_default';
export const DEFAULT_SECTION_LABEL = 'Detalii';

export type CustomFieldSection = {
  key: string;
  label: string;
  fields: BlueprintCustomField[];
};

/**
 * Groups blueprint customFields by their `section` property, preserving config order.
 * Fields without a section land in DEFAULT_SECTION_KEY. Only fields that are active for
 * the current enabledModules set are returned (use H-04 conditional visibility).
 */
export function groupVisibleCustomFields(
  config: EstimateBlueprintConfig | null | undefined,
  enabledModules: string[],
): CustomFieldSection[] {
  const fields = config?.customFields ?? [];
  if (!fields.length) return [];

  const order: string[] = [];
  const buckets = new Map<string, BlueprintCustomField[]>();

  for (const field of fields) {
    if (!isCustomFieldActive(field, config, enabledModules)) continue;
    const sectionKey = field.section?.trim() || DEFAULT_SECTION_KEY;
    if (!buckets.has(sectionKey)) {
      buckets.set(sectionKey, []);
      order.push(sectionKey);
    }
    buckets.get(sectionKey)!.push(field);
  }

  return order.map((key) => ({
    key,
    label: key === DEFAULT_SECTION_KEY ? DEFAULT_SECTION_LABEL : key,
    fields: buckets.get(key)!,
  }));
}

export function getCustomFieldKeys(config: EstimateBlueprintConfig | null | undefined): Set<string> {
  return new Set((config?.customFields ?? []).map((f) => f.key));
}
