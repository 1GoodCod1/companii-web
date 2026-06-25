import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanyProfileForm } from './useCompanyProfileForm';
import { cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { CompanyBrandingSection } from '@/entities/company/ui/CompanyBrandingSection';
import type { CatalogOptionDto, OwnedCompanyDto } from '@/entities/company/model/companies.types';
import {
  companyPagePanelClass,
  companyPagePanelHeaderClass,
  companyPagePanelInsetClass,
  companyPageSectionDividerClass,
  companyPageShellClass,
} from '@/features/companies/companyFormPanelUi';
import { CatalogPublishSection } from './components/CatalogPublishSection';
import { LegalInfoSection } from './components/LegalInfoSection';
import { LocationSection } from './components/LocationSection';
import { FiscalSection } from './components/FiscalSection';
import { ContactSection } from './components/ContactSection';
import { LeaveTeamSection } from './components/LeaveTeamSection';

type OwnedCompany = OwnedCompanyDto;

export function CompanyProfileEditor({
  ownedCompany,
  permissions,
  cities,
  categories,
  userDefaults,
}: {
  ownedCompany: OwnedCompany | null;
  permissions: {
    isLegalOwner: boolean;
    canRegisterCompany?: boolean;
    canEditLegalProfile: boolean;
    canPublishCompany: boolean;
  };
  cities: CatalogOptionDto[] | undefined;
  categories: CatalogOptionDto[] | undefined;
  userDefaults?: { email?: string; phone?: string | null };
}) {
  const {
    isLegalOwner,
    canRegisterCompany = false,
    canEditLegalProfile,
    canPublishCompany,
  } = permissions;
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
    isSaving,
    legalReadOnly,
    canLeaveCompany,
    leaveCompanyPending,
    publishCompanyPending,
    handleLogoPick,
    handleSubmit,
    handlePublish,
    handleLeaveTeam,
    confirmDialog,
  } = useCompanyProfileForm({
    ownedCompany,
    isLegalOwner,
    canRegisterCompany,
    canEditLegalProfile,
    canPublishCompany,
    userDefaults,
  });

  const [activeTab, setActiveTab] = useState<'legal' | 'contact'>('legal');

  const tabs: { id: 'legal' | 'contact'; label: string }[] = [
    { id: 'legal', label: t('company.profileEditor.tabs.legal') },
    { id: 'contact', label: t('company.profileEditor.tabs.contact') },
  ];

  return (
    <div className={companyPageShellClass}>
      {ownedCompany && !isLegalOwner ? (
        <p className="border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)] bg-white px-4 py-3 text-sm text-gray-600">
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

      <form onSubmit={handleSubmit} className={companyPagePanelClass}>
        <div className={companyPagePanelHeaderClass}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div
              className="scrollbar-none flex w-full items-center justify-center gap-6 overflow-x-auto sm:justify-start"
              role="tablist"
            >
              {tabs.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-bold transition-colors',
                      active
                        ? 'border-[var(--dashboard-accent)] text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button type="submit" disabled={isSaving} className={`${cabinetBtnPrimary} w-full sm:w-auto`}>
              {isSaving
                ? t('cabinet.common.saving')
                : ownedCompany
                  ? t('company.profileEditor.saveChanges')
                  : t('company.profileEditor.createCompany')}
            </button>
          </div>
        </div>

        <div className={companyPagePanelInsetClass}>
          {activeTab === 'legal' ? (
            <div className={companyPageSectionDividerClass}>
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
            </div>
          ) : (
            <div className={companyPageSectionDividerClass}>
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

              <div className="pt-5">
                <CompanyBrandingSection
                  variant="sidebar"
                  companyName={name}
                  logoUrl={logoUrl}
                  logoPreview={logoPreview}
                  onLogoPick={handleLogoPick}
                  disabled={isSaving}
                />
              </div>
            </div>
          )}
        </div>
      </form>

      <LeaveTeamSection
        canLeaveCompany={canLeaveCompany}
        leaveCompanyPending={leaveCompanyPending}
        handleLeaveTeam={handleLeaveTeam}
      />
      {confirmDialog}
    </div>
  );
}
