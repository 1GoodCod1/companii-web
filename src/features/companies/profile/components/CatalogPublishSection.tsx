import { useTranslation } from 'react-i18next';
import { SoftBadge, cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import type { OwnedCompanyDto } from '@/entities/company/model/companies.types';
import {
  companyPageAccentLinkClass,
  companyPagePanelClass,
  companyPagePanelInsetClass,
} from '@/features/companies/companyFormPanelUi';

interface CatalogPublishSectionProps {
  ownedCompany: OwnedCompanyDto;
  isLegalOwner: boolean;
  canPublishCompany: boolean;
  handlePublish: () => Promise<void>;
  publishCompanyPending: boolean;
}

export function CatalogPublishSection({
  ownedCompany,
  isLegalOwner,
  canPublishCompany,
  handlePublish,
  publishCompanyPending,
}: CatalogPublishSectionProps) {
  const { t } = useTranslation();

  if (!isLegalOwner) {
    return (
      <section className={`${companyPagePanelClass} ${companyPagePanelInsetClass} space-y-3`}>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
            {ownedCompany.isVerified
              ? t('company.profileEditor.verified')
              : t('company.profileEditor.pendingVerification')}
          </SoftBadge>
          <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
            {ownedCompany.isPublished
              ? t('company.profileEditor.published')
              : t('company.profileEditor.unpublished')}
          </SoftBadge>
        </div>
        {ownedCompany.isPublished && ownedCompany.slug ? (
          <p className="text-center text-sm text-gray-600 sm:text-left">
            <a
              href={`/companies/${ownedCompany.slug}`}
              target="_blank"
              rel="noreferrer"
              className={companyPageAccentLinkClass}
            >
              {t('company.profileEditor.form.viewPublicProfile')}
            </a>
          </p>
        ) : null}
      </section>
    );
  }

  if (!canPublishCompany) return null;

  return (
    <section className={`${companyPagePanelClass} ${companyPagePanelInsetClass} space-y-4`}>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="max-w-xl">
          <h2 className="text-base font-black tracking-tight text-gray-900">
            {t('company.profileEditor.form.publicCatalogTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('company.profileEditor.form.publicCatalogDescription')}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
            {ownedCompany.isVerified
              ? t('company.profileEditor.verified')
              : t('company.profileEditor.pendingVerification')}
          </SoftBadge>
          <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
            {ownedCompany.isPublished
              ? t('company.profileEditor.published')
              : t('company.profileEditor.unpublished')}
          </SoftBadge>
        </div>
      </div>

      {ownedCompany.isPublished ? (
        <p className="text-center text-sm text-[var(--dashboard-success)] sm:text-left">
          {t('company.profileEditor.form.visibleInCatalog')}
          {ownedCompany.slug ? (
            <>
              :{' '}
              <a
                href={`/companies/${ownedCompany.slug}`}
                target="_blank"
                rel="noreferrer"
                className={companyPageAccentLinkClass}
              >
                {t('company.profileEditor.form.viewProfile')}
              </a>
            </>
          ) : null}
          .
        </p>
      ) : ownedCompany.isVerified ? (
        <div className="flex flex-col items-center gap-3 border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)] bg-[var(--dashboard-accent-light)]/30 px-4 py-4 sm:flex-row sm:justify-between">
          <p className="text-center text-sm text-gray-700 sm:text-left">
            {t('company.profileEditor.form.verifiedReadyPublish')}
          </p>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={publishCompanyPending}
            className={`${cabinetBtnPrimary} shrink-0`}
          >
            {publishCompanyPending
              ? t('company.profileEditor.publishing')
              : t('company.profileEditor.publishCatalog')}
          </button>
        </div>
      ) : (
        <p className="border border-amber-200 border-l-[3px] border-l-amber-400 bg-amber-50/50 px-4 py-3 text-center text-sm text-amber-900 sm:text-left">
          {t('company.profileEditor.form.pendingAdminVerification')}
        </p>
      )}
    </section>
  );
}
