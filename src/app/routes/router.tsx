import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { LocaleOutlet } from '@/components/i18n/LocaleOutlet';
import { RedirectToLocalized } from '@/components/i18n/RedirectToLocalized';
import { getInitialLanguage } from '@/i18n';
import { localizePath } from '@/lib/i18n/localeRoutes';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import {
  LandingPage,
  CompaniesListPage,
  CompanyDetailPage,
} from './lazy-pages';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { FaqPage } from '@/pages/public/FaqPage';
import { ContactsPage } from '@/pages/public/ContactsPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { SubscriptionsPage } from '@/pages/public/SubscriptionsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { CompanyDashboardPage } from '@/pages/company/CompanyDashboardPage';
import { CompanyProfilePage } from '@/pages/company/CompanyProfilePage';
import { CompanyTeamPage } from '@/pages/company/CompanyTeamPage';
import { CompanyServicesPage } from '@/pages/company/CompanyServicesPage';
import { CompanyCustomersPage } from '@/pages/company/CompanyCustomersPage';
import { CompanyInterventionsPage } from '@/pages/company/CompanyInterventionsPage';
import { CompanyCalendarPage } from '@/pages/company/CompanyCalendarPage';
import { CompanyQuotesPage } from '@/pages/company/CompanyQuotesPage';
import { CompanyInvoicesPage } from '@/pages/company/CompanyInvoicesPage';
import { CompanySubscriptionPage } from '@/pages/company/CompanySubscriptionPage';
import { CompanyReviewsPage } from '@/pages/company/CompanyReviewsPage';
import { CompanyEstimatesPage } from '@/pages/company/CompanyEstimatesPage';
import { CompanyEstimateWizardPage } from '@/pages/company/CompanyEstimateWizardPage';
import { EstimateWorkSheetPage } from '@/pages/company/EstimateWorkSheetPage';
import { CompanyLeadsPage } from '@/pages/company/CompanyLeadsPage';
import { PortalCereriPage } from '@/pages/portal/PortalCereriPage';
import { PortalDashboardPage } from '@/pages/portal/PortalDashboardPage';
import { PortalLucrariPage } from '@/pages/portal/PortalLucrariPage';
import { PortalOfertePage } from '@/pages/portal/PortalOfertePage';
import { PortalFacturiPage } from '@/pages/portal/PortalFacturiPage';
import { PortalSmetePage } from '@/pages/portal/PortalSmetePage';
import { PortalInvitePage } from '@/pages/portal/PortalInvitePage';
import { TeamInvitePage } from '@/pages/company/TeamInvitePage';
import { AdminHomePage } from '@/pages/admin/AdminHomePage';
import { AdminCompaniesPage } from '@/pages/admin/AdminCompaniesPage';
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage';
import { AdminCitiesPage } from '@/pages/admin/AdminCitiesPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminClientsPage } from '@/pages/admin/AdminClientsPage';
import { AdminWaitlistPage } from '@/pages/admin/AdminWaitlistPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { RequireAuth, RequireCompanyRole } from '@/features/auth/guards';
import {
  ADMIN_ROUTE,
  COMPANY_CABINET_PATH,
  COMPANY_ROUTE,
  INVITE_ROUTE,
  PORTAL_ROUTE,
  PUBLIC_ROUTE,
  ROUTE_ACCESS,
  ROUTE_ROOT,
} from '@/constants/routes.constants';

const localizedPublicRoutes = [
  { index: true, element: <LandingPage /> },
  { path: PUBLIC_ROUTE.COMPANII, element: <LandingPage /> },
  { path: PUBLIC_ROUTE.HOW_IT_WORKS, element: <HowItWorksPage /> },
  { path: PUBLIC_ROUTE.FAQ, element: <FaqPage /> },
  { path: PUBLIC_ROUTE.CONTACTS, element: <ContactsPage /> },
  { path: PUBLIC_ROUTE.PRIVACY, element: <PrivacyPage /> },
  { path: PUBLIC_ROUTE.TERMS, element: <TermsPage /> },
  { path: PUBLIC_ROUTE.SUBSCRIPTIONS, element: <SubscriptionsPage /> },
  { path: PUBLIC_ROUTE.COMPANIES, element: <CompaniesListPage /> },
  { path: PUBLIC_ROUTE.COMPANY_DETAIL, element: <CompanyDetailPage /> },
];

const legacyLocalizedRedirects = [
  PUBLIC_ROUTE.COMPANII,
  PUBLIC_ROUTE.HOW_IT_WORKS,
  PUBLIC_ROUTE.FAQ,
  PUBLIC_ROUTE.CONTACTS,
  PUBLIC_ROUTE.PRIVACY,
  PUBLIC_ROUTE.TERMS,
  PUBLIC_ROUTE.SUBSCRIPTIONS,
  PUBLIC_ROUTE.COMPANIES,
  `${PUBLIC_ROUTE.COMPANIES}/*`,
].map((path) => ({
  path,
  element: <RedirectToLocalized />,
}));

const authPublicRoutes = [
  { path: PUBLIC_ROUTE.LOGIN, element: <LoginPage /> },
  { path: PUBLIC_ROUTE.REGISTER, element: <RegisterPage /> },
  { path: PUBLIC_ROUTE.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: PUBLIC_ROUTE.RESET_PASSWORD, element: <ResetPasswordPage /> },
  { path: INVITE_ROUTE.PORTAL, element: <PortalInvitePage /> },
  { path: INVITE_ROUTE.TEAM, element: <TeamInvitePage /> },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Navigate to={localizePath('/', getInitialLanguage())} replace />
        ),
      },
      {
        element: (
          <Suspense fallback={null}>
            <AuthLayout />
          </Suspense>
        ),
        children: authPublicRoutes,
      },
      {
        path: ':locale',
        element: <LocaleOutlet />,
        children: [
          {
            element: (
              <Suspense fallback={null}>
                <PublicLayout />
              </Suspense>
            ),
            children: localizedPublicRoutes,
          },
        ],
      },
      ...legacyLocalizedRedirects,
      {
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
                <EstimateWorkSheetPage />
              </RequireCompanyRole>
            ),
          },
          {
            path: COMPANY_ROUTE.SMETE,
            element: (
              <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
                <CompanyEstimatesPage />
              </RequireCompanyRole>
            ),
          },
          {
            path: COMPANY_ROUTE.SMETE_NEW,
            element: (
              <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
                <CompanyEstimateWizardPage />
              </RequireCompanyRole>
            ),
          },
          {
            path: COMPANY_ROUTE.SMETE_DETAIL,
            element: (
              <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SMETE}>
                <CompanyEstimateWizardPage />
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
            path: COMPANY_ROUTE.SUBSCRIPTION,
            element: (
              <RequireCompanyRole routePath={COMPANY_CABINET_PATH.SUBSCRIPTION}>
                <CompanySubscriptionPage />
              </RequireCompanyRole>
            ),
          },
        ],
      },
      {
        path: ROUTE_ROOT.PORTAL,
        element: (
          <RequireAuth kinds={[...ROUTE_ACCESS.END_CLIENT]}>
            <PortalLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <PortalDashboardPage /> },
          { path: PORTAL_ROUTE.CERERI, element: <PortalCereriPage /> },
          { path: PORTAL_ROUTE.LUCRARI, element: <PortalLucrariPage /> },
          { path: PORTAL_ROUTE.OFERTE, element: <PortalOfertePage /> },
          { path: PORTAL_ROUTE.SMETE, element: <PortalSmetePage /> },
          { path: PORTAL_ROUTE.FACTURI, element: <PortalFacturiPage /> },
        ],
      },
      {
        path: ROUTE_ROOT.ADMIN,
        element: (
          <RequireAuth kinds={[...ROUTE_ACCESS.PLATFORM_ADMIN]}>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <AdminHomePage /> },
          { path: ADMIN_ROUTE.COMPANIES, element: <AdminCompaniesPage /> },
          { path: ADMIN_ROUTE.SUBSCRIPTIONS, element: <AdminSubscriptionsPage /> },
          { path: ADMIN_ROUTE.WAITLIST, element: <AdminWaitlistPage /> },
          { path: ADMIN_ROUTE.REVIEWS, element: <AdminReviewsPage /> },
          { path: ADMIN_ROUTE.AUDIT, element: <AdminAuditPage /> },
          { path: ADMIN_ROUTE.CITIES, element: <AdminCitiesPage /> },
          { path: ADMIN_ROUTE.CATEGORIES, element: <AdminCategoriesPage /> },
          { path: ADMIN_ROUTE.CLIENTS, element: <AdminClientsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to={localizePath('/', getInitialLanguage())} replace />,
      },
    ],
  },
]);
