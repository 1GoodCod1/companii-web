import { useTranslation } from 'react-i18next';
import {
  Megaphone,
  Palette,
  Sparkles,
  Shield,
  Scale,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { EstimateExcludedCategorySlug } from '@/entities/estimate/model/estimateCategorySlugs.constants';
import {
  getExcludedAlternative,
  type ExcludedCategoryAlternative,
} from '../diagnostic/excludedCategoryAlternatives';

const ICONS: Record<ExcludedCategoryAlternative['icon'], LucideIcon> = {
  megaphone: Megaphone,
  palette: Palette,
  sparkles: Sparkles,
  shield: Shield,
  scale: Scale,
  wrench: Wrench,
};

type Props = {
  slug: EstimateExcludedCategorySlug | string;
  categoryName?: string;
};

export function ExcludedCategoryNotice({ slug, categoryName }: Props) {
  const { t } = useTranslation();
  const alt = getExcludedAlternative(slug);
  if (!alt) return null;

  const Icon = ICONS[alt.icon];

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/50 p-5 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
              {t('company.estimateWizard.newForm.excludedNotice.eyebrow')}
            </p>
            <p className="text-sm font-extrabold text-gray-900 mt-1">
              {categoryName ?? t(`company.estimateWizard.excludedCategories.${alt.slug}.title`)}
            </p>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t(`company.estimateWizard.excludedCategories.${alt.slug}.reason`)}
          </p>
          <p className="text-xs font-semibold text-amber-900 leading-relaxed">
            ↪ {t(`company.estimateWizard.excludedCategories.${alt.slug}.alternative`)}
          </p>
        </div>
      </div>
    </div>
  );
}
