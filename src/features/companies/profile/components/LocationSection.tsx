import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSection, AppSelect, cabinetLabelClass } from '@/widgets/cabinet/cabinet-ui';
import type { CatalogOptionDto } from '@/entities/company/model/companies.types';
import { getTranslatedCategoryName, getTranslatedCityName } from '@/shared/utils/translateCityCategory';

interface LocationSectionProps {
  cityId: string;
  setCityId: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  cities: CatalogOptionDto[] | undefined;
  categories: CatalogOptionDto[] | undefined;
}

export function LocationSection({
  cityId,
  setCityId,
  categoryId,
  setCategoryId,
  cities,
  categories,
}: LocationSectionProps) {
  const { t } = useTranslation();

  const cityOptions = useMemo(
    () => [
      {
        value: '',
        label: cities?.length
          ? t('company.profileEditor.form.cityPlaceholder')
          : t('company.profileEditor.form.cityEmpty'),
      },
      ...(cities?.map((c) => ({
        value: c.id,
        label: getTranslatedCityName(t, c),
      })) ?? []),
    ],
    [cities, t],
  );

  const categoryOptions = useMemo(
    () => [
      {
        value: '',
        label: categories?.length
          ? t('company.profileEditor.form.categoryPlaceholder')
          : t('company.profileEditor.form.categoryEmpty'),
      },
      ...(categories?.map((cat) => ({
        value: cat.id,
        label: getTranslatedCategoryName(t, cat),
      })) ?? []),
    ],
    [categories, t],
  );

  return (
    <FormSection
      title={t('company.profileEditor.form.locationTitle')}
      description={t('company.profileEditor.form.locationDesc')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.city')}</label>
          <AppSelect
            value={cityId}
            onChange={setCityId}
            options={cityOptions}
            disabled={!cities?.length}
            aria-label={t('company.profileEditor.form.city')}
          />
        </div>
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.category')}</label>
          <AppSelect
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            disabled={!categories?.length}
            aria-label={t('company.profileEditor.form.category')}
          />
        </div>
      </div>
    </FormSection>
  );
}
