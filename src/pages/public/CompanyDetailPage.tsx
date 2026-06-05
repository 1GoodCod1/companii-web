import { Link } from 'react-router-dom';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { ArrowLeftIcon, ClockIcon, SparkleIcon, HardHatIcon } from '@phosphor-icons/react';
import { CompanyGallery } from '@/entities/company/ui/CompanyGallery';
import { CompanyReviewsSection } from '@/features/reviews';
import { formatServiceDurationI18n } from '@/entities/fsm/model/serviceDuration';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { useCompanyDetail } from '@/features/companies/hooks/useCompanyDetail';
import { CompanyHero } from '@/features/companies/components/CompanyHero';
import { CompanySpecsSidebar } from '@/features/companies/components/CompanySpecsSidebar';
import { CompanyContactSidebar } from '@/features/companies/components/CompanyContactSidebar';
import { CompanyServiceRequestModal } from '@/features/companies/components/CompanyServiceRequestModal';
import { CompanyProjectRequestModal } from '@/features/companies/components/CompanyProjectRequestModal';

export function CompanyDetailPage() {
  return useCompanyDetailPageView();
}

function useCompanyDetailPageView() {
  const lp = useLocalizedPath();
  const {
    t,
    isAuthenticated,
    showRequestActions,
    company,
    isLoading,
    isError,
    requestModal,
    setRequestModal,
    projectModalOpen,
    setProjectModalOpen,
    message,
    setMessage,
    projectTitle,
    setProjectTitle,
    projectAddress,
    setProjectAddress,
    projectEstimatedBudget,
    setProjectEstimatedBudget,
    projectMessage,
    setProjectMessage,
    profileName,
    profilePhone,
    profileEmail,
    openServiceRequest,
    openProjectRequest,
    handleRequestSubmit,
    handleProjectSubmit,
    resetProjectForm,
    location,
    isRequestServicePending,
    isRequestProjectPending,
  } = useCompanyDetail();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pb-12 max-w-6xl mx-auto">
        <div className="h-60 rounded-3xl bg-slate-200/80" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="h-48 rounded-3xl bg-slate-200/80" />
            <div className="h-64 rounded-3xl bg-slate-200/80" />
          </div>
          <div className="h-80 rounded-3xl bg-slate-200/80" />
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center">
        <div className="glass-panel rounded-3xl p-12 border-red-100">
          <p className="text-base font-semibold text-red-600 mb-6">
            {t('companyDetail.notFound')}
          </p>
          <Link
            to={lp('/companies')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-xs font-black uppercase tracking-wider text-white transition-colors"
          >
            {t('companyDetail.backToCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  const rating = Number(company.rating);
  const gallery = company.galleryImages ?? [];

  return (
    <>
      <SEOHead
        title={company.name}
        description={company.description ?? t('companyDetail.seoDescriptionFallback', { name: company.name })}
        ogType="profile"
        ogImage={company.logoUrl ?? undefined}
        hreflang
      />

      <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          to={lp('/companies')}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
          {t('companyDetail.backLink')}
        </Link>
        <CompanyHero company={company} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-8 min-w-0">
            {company.description ? (
              <section className="glass-panel rounded-[28px] p-6 sm:p-8 border border-white/40">
                <div className="flex items-center gap-2 mb-4">
                  <SparkleIcon className="size-5 text-violet-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {t('companyDetail.about')}
                  </h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-wrap:pretty whitespace-pre-line">
                  {company.description}
                </p>
              </section>
            ) : null}

            <section className="glass-panel rounded-[28px] p-6 sm:p-8 border border-white/40">
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {t('companyDetail.galleryTitle')}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t('companyDetail.gallerySubtitle')}
                </p>
              </div>
              <CompanyGallery images={gallery} />
            </section>

            {(company.services?.length ?? 0) > 0 ? (
              <section className="glass-panel rounded-[28px] p-6 sm:p-8 border border-white/40">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="size-5 text-violet-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {t('companyDetail.servicesTitle')}
                  </h2>
                </div>
                {!isAuthenticated ? (
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {t('companyDetail.servicesAuthPrefix')}{' '}
                    <Link to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} className="font-semibold text-violet-600 hover:underline">
                      {t('companyDetail.servicesAuthLogin')}
                    </Link>{' '}
                    {t('companyDetail.servicesAuthMiddle')}{' '}
                    <Link to="/register?kind=END_CLIENT" className="font-semibold text-violet-600 hover:underline">
                      {t('companyDetail.servicesAuthRegister')}
                    </Link>
                    .
                  </p>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.services?.map((service) => {
                    const durationLabel = formatServiceDurationI18n(t, service.durationMinutes);
                    return (
                      <article
                        key={service.id}
                        className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-100 hover:border-violet-200/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.04)] p-6"
                      >
                        {/* Premium Top Glow Bar on Hover */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight text-wrap:pretty text-base">
                              {service.name}
                            </h3>

                            {/* Price in a glowing badge */}
                            <span className="shrink-0 inline-flex items-center bg-violet-50 text-violet-700 font-extrabold text-sm px-3.5 py-1.5 rounded-2xl border border-violet-100/50 tabular-nums">
                              {Number(service.defaultPrice).toLocaleString('ro-MD')}{' '}
                              {service.currency ?? 'MDL'}
                            </span>
                          </div>

                          {service.description ? (
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed text-wrap:pretty font-medium">
                              {service.description}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-300 italic leading-relaxed font-medium">
                              {t('companyDetail.noServiceDescription')}
                            </p>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100/60 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                              {t('companyDetail.serviceAvailability')}
                            </span>
                            {durationLabel ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-xl">
                                <ClockIcon className="size-3 text-slate-400" />
                                {durationLabel}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-400 rounded-xl">
                                <ClockIcon className="size-3 text-slate-300" />
                                {t('companyDetail.variableDuration')}
                              </span>
                            )}
                          </div>

                          {showRequestActions ? (
                            <button
                              type="button"
                              onClick={() => openServiceRequest(service.id, service.name)}
                              className="w-full py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider active:scale-[0.99] transition-all cursor-pointer"
                            >
                              {t('companyDetail.requestService')}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {showRequestActions ? (
              <section className="relative rounded-[32px] overflow-hidden border border-violet-100/60 bg-gradient-to-br from-violet-50/50 via-indigo-50/20 to-white p-6 sm:p-8 glass-panel">
                {/* Visual Glow Decorators */}
                <div className="absolute -right-20 -bottom-20 size-64 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
                <div className="absolute top-0 left-0 size-48 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0">
                        <HardHatIcon className="size-5" />
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {t('companyDetail.projectTitle')}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
                      {t('companyDetail.projectDescription')}
                      {!isAuthenticated && t('companyDetail.projectAuthNote')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openProjectRequest}
                    className="shrink-0 inline-flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <SparkleIcon className="size-4" /> {t('companyDetail.projectCta')}
                  </button>
                </div>
              </section>
            ) : null}

            {/* Reviews */}
            <CompanyReviewsSection
              slug={company.slug}
              rating={rating}
              totalReviews={company.totalReviews}
            />
          </div>

          {/* Sticky Sidebar Column */}
          <aside className="space-y-6 lg:sticky lg:top-8">
            {/* Structural metrics & Quick Info Widget */}
            <CompanySpecsSidebar company={company} />

            {/* Public Contact Widget */}
            <CompanyContactSidebar company={company} />
          </aside>
        </div>
      </div>

      <CompanyServiceRequestModal
        open={requestModal !== null}
        onClose={() => setRequestModal(null)}
        requestModal={requestModal}
        onSubmit={handleRequestSubmit}
        profileName={profileName}
        profilePhone={profilePhone}
        profileEmail={profileEmail}
        message={message}
        onMessageChange={setMessage}
        isPending={isRequestServicePending}
      />

      <CompanyProjectRequestModal
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          resetProjectForm();
        }}
        company={company}
        onSubmit={handleProjectSubmit}
        profileName={profileName}
        profilePhone={profilePhone}
        profileEmail={profileEmail}
        projectTitle={projectTitle}
        onProjectTitleChange={setProjectTitle}
        projectEstimatedBudget={projectEstimatedBudget}
        onProjectEstimatedBudgetChange={setProjectEstimatedBudget}
        projectAddress={projectAddress}
        onProjectAddressChange={setProjectAddress}
        projectMessage={projectMessage}
        onProjectMessageChange={setProjectMessage}
        isPending={isRequestProjectPending}
      />
    </>
  );
}
