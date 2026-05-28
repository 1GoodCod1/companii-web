import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import type { EstimateBlueprintDto } from '@/types/estimates';

type Props = {
  blueprint: EstimateBlueprintDto;
};

export function CategoryDescriptionPanel({ blueprint }: Props) {
  const { t } = useTranslation();
  const { config, category, name } = blueprint;

  const requiredFields = (config.customFields ?? []).filter((f) => f.required);
  const moduleCount = config.workModules?.length ?? 0;
  const stageCount = config.defaultStages?.length ?? 0;
  const fieldCount = config.customFields?.length ?? 0;

  const stats: Array<{ label: string; value: number | string }> = [
    { label: t('company.estimateWizard.newForm.descriptionPanel.stages'), value: stageCount },
    { label: t('company.estimateWizard.newForm.descriptionPanel.fields'), value: fieldCount },
    ...(moduleCount
      ? [{ label: t('company.estimateWizard.newForm.descriptionPanel.workModules'), value: moduleCount }]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-indigo-50/40 p-5 space-y-4 shadow-xs">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-700/80">
          {category.name}
        </p>
        <p className="text-lg font-extrabold text-gray-900 mt-1">{name}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-baseline gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-violet-900 ring-1 ring-violet-100"
          >
            <span className="text-sm font-extrabold text-violet-700">{s.value}</span>
            <span className="text-violet-700/70">{s.label}</span>
          </span>
        ))}
      </div>

      {requiredFields.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase text-gray-500 tracking-wide mb-1.5">
            {t('company.estimateWizard.newForm.descriptionPanel.requiredFields')}
          </p>
          <ul className="space-y-1">
            {requiredFields.slice(0, 6).map((f) => (
              <li key={f.key} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <span className="font-medium">{f.label}</span>
                  {f.unit && <span className="text-gray-400 ml-1">({f.unit})</span>}
                </span>
              </li>
            ))}
            {requiredFields.length > 6 && (
              <li className="text-[11px] text-gray-400 italic pl-5">
                {t('company.estimateWizard.newForm.descriptionPanel.andMore', {
                  count: requiredFields.length - 6,
                })}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
