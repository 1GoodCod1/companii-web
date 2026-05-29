import type { EstimateExcludedCategorySlug } from '@/constants/estimateCategorySlugs.constants';

export type ExcludedCategoryAlternative = {
  slug: EstimateExcludedCategorySlug;
  actionRoute: string | null;
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
