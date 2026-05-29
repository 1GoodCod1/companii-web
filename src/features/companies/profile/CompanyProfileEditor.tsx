import { useTranslation } from 'react-i18next';
import { useCompanyProfileForm } from './useCompanyProfileForm';
import { PageHero, cabinetBtnPrimary } from '@/components/cabinet/cabinet-ui';
import { CompanyBrandingSection } from '@/components/company/CompanyBrandingSection';
import type { CatalogOptionDto, OwnedCompanyDto } from '@/types/companies';
import { CatalogPublishSection } from './components/CatalogPublishSection';
import { LegalInfoSection } from './components/LegalInfoSection';
import { LocationSection } from './components/LocationSection';
import { FiscalSection } from './components/FiscalSection';
import { ContactSection } from './components/ContactSection';
import { LeaveTeamSection } from './components/LeaveTeamSection';

type OwnedCompany = OwnedCompanyDto;

export function CompanyProfileEditor({
  ownedCompany,
  isLegalOwner,
  canRegisterCompany = false,
  canEditLegalProfile,
  canPublishCompany,
  cities,
  categories,
  userDefaults,
}: {
  ownedCompany: OwnedCompany | null;
  isLegalOwner: boolean;
  canRegisterCompany?: boolean;
  canEditLegalProfile: boolean;
  canPublishCompany: boolean;
  cities: CatalogOptionDto[] | undefined;
  categories: CatalogOptionDto[] | undefined;
  userDefaults?: { email?: string; phone?: string | null };
}) {
  const { t } = useTranslation();

  const {
    name,
    setName,
    legalName,
    setLegalName,
    idno,
    setIdno,
    legalAddress,
    setLegalAddress,
    cityId,
    setCityId,
    categoryId,
    setCategoryId,
    isTvaPayer,
    setIsTvaPayer,
    tvaCode,
    setTvaCode,
    contactPhone,
    setContactPhone,
    contactEmail,
    setContactEmail,
    showPublicPhone,
    setShowPublicPhone,
    showPublicEmail,
    setShowPublicEmail,
    description,
    setDescription,
    logoUrl,
    logoPreview,
    pendingGallery,
    setPendingGallery,
    isSaving,
    legalReadOnly,
    canLeaveCompany,
    leaveCompanyPending,
    publishCompanyPending,
    handleLogoPick,
    handleGalleryPick,
    handlePendingGalleryRemove,
    handleGalleryRemove,
    handleSubmit,
    handlePublish,
    handleLeaveTeam,
  } = useCompanyProfileForm({
    ownedCompany,
    isLegalOwner,
    canRegisterCompany,
    canEditLegalProfile,
    canPublishCompany,
    userDefaults,
  });

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      <PageHero
        eyebrow={
          ownedCompany
            ? isLegalOwner
              ? t('company.profileEditor.eyebrowProfile')
              : t('company.profileEditor.eyebrowManager')
            : t('company.profileEditor.eyebrowOnboarding')
        }
        title={ownedCompany ? t('company.profileEditor.titleExisting') : t('company.profileEditor.titleNew')}
        description={
          ownedCompany
            ? isLegalOwner
              ? t('company.profileEditor.descOwner')
              : t('company.profileEditor.descManager')
            : t('company.profileEditor.descNew')
        }
      />

      {ownedCompany && !isLegalOwner ? (
        <p className="text-sm text-violet-900 rounded-2xl bg-violet-50/80 px-4 py-3 border border-violet-100">
          {t('company.profileEditor.form.managerHint')}
        </p>
      ) : null}

      {ownedCompany ? (
        <CatalogPublishSection
          ownedCompany={ownedCompany}
          isLegalOwner={isLegalOwner}
          canPublishCompany={canPublishCompany}
          handlePublish={handlePublish}
          publishCompanyPending={publishCompanyPending}
        />
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start"
      >
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
          <LegalInfoSection
            name={name}
            setName={setName}
            legalName={legalName}
            setLegalName={setLegalName}
            idno={idno}
            setIdno={setIdno}
            legalAddress={legalAddress}
            setLegalAddress={setLegalAddress}
            legalReadOnly={legalReadOnly}
          />

          <LocationSection
            cityId={cityId}
            setCityId={setCityId}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            cities={cities}
            categories={categories}
          />

          <FiscalSection
            isTvaPayer={isTvaPayer}
            setIsTvaPayer={setIsTvaPayer}
            tvaCode={tvaCode}
            setTvaCode={setTvaCode}
            legalReadOnly={legalReadOnly}
          />

          <ContactSection
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            showPublicPhone={showPublicPhone}
            setShowPublicPhone={setShowPublicPhone}
            showPublicEmail={showPublicEmail}
            setShowPublicEmail={setShowPublicEmail}
            description={description}
            setDescription={setDescription}
            isLegalOwner={isLegalOwner}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="glass-panel rounded-3xl p-5 sm:p-6">
            <CompanyBrandingSection
              variant="sidebar"
              companyName={name}
              logoUrl={logoUrl}
              logoPreview={logoPreview}
              onLogoPick={handleLogoPick}
              galleryImages={ownedCompany?.galleryImages ?? []}
              pendingGallery={pendingGallery}
              onGalleryPick={handleGalleryPick}
              onPendingGalleryCaptionChange={(id, caption) =>
                setPendingGallery((prev) =>
                  prev.map((item) => (item.id === id ? { ...item, caption } : item)),
                )
              }
              onPendingGalleryRemove={handlePendingGalleryRemove}
              onGalleryRemove={(imageId) => void handleGalleryRemove(imageId)}
              disabled={isSaving}
            />
          </div>

          <div className="glass-panel rounded-3xl p-5 sm:p-6">
            <button
              type="submit"
              disabled={isSaving}
              className={`${cabinetBtnPrimary} w-full justify-center py-3 text-sm`}
            >
              {isSaving
                ? t('cabinet.common.saving')
                : ownedCompany
                  ? t('company.profileEditor.saveChanges')
                  : t('company.profileEditor.createCompany')}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              {t('company.profileEditor.form.mediaHint')}
            </p>
          </div>
        </aside>
      </form>

      <LeaveTeamSection
        canLeaveCompany={canLeaveCompany}
        leaveCompanyPending={leaveCompanyPending}
        handleLeaveTeam={handleLeaveTeam}
      />
    </div>
  );
}
