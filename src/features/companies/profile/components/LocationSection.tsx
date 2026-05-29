import { useTranslation } from 'react-i18next';
import { FormSection, cabinetLabelClass, cabinetSelectClass } from '@/components/cabinet/cabinet-ui';
import type { CatalogOptionDto } from '@/types/companies';
import { getTranslatedCategoryName, getTranslatedCityName } from '@/utils/translateCityCategory';

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

  return (
    <FormSection
      title={t('company.profileEditor.form.locationTitle')}
      description={t('company.profileEditor.form.locationDesc')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.city')}</label>
          <select
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            disabled={!cities?.length}
            className={cabinetSelectClass}
          >
            <option value="">
              {cities?.length
                ? t('company.profileEditor.form.cityPlaceholder')
                : t('company.profileEditor.form.cityEmpty')}
            </option>
            {cities?.map((c) => (
              <option key={c.id} value={c.id}>
                {getTranslatedCityName(t, c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={cabinetLabelClass}>{t('company.profileEditor.form.category')}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!categories?.length}
            className={cabinetSelectClass}
          >
            <option value="">
              {categories?.length
                ? t('company.profileEditor.form.categoryPlaceholder')
                : t('company.profileEditor.form.categoryEmpty')}
            </option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getTranslatedCategoryName(t, cat)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FormSection>
  );
}
