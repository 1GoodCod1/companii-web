import { Link } from 'react-router-dom';
import { PageHero, Panel, SoftBadge } from '@/components/cabinet/cabinet-ui';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { DashboardKpiGrid } from '@/features/fsm/components/dashboard/DashboardKpiGrid';
import { DashboardNewLeadsPanel } from '@/features/fsm/components/dashboard/DashboardNewLeadsPanel';
import { DashboardActiveInterventionsPanel } from '@/features/fsm/components/dashboard/DashboardActiveInterventionsPanel';
import { DashboardRecentInvoicesPanel } from '@/features/fsm/components/dashboard/DashboardRecentInvoicesPanel';
import { useDashboardPageData } from '@/features/fsm/hooks/useDashboardPageData';

export function CompanyDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isOwner } = useCompanyPermissions();
  const dashboard = useDashboardPageData();

  const displayName = dashboard.activeCompany?.name || user?.email?.split('@')[0] || 'Utilizator';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Panou principal"
        title={`Salut, ${displayName}! 👋`}
        description={
          dashboard.isManagement
            ? 'Bine ai venit la panoul tău Faber CRM. Iată starea afacerii tale astăzi.'
            : 'Bine ai venit! Iată lucrările alocate ție și programarea de azi.'
        }
        action={
          dashboard.onboardingRequired ? (
            <Link
              to="/company/profile"
              className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
            >
              Înregistrează compania
            </Link>
          ) : dashboard.isManagement && dashboard.activeCompany ? (
            <div className="text-right shrink-0">
              <SoftBadge tone="emerald">{dashboard.activePlanName}</SoftBadge>
              <p className="text-xs text-gray-400 mt-2">Abonament activ</p>
              {isOwner ? (
                <Link
                  to="/company/subscription"
                  className="inline-block mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  Gestionează planul →
                </Link>
              ) : null}
            </div>
          ) : dashboard.isManagement ? (
            <Link
              to="/company/profile"
              className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
            >
              Creează profil companie
            </Link>
          ) : undefined
        }
      />

      {dashboard.onboardingRequired ? (
        <Panel className="p-5 border border-amber-100 bg-amber-50/50">
          <p className="text-sm text-gray-800 leading-relaxed">
            Contul tău nu este legat încă de o companie. Completează{' '}
            <Link to="/company/profile" className="font-semibold text-violet-700 hover:text-violet-800">
              profilul companiei
            </Link>{' '}
            (IDNO, adresă, categorie) pentru a accesa clienți, cereri și restul modulelor.
          </p>
        </Panel>
      ) : null}

      {!dashboard.isManagement && !dashboard.onboardingRequired ? (
        <Panel className="p-4 border border-violet-100 bg-violet-50/40">
          <p className="text-sm text-gray-700">
            Cont de <strong>tehnician</strong> — clienții, cererile și setările companiei le gestionează managerul.
            Lucrările tale sunt în{' '}
            <Link to="/company/lucrari" className="font-semibold text-violet-700 hover:text-violet-800">
              Lucrări
            </Link>{' '}
            și{' '}
            <Link to="/company/calendar" className="font-semibold text-violet-700 hover:text-violet-800">
              Calendar
            </Link>
            . Pentru a-ți înregistra propria companie, ieși din cont și creează un cont nou de tip «Companie» pe pagina publică de înregistrare.
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
