import { CompanyLayout } from '@/widgets/layout/CompanyLayout';
import { RequireAuth, RequireCompanyRole } from '@/features/auth';
import { LazyPage } from './LazyPage';
import {
  CompanyDashboardPage,
  CompanyProfilePage,
  CompanyGalleryPage,
  CompanyTeamPage,
  CompanyCustomersPage,
  CompanyLeadsPage,
  CompanyInterventionsPage,
  CompanyPipelinePage,
  CompanyCalendarPage,
  CompanyPricingModifiersPage,
  CompanyQuotesPage,
  CompanyServicesPage,
  CompanyInvoicesPage,
  CompanyReviewsPage,
  CompanyAuditPage,
  CompanySubscriptionPage,
  SettingsPage,
  CompanyEstimatesPage,
  CompanyTemplatesPage,
  CompanyEstimateWizardPage,
  EstimateWorkSheetPage,
  MyWorksheetsPage,
} from './lazy-pages';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import {
  ROUTE_ROOT,
  ROUTE_ACCESS,
  COMPANY_CABINET_PATH,
  COMPANY_ROUTE,
} from '@/shared/constants/routes.constants';

export const companyRoutesSection = {
  path: ROUTE_ROOT.COMPANY,
  element: (
    <RequireAuth kinds={[...ROUTE_ACCESS.COMPANY_CABINET]}>
      <CompanyLayout />
    </RequireAuth>
  ),
  children: [
    {
      index: true,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.DASHBOARD}>
          <LazyPage><CompanyDashboardPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.PROFILE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.PROFILE}>
          <LazyPage><CompanyProfilePage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.GALLERY,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.GALLERY}>
          <LazyPage><CompanyGalleryPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.TEAM,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.TEAM}>
          <LazyPage><CompanyTeamPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CLIENTI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CLIENTI}>
          <LazyPage><CompanyCustomersPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CERERI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CERERI}>
          <LazyPage><CompanyLeadsPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI_MY,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI_MY}>
          <LazyPage><MyWorksheetsPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI}>
          <LazyPage><CompanyInterventionsPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CALENDAR,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CALENDAR}>
          <LazyPage><CompanyCalendarPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.PIPELINE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.PIPELINE}>
          <LazyPage><CompanyPipelinePage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI_FISA,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI_FISA}>
          <LazyPage><EstimateWorkSheetPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <LazyPage><CompanyEstimatesPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_TEMPLATES,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE_TEMPLATES}>
          <LazyPage><CompanyTemplatesPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_PRICING,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <LazyPage><CompanyPricingModifiersPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_NEW,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <LazyPage><CompanyEstimateWizardPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_DETAIL,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <LazyPage><CompanyEstimateWizardPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.OFERTE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.OFERTE}>
          <LazyPage><CompanyQuotesPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SERVICII,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SERVICII}>
          <LazyPage><CompanyServicesPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.FACTURI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.FACTURI}>
          <LazyPage><CompanyInvoicesPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.RECENZII,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.RECENZII}>
          <LazyPage><CompanyReviewsPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.AUDIT,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.AUDIT}>
          <LazyPage><CompanyAuditPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SETTINGS,
      element: <LazyPage><SettingsPage /></LazyPage>,
    },
    {
      path: COMPANY_ROUTE.SUBSCRIPTION,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SUBSCRIPTION}>
          <LazyPage><CompanySubscriptionPage /></LazyPage>
        </RequireCompanyRole>
      ),
    },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
