import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHero, Panel, SoftBadge } from '@/components/cabinet/cabinet-ui';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { DashboardKpiGrid } from '@/features/fsm/components/dashboard/DashboardKpiGrid';
import { DashboardNewLeadsPanel } from '@/features/fsm/components/dashboard/DashboardNewLeadsPanel';
import { DashboardActiveInterventionsPanel } from '@/features/fsm/components/dashboard/DashboardActiveInterventionsPanel';
import { DashboardRecentInvoicesPanel } from '@/features/fsm/components/dashboard/DashboardRecentInvoicesPanel';
import { useDashboardPageData } from '@/features/fsm/hooks/useDashboardPageData';

export function CompanyDashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { isOwner } = useCompanyPermissions();
  const dashboard = useDashboardPageData();

  const displayName =
    dashboard.activeCompany?.name || user?.email?.split('@')[0] || t('cabinet.common.userFallback');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('company.dashboardPage.eyebrow')}
        title={t('company.dashboardPage.greeting', { name: displayName })}
        description={
          dashboard.isManagement
            ? t('company.dashboardPage.descriptionManagement')
            : t('company.dashboardPage.descriptionTechnician')
        }
        action={
          dashboard.onboardingRequired ? (
            <Link
              to="/company/profile"
              className="inline-flex items-center rounded-xl bg-gray-900 hover:bg-gray-800 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors"
            >
              {t('company.dashboardPage.registerCompany')}
            </Link>
          ) : dashboard.isManagement && dashboard.activeCompany ? (
            <div className="text-right shrink-0">
              <SoftBadge tone="emerald">{dashboard.activePlanName}</SoftBadge>
              <p className="text-xs text-gray-400 mt-2">{t('company.dashboardPage.activeSubscription')}</p>
              {isOwner ? (
                <Link
                  to="/company/subscription"
                  className="inline-block mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  {t('company.dashboardPage.managePlan')}
                </Link>
              ) : null}
            </div>
          ) : dashboard.isManagement ? (
            <Link
              to="/company/profile"
              className="inline-flex items-center rounded-xl bg-gray-900 hover:bg-gray-800 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors"
            >
              {t('company.dashboardPage.createProfile')}
            </Link>
          ) : undefined
        }
      />

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

      <DashboardKpiGrid kpis={dashboard.kpis} />

      <div
        className={`grid grid-cols-1 gap-5 sm:gap-6 ${dashboard.isManagement ? 'xl:grid-cols-3 lg:grid-cols-2' : 'lg:grid-cols-2'}`}
      >
        {dashboard.isManagement ? (
          <DashboardNewLeadsPanel
            leads={dashboard.newLeads}
            convertPending={dashboard.convertPending}
            onConvert={dashboard.handleConvertLead}
          />
        ) : null}

        <DashboardActiveInterventionsPanel
          interventions={dashboard.activeInterventions}
          isManagement={dashboard.isManagement}
        />

        {dashboard.isManagement ? (
          <DashboardRecentInvoicesPanel invoices={dashboard.invoices} />
        ) : null}
      </div>
    </div>
  );
}
