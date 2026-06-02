import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useCompanyGalleryForm } from '@/features/companies/gallery/useCompanyGalleryForm';
import { CompanyGallerySection } from '@/entities/company/ui/CompanyGallerySection';
import { PageHero, cabinetBtnPrimary, EmptyState } from '@/widgets/cabinet/cabinet-ui';
import { ROUTE_ABS, COMPANY_CABINET_PATH } from '@/shared/constants/routes.constants';

export function CompanyGalleryPage() {
  const { t } = useTranslation();
  const { data: companyMe, isPending } = useCompanyMeQuery();
  const { activeCompanyId } = useCompanyPermissions();
  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);

  const {
    pendingGallery,
    setPendingGallery,
    isSaving,
    handleGalleryPick,
    handlePendingGalleryRemove,
    handleGalleryRemove,
    handleSave,
    hasPendingChanges,
  } = useCompanyGalleryForm(activeCompany);

  if (isPending && !companyMe) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        {t('company.galleryPage.loading')}
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="max-w-2xl">
        <EmptyState message={t('company.galleryPage.unavailable')} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <Link
        to={`${ROUTE_ABS.COMPANY}${COMPANY_CABINET_PATH.PROFILE}`}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        {t('company.galleryPage.backToProfile')}
      </Link>

      <PageHero
        eyebrow={t('company.galleryPage.eyebrow')}
        title={t('company.galleryPage.title')}
        description={t('company.galleryPage.description')}
      />

      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-6">
        <CompanyGallerySection
          layout="page"
          galleryImages={activeCompany.galleryImages ?? []}
          pendingGallery={pendingGallery}
          onGalleryPick={handleGalleryPick}
          onPendingGalleryCaptionChange={(id, caption) =>
            setPendingGallery((prev) =>
              prev.map((item) => (item.id === id ? { ...item, caption } : item)),
            )
          }
          onPendingGalleryRemove={handlePendingGalleryRemove}
          onGalleryRemove={(imageId) => void handleGalleryRemove(imageId)}
          disabled={false}
        />

        {hasPendingChanges ? (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave()}
              className={`${cabinetBtnPrimary} min-w-[160px] justify-center py-3 text-sm`}
            >
              {isSaving ? t('cabinet.common.saving') : t('company.galleryPage.saveChanges')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
