import { useTranslation } from 'react-i18next';
import { SoftBadge, cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import type { OwnedCompanyDto } from '@/entities/company/model/companies.types';

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
      <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap gap-2">
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
          <p className="text-sm text-gray-600">
            <a
              href={`/companies/${ownedCompany.slug}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-violet-700 underline underline-offset-2"
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
    <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {t('company.profileEditor.form.publicCatalogTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('company.profileEditor.form.publicCatalogDescription')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
        <p className="text-sm text-emerald-700">
          {t('company.profileEditor.form.visibleInCatalog')}
          {ownedCompany.slug ? (
            <>
              :{' '}
              <a
                href={`/companies/${ownedCompany.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                {t('company.profileEditor.form.viewProfile')}
              </a>
            </>
          ) : null}
          .
        </p>
      ) : ownedCompany.isVerified ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50/80 px-4 py-3">
          <p className="text-sm text-violet-900">
            {t('company.profileEditor.form.verifiedReadyPublish')}
          </p>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={publishCompanyPending}
            className={cabinetBtnPrimary}
          >
            {publishCompanyPending
              ? t('company.profileEditor.publishing')
              : t('company.profileEditor.publishCatalog')}
          </button>
        </div>
      ) : (
        <p className="text-sm text-amber-800 rounded-2xl bg-amber-50/80 px-4 py-3">
          {t('company.profileEditor.form.pendingAdminVerification')}
        </p>
      )}
    </section>
  );
}
