import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import type { CatalogOptionDto } from '@/types/companies';
import type { CompanyLeadDto } from '@/types/fsm';

export function ConvertLeadToEstimateModal({
  lead,
  categories,
  categoryId,
  estimateTitle,
  pending,
  onCategoryChange,
  onTitleChange,
  onClose,
  onSubmit,
}: {
  lead: CompanyLeadDto | null;
  categories: CatalogOptionDto[] | undefined;
  categoryId: string;
  estimateTitle: string;
  pending: boolean;
  onCategoryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { t } = useTranslation();

  return (
    <AppModal open={!!lead} onClose={onClose} title={t('company.fsm.leads.convertEstimate.title')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          {t('company.fsm.leads.convertEstimate.leadFrom')}{' '}
          <strong>{lead?.contactName}</strong>
        </p>
        <label className={cabinetLabelClass}>
          {t('company.fsm.leads.convertEstimate.fields.category')}
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cabinetSelectClass}
            required
          >
            <option value="">{t('company.fsm.leads.convertEstimate.fields.categoryPlaceholder')}</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className={cabinetLabelClass}>
          {t('company.fsm.leads.convertEstimate.fields.title')}
          <input
            value={estimateTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cabinetFieldClass}
          />
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={pending} className={cabinetBtnPrimary}>
            {t('company.fsm.leads.convertEstimate.submit')}
          </button>
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            {t('cabinet.common.cancel')}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
