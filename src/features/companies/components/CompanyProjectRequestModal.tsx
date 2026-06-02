import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { getTranslatedCategoryName } from '@/shared/utils/translateCityCategory';
import type { PublicCompanyDetailDto } from '@/entities/company/model/companies.types';

interface CompanyProjectRequestModalProps {
  open: boolean;
  onClose: () => void;
  company: PublicCompanyDetailDto;
  onSubmit: (e: React.FormEvent) => void;
  profileName: string;
  profilePhone: string;
  profileEmail: string;
  projectTitle: string;
  onProjectTitleChange: (val: string) => void;
  projectEstimatedBudget: string;
  onProjectEstimatedBudgetChange: (val: string) => void;
  projectAddress: string;
  onProjectAddressChange: (val: string) => void;
  projectMessage: string;
  onProjectMessageChange: (val: string) => void;
  isPending: boolean;
}

function ClientProfileSummary({
  name,
  phone,
  email,
  title,
}: {
  name: string;
  phone: string;
  email: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs space-y-1">
      <p className="font-bold text-violet-800 uppercase tracking-wide text-[10px]">{title}</p>
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-600">{phone}</p>
      <p className="text-slate-600">{email}</p>
    </div>
  );
}

export function CompanyProjectRequestModal({
  open,
  onClose,
  company,
  onSubmit,
  profileName,
  profilePhone,
  profileEmail,
  projectTitle,
  onProjectTitleChange,
  projectEstimatedBudget,
  onProjectEstimatedBudgetChange,
  projectAddress,
  onProjectAddressChange,
  projectMessage,
  onProjectMessageChange,
  isPending,
}: CompanyProjectRequestModalProps) {
  const { t } = useTranslation();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('companyDetail.projectTitle')}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ClientProfileSummary
          name={profileName}
          phone={profilePhone}
          email={profileEmail}
          title={t('companyDetail.yourData')}
        />
        <div>
          <label className={cabinetLabelClass} htmlFor="proj-title">
            {t('companyDetail.projectTitleLabel')}
          </label>
          <input
            id="proj-title"
            className={cabinetFieldClass}
            value={projectTitle}
            onChange={(e) => onProjectTitleChange(e.target.value)}
            placeholder={t('companyDetail.projectTitlePlaceholder')}
          />
        </div>
        <div>
          <label className={cabinetLabelClass} htmlFor="proj-category">
            {t('companyDetail.workTypeLabel')}
          </label>
          {company.category ? (
            <input
              id="proj-category"
              className={`${cabinetFieldClass} bg-slate-50 text-slate-700`}
              value={getTranslatedCategoryName(t, company.category)}
              readOnly
            />
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              {t('companyDetail.noCategoryWarning')}
            </p>
          )}
        </div>
        <div>
          <label className={cabinetLabelClass} htmlFor="proj-budget">
            {t('companyDetail.budgetLabel')}
          </label>
          <input
            id="proj-budget"
            type="number"
            min={0}
            step={100}
            className={cabinetFieldClass}
            value={projectEstimatedBudget}
            onChange={(e) => onProjectEstimatedBudgetChange(e.target.value)}
            placeholder={t('companyDetail.budgetPlaceholder')}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t('companyDetail.budgetHint')}
          </p>
        </div>
        <div>
          <label className={cabinetLabelClass} htmlFor="proj-address">
            {t('companyDetail.addressLabel')}
          </label>
          <input
            id="proj-address"
            className={cabinetFieldClass}
            value={projectAddress}
            onChange={(e) => onProjectAddressChange(e.target.value)}
          />
        </div>
        <div>
          <label className={cabinetLabelClass} htmlFor="proj-msg">
            {t('companyDetail.descriptionLabel')}
          </label>
          <textarea
            id="proj-msg"
            className={cabinetFieldClass}
            rows={4}
            value={projectMessage}
            onChange={(e) => onProjectMessageChange(e.target.value)}
            placeholder={t('companyDetail.descriptionPlaceholder')}
            required
          />
        </div>
        <button type="submit" className={cabinetBtnPrimary} disabled={isPending}>
          {isPending ? t('companyDetail.submitting') : t('companyDetail.submitRequest')}
        </button>
      </form>
    </AppModal>
  );
}
