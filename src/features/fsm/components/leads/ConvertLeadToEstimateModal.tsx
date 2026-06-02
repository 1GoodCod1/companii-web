import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  AppSelect,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import type { CatalogOptionDto } from '@/entities/company/model/companies.types';
import type { CompanyLeadDto } from '@/entities/fsm/model/types';

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

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.leads.convertEstimate.fields.categoryPlaceholder') },
      ...(categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []),
    ],
    [categories, t],
  );

  return (
    <AppModal open={!!lead} onClose={onClose} title={t('company.fsm.leads.convertEstimate.title')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          {t('company.fsm.leads.convertEstimate.leadFrom')}{' '}
          <strong>{lead?.contactName}</strong>
        </p>
        <label className={cabinetLabelClass}>
          {t('company.fsm.leads.convertEstimate.fields.category')}
          <AppSelect
            value={categoryId}
            onChange={onCategoryChange}
            options={categoryOptions}
            aria-label={t('company.fsm.leads.convertEstimate.fields.category')}
          />
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
