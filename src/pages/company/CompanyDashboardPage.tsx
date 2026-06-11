import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Panel, SoftBadge, SkeletonCard } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { DashboardKpiGrid } from '@/features/fsm';
import { DashboardNewLeadsPanel } from '@/features/fsm';
import { DashboardActiveInterventionsPanel } from '@/features/fsm';
import { DashboardRecentInvoicesPanel } from '@/features/fsm';
import { DashboardAnalyticsSection } from '@/features/fsm';
import { useDashboardPageData } from '@/features/fsm';

type DashboardTab = 'overview' | 'analytics';

export function CompanyDashboardPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const { isOwner } = useCompanyPermissions();
  const dashboard = useDashboardPageData();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const displayName =
    dashboard.activeCompany?.name || user?.email?.split('@')[0] || t('cabinet.common.userFallback');

  const today = new Date();
  const todayRaw = `${formatDateLocalized(today, locale, 'weekdayLong')} ${today.getFullYear()}`;
  const todayLabel = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const showTabs = dashboard.isManagement && !dashboard.onboardingRequired;

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'overview', label: t('company.dashboardPage.tabs.overview') },
    { id: 'analytics', label: t('company.dashboardPage.tabs.analytics') },
  ];

  const overviewContent = (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2 items-stretch">
        <DashboardKpiGrid kpis={dashboard.kpis} layout="square" />

        {dashboard.isManagement ? (
          <DashboardNewLeadsPanel
            leads={dashboard.newLeads}
            convertPending={dashboard.convertPending}
            onConvert={dashboard.handleConvertLead}
          />
        ) : (
          <DashboardActiveInterventionsPanel
            interventions={dashboard.activeInterventions}
            isManagement={dashboard.isManagement}
          />
        )}
      </div>

      {dashboard.isManagement ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 items-stretch">
          <DashboardActiveInterventionsPanel
            interventions={dashboard.activeInterventions}
            isManagement={dashboard.isManagement}
          />
          <DashboardRecentInvoicesPanel invoices={dashboard.invoices} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-none bg-gray-900 px-5 py-5 sm:px-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
              {todayLabel}
            </p>
            <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
              {t('company.dashboardPage.greeting', { name: displayName })}
            </h1>
          </div>

          {dashboard.onboardingRequired ? (
            <Link
              to="/company/profile"
              className="inline-flex shrink-0 items-center rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-gray-900 transition-colors hover:bg-violet-50"
            >
              {t('company.dashboardPage.registerCompany')}
            </Link>
          ) : dashboard.isManagement && dashboard.activeCompany ? (
            <div className="flex shrink-0 items-center gap-3">
              <SoftBadge tone="emerald">{dashboard.activePlanName}</SoftBadge>
              {isOwner ? (
                <Link
                  to="/company/subscription"
                  className="text-xs font-semibold text-gray-300 hover:text-white"
                >
                  {t('company.dashboardPage.managePlan')}
                </Link>
              ) : null}
            </div>
          ) : dashboard.isManagement ? (
            <Link
              to="/company/profile"
              className="inline-flex shrink-0 items-center rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-gray-900 transition-colors hover:bg-violet-50"
            >
              {t('company.dashboardPage.createProfile')}
            </Link>
          ) : null}
        </div>
      </section>

      {dashboard.onboardingRequired ? (
        <Panel className="p-5 border border-amber-100 bg-amber-50/50">
          <p className="text-sm text-gray-800 leading-relaxed">
            {t('company.dashboardPage.onboardingPrefix')}{' '}
            <Link to="/company/profile" className="font-semibold text-violet-700 hover:text-violet-800">
              {t('company.dashboardPage.onboardingProfileLink')}
            </Link>{' '}
            {t('company.dashboardPage.onboardingSuffix')}
          </p>
        </Panel>
      ) : null}

      {!dashboard.isManagement && !dashboard.onboardingRequired ? (
        <Panel className="p-4 border border-violet-100 bg-violet-50/40">
          <p className="text-sm text-gray-700">
            {t('company.dashboardPage.technicianPrefix')}{' '}
            <strong>{t('company.dashboardPage.technicianRole')}</strong>{' '}
            {t('company.dashboardPage.technicianMiddle')}{' '}
            <Link to="/company/lucrari" className="font-semibold text-violet-700 hover:text-violet-800">
              {t('company.lucrari')}
            </Link>{' '}
            {t('company.dashboardPage.linkAnd')}{' '}
            <Link to="/company/calendar" className="font-semibold text-violet-700 hover:text-violet-800">
              {t('company.calendar')}
            </Link>
            {t('company.dashboardPage.technicianCalendarSuffix')}
          </p>
        </Panel>
      ) : null}

      {showTabs ? (
        <>
          <div className="flex items-center gap-6 border-b border-gray-200" role="tablist">
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
                    '-mb-px border-b-2 px-1 pb-3 text-sm font-bold transition-colors',
                    active
                      ? 'border-violet-600 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' ? (
            overviewContent
          ) : (
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonCard key={index} className="h-[372px]" />
                  ))}
                </div>
              }
            >
              <DashboardAnalyticsSection />
            </Suspense>
          )}
        </>
      ) : (
        overviewContent
      )}
    </div>
  );
}
