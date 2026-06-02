import { Suspense } from 'react';
import { CompanyLayout } from '@/widgets/layout/CompanyLayout';
import { RequireAuth, RequireCompanyRole } from '@/features/auth';
import {
  CompanyEstimatesPage,
  CompanyTemplatesPage,
  CompanyEstimateWizardPage,
  EstimateWorkSheetPage,
  MyWorksheetsPage,
} from './lazy-pages';
import { CompanyDashboardPage } from '@/pages/company/CompanyDashboardPage';
import { CompanyProfilePage } from '@/pages/company/CompanyProfilePage';
import { CompanyGalleryPage } from '@/pages/company/CompanyGalleryPage';
import { CompanyTeamPage } from '@/pages/company/CompanyTeamPage';
import { CompanyCustomersPage } from '@/pages/company/CompanyCustomersPage';
import { CompanyLeadsPage } from '@/pages/company/CompanyLeadsPage';
import { CompanyInterventionsPage } from '@/pages/company/CompanyInterventionsPage';
import { CompanyCalendarPage } from '@/pages/company/CompanyCalendarPage';
import { CompanyPricingModifiersPage } from '@/pages/company/CompanyPricingModifiersPage';
import { CompanyQuotesPage } from '@/pages/company/CompanyQuotesPage';
import { CompanyServicesPage } from '@/pages/company/CompanyServicesPage';
import { CompanyInvoicesPage } from '@/pages/company/CompanyInvoicesPage';
import { CompanyReviewsPage } from '@/pages/company/CompanyReviewsPage';
import { CompanyAuditPage } from '@/pages/company/CompanyAuditPage';
import { SettingsPage } from '@/features/settings';
import { CompanySubscriptionPage } from '@/pages/company/CompanySubscriptionPage';
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
          <CompanyDashboardPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.PROFILE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.PROFILE}>
          <CompanyProfilePage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.GALLERY,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.GALLERY}>
          <CompanyGalleryPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.TEAM,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.TEAM}>
          <CompanyTeamPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CLIENTI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CLIENTI}>
          <CompanyCustomersPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CERERI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CERERI}>
          <CompanyLeadsPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI_MY,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI_MY}>
          <Suspense fallback={null}>
            <MyWorksheetsPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI}>
          <CompanyInterventionsPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.CALENDAR,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.CALENDAR}>
          <CompanyCalendarPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.LUCRARI_FISA,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.LUCRARI_FISA}>
          <Suspense fallback={null}>
            <EstimateWorkSheetPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <Suspense fallback={null}>
            <CompanyEstimatesPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_TEMPLATES,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE_TEMPLATES}>
          <Suspense fallback={null}>
            <CompanyTemplatesPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_PRICING,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <CompanyPricingModifiersPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_NEW,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <Suspense fallback={null}>
            <CompanyEstimateWizardPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SMETE_DETAIL,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
          <Suspense fallback={null}>
            <CompanyEstimateWizardPage />
          </Suspense>
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.OFERTE,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.OFERTE}>
          <CompanyQuotesPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SERVICII,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SERVICII}>
          <CompanyServicesPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.FACTURI,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.FACTURI}>
          <CompanyInvoicesPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.RECENZII,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.RECENZII}>
          <CompanyReviewsPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.AUDIT,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.AUDIT}>
          <CompanyAuditPage />
        </RequireCompanyRole>
      ),
    },
    {
      path: COMPANY_ROUTE.SETTINGS,
      element: <SettingsPage />,
    },
    {
      path: COMPANY_ROUTE.SUBSCRIPTION,
      element: (
        <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SUBSCRIPTION}>
          <CompanySubscriptionPage />
        </RequireCompanyRole>
      ),
    },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
