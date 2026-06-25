import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, XIcon } from '@phosphor-icons/react';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useCompanyGalleryForm } from '@/features/companies/gallery/useCompanyGalleryForm';
import { CompanyGallerySection } from '@/entities/company/ui/CompanyGallerySection';
import { cabinetBtnPrimary, cabinetBtnSecondary, EmptyState } from '@/widgets/cabinet/cabinet-ui';
import { ROUTE_ABS, COMPANY_CABINET_PATH } from '@/shared/constants/routes.constants';
import {
  companyPageBackButtonClass,
  companyPagePanelClass,
  companyPagePanelInsetClass,
  companyPageShellClass,
} from '@/features/companies/companyFormPanelUi';

export function CompanyGalleryPage() {
  const { t } = useTranslation();
  const { data: companyMe, isPending } = useCompanyMeQuery();
  const { activeCompanyId } = useCompanyPermissions();
  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);

  const {
    pendingGallery,
    setPendingGallery,
    isSaving,
    uploadProgress,
    handleGalleryPick,
    handlePendingGalleryRemove,
    handleGalleryRemove,
    handleSave,
    handleCancelUpload,
    hasPendingChanges,
  } = useCompanyGalleryForm(activeCompany);

  const onCaptionChange = useCallback(
    (id: string, caption: string) =>
      setPendingGallery((prev) =>
        prev.map((item) => (item.id === id ? { ...item, caption } : item)),
      ),
    [setPendingGallery],
  );

  const onGalleryRemove = useCallback(
    (imageId: string) => void handleGalleryRemove(imageId),
    [handleGalleryRemove],
  );

  const progressPct =
    uploadProgress && uploadProgress.total > 0
      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
      : 0;

  if (isPending && !companyMe) {
    return (
      <div className={`${companyPageShellClass} flex items-center justify-center py-20 text-sm text-gray-400`}>
        {t('company.galleryPage.loading')}
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className={companyPageShellClass}>
        <EmptyState message={t('company.galleryPage.unavailable')} />
      </div>
    );
  }

  return (
    <div className={companyPageShellClass}>
      <header className="flex items-center gap-3">
        <Link
          to={`${ROUTE_ABS.COMPANY}${COMPANY_CABINET_PATH.PROFILE}`}
          title={t('company.galleryPage.backToProfile')}
          className={companyPageBackButtonClass}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">
            {t('company.galleryPage.title')}
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">{t('company.galleryPage.description')}</p>
        </div>
      </header>

      <div className={`${companyPagePanelClass} ${companyPagePanelInsetClass} space-y-6`}>
        <CompanyGallerySection
          layout="page"
          galleryImages={activeCompany.galleryImages ?? []}
          pendingGallery={pendingGallery}
          onGalleryPick={handleGalleryPick}
          onPendingGalleryCaptionChange={onCaptionChange}
          onPendingGalleryRemove={handlePendingGalleryRemove}
          onGalleryRemove={onGalleryRemove}
          disabled={isSaving}
        />

        {uploadProgress ? (
          <div className="space-y-2 border-t border-[var(--dashboard-divider)] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">
                {t('company.galleryPage.uploading', {
                  current: Math.ceil(uploadProgress.current),
                  total: uploadProgress.total,
                })}
              </span>
              <span className="font-black text-[var(--dashboard-accent)]">{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-gray-100">
              <div
                className="h-full bg-[var(--dashboard-accent)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-center sm:justify-start">
              <button
                type="button"
                onClick={handleCancelUpload}
                className={`${cabinetBtnSecondary} flex items-center gap-1.5 text-xs`}
              >
                <XIcon className="size-3.5" />
                {t('cabinet.common.cancel')}
              </button>
            </div>
          </div>
        ) : null}

        {hasPendingChanges && !isSaving ? (
          <div className="flex justify-center border-t border-[var(--dashboard-divider)] pt-4 sm:justify-end">
            <button
              type="button"
              onClick={() => void handleSave()}
              className={`${cabinetBtnPrimary} min-w-[160px] justify-center py-3 text-sm`}
            >
              {t('company.galleryPage.saveChanges')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
