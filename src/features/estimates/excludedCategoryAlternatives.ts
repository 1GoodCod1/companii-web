import type { EstimateExcludedCategorySlug } from '@/constants/estimateCategorySlugs.constants';

/**
 * Alternative flows for categories that don't use estimates (K-02).
 * Source: implementation_plan.md §3 — "Категории, где сметы не нужны".
 *
 * Each entry references an i18n key prefix; localized strings live in
 * `company.estimateWizard.excludedCategories.<slug>.{title,reason,action}`.
 */
export type ExcludedCategoryAlternative = {
  slug: EstimateExcludedCategorySlug;
  /** Recommended primary action — null means "no action wired yet, show info". */
  actionRoute: string | null;
  /** Lucide icon name; consumer maps to component. */
  icon: 'megaphone' | 'palette' | 'sparkles' | 'shield' | 'scale' | 'wrench';
};

export const EXCLUDED_CATEGORY_ALTERNATIVES: Record<
  EstimateExcludedCategorySlug,
  ExcludedCategoryAlternative
> = {
  'smm-marketing': { slug: 'smm-marketing', actionRoute: null, icon: 'megaphone' },
  'design-grafic': { slug: 'design-grafic', actionRoute: null, icon: 'palette' },
  'frumusete-ingrijire': { slug: 'frumusete-ingrijire', actionRoute: null, icon: 'sparkles' },
  asigurari: { slug: 'asigurari', actionRoute: null, icon: 'shield' },
  'servicii-juridice': { slug: 'servicii-juridice', actionRoute: null, icon: 'scale' },
  avto: { slug: 'avto', actionRoute: null, icon: 'wrench' },
};

export function getExcludedAlternative(
  slug: string,
): ExcludedCategoryAlternative | null {
  return (EXCLUDED_CATEGORY_ALTERNATIVES as Record<string, ExcludedCategoryAlternative>)[slug] ?? null;
}
