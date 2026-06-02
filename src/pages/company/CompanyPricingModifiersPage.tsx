import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Percent } from 'lucide-react';
import {
  Panel,
  FormSection,
  cabinetBtnPrimary,
  cabinetFieldClass,
} from '@/widgets/cabinet/cabinet-ui';
import { useAuthStore } from '@/entities/user/model/authStore';
import {
  usePricingModifiersQuery,
  useUpdatePricingModifiersMutation,
  type PricingModifierDef,
} from '@/features/companies/api/useCompanies';
import { getErrorMessage } from '@/shared/utils/errors';

/** Group catalog → categorySlug → group → defs (config order preserved). */
function groupCatalog(catalog: PricingModifierDef[]) {
  const byCategory = new Map<string, Map<string, PricingModifierDef[]>>();
  for (const def of catalog) {
    if (!byCategory.has(def.categorySlug)) byCategory.set(def.categorySlug, new Map());
    const groups = byCategory.get(def.categorySlug)!;
    if (!groups.has(def.group)) groups.set(def.group, []);
    groups.get(def.group)!.push(def);
  }
  return byCategory;
}

export function CompanyPricingModifiersPage() {
  const { t, i18n } = useTranslation();
  const lang: 'ro' | 'ru' =
    (i18n.resolvedLanguage || i18n.language || 'ro') === 'ru' ? 'ru' : 'ro';
  const companyId = useAuthStore((s) => s.user?.activeCompanyId) ?? '';

  const { data, isLoading } = usePricingModifiersQuery(companyId);
  const updateMut = useUpdatePricingModifiersMutation(companyId);

  // Only the inputs the user has touched. Persisted overrides come from `data`.
  const [edits, setEdits] = useState<Record<string, string>>({});

  const grouped = useMemo(() => groupCatalog(data?.catalog ?? []), [data]);

  // Current input value for a key: a pending edit, else the saved override, else ''.
  const valueFor = (key: string): string => {
    if (edits[key] !== undefined) return edits[key];
    const saved = data?.overrides?.[key];
    return typeof saved === 'number' ? String(saved) : '';
  };

  const handleSave = () => {
    if (!data) return;
    const modifiers: Record<string, number | null> = {};
    for (const def of data.catalog) {
      const raw = valueFor(def.key);
      if (raw.trim() === '') {
        modifiers[def.key] = null; // reset to registry default
        continue;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0 || num > 300) {
        toast.error(`„${def.label[lang]}": valoare invalidă (0–300%).`);
        return;
      }
      modifiers[def.key] = num;
    }
    updateMut.mutate(modifiers, {
      onSuccess: () => {
        setEdits({});
        toast.success(t('company.pricingModifiers.saved', { defaultValue: 'Coeficienți salvați.' }));
      },
      onError: (err) => toast.error(getErrorMessage(err, 'Eroare la salvare')),
    });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Panel className="p-6 space-y-2">
        <h2 className="flex items-center gap-2 font-bold text-gray-900">
          <Percent className="size-5 text-violet-600" />
          {t('company.pricingModifiers.title', { defaultValue: 'Coeficienți de preț' })}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t('company.pricingModifiers.description', {
            defaultValue:
              'Ajustați procentele de majorare aplicate automat la devize (premium, complexitate, etc.). Lăsați gol pentru valoarea implicită.',
          })}
        </p>
      </Panel>

      {isLoading || !data ? (
        <Panel className="p-6 text-sm text-gray-400">{t('cabinet.common.loading', { defaultValue: 'Se încarcă...' })}</Panel>
      ) : (
        <Panel className="p-6 space-y-6">
          {[...grouped.entries()].map(([categorySlug, groups]) => (
            <div key={categorySlug} className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-700">
                {categorySlug}
              </h3>
              {[...groups.entries()].map(([group, defs]) => (
                <FormSection key={group} title={group}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {defs.map((def) => (
                      <label key={def.key} className="block">
                        <span className="text-xs font-medium text-gray-600 block mb-1.5">
                          {def.label[lang]}
                          <span className="ml-1 text-gray-400">
                            (implicit +{def.defaultPct}%)
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={300}
                            step={1}
                            value={valueFor(def.key)}
                            placeholder={String(def.defaultPct)}
                            onChange={(e) =>
                              setEdits((prev) => ({ ...prev, [def.key]: e.target.value }))
                            }
                            className={`${cabinetFieldClass} w-24`}
                          />
                          <span className="text-sm font-semibold text-gray-400">%</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </FormSection>
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSave}
            disabled={updateMut.isPending}
            className={cabinetBtnPrimary}
          >
            {updateMut.isPending
              ? t('cabinet.common.saving', { defaultValue: 'Se salvează...' })
              : t('company.pricingModifiers.save', { defaultValue: 'Salvează coeficienții' })}
          </button>
        </Panel>
      )}
    </div>
  );
}

export default CompanyPricingModifiersPage;
