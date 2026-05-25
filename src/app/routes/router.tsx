import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CompanyLayout } from '@/components/layout/CompanyLayout';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LandingPage } from '@/pages/public/LandingPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { FaqPage } from '@/pages/public/FaqPage';
import { ContactsPage } from '@/pages/public/ContactsPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { SubscriptionsPage } from '@/pages/public/SubscriptionsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CompaniesListPage } from '@/pages/public/CompaniesListPage';
import { CompanyDetailPage } from '@/pages/public/CompanyDetailPage';
import { CompanyDashboardPage } from '@/pages/company/CompanyDashboardPage';
import { CompanyProfilePage } from '@/pages/company/CompanyProfilePage';
import { CompanyTeamPage } from '@/pages/company/CompanyTeamPage';
import { CompanyPackagesPage } from '@/pages/company/CompanyPackagesPage';
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
import { CompanyServicesPage } from '@/pages/company/CompanyServicesPage';
import { CompanyLeadsPage } from '@/pages/company/CompanyLeadsPage';
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

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'companii', element: <LandingPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'portal/invite', element: <PortalInvitePage /> },
      { path: 'team/invite', element: <TeamInvitePage /> },
      { path: 'companies', element: <CompaniesListPage /> },
      { path: 'companies/:slug', element: <CompanyDetailPage /> },
    ],
  },
  {
    path: 'company',
    element: (
      <RequireAuth kinds={['COMPANY_STAFF', 'PLATFORM_ADMIN']}>
        <CompanyLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <RequireCompanyRole routePath="">
            <CompanyDashboardPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'profile',
        element: (
          <RequireCompanyRole routePath="/profile">
            <CompanyProfilePage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'team',
        element: (
          <RequireCompanyRole routePath="/team">
            <CompanyTeamPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'packages',
        element: (
          <RequireCompanyRole routePath="/packages">
            <CompanyPackagesPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'clienti',
        element: (
          <RequireCompanyRole routePath="/clienti">
            <CompanyCustomersPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'cereri',
        element: (
          <RequireCompanyRole routePath="/cereri">
            <CompanyLeadsPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'lucrari',
        element: (
          <RequireCompanyRole routePath="/lucrari">
            <CompanyInterventionsPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'calendar',
        element: (
          <RequireCompanyRole routePath="/calendar">
            <CompanyCalendarPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'lucrari/:id/fisa',
        element: (
          <RequireCompanyRole routePath="/lucrari">
            <EstimateWorkSheetPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'smete',
        element: (
          <RequireCompanyRole routePath="/smete">
            <CompanyEstimatesPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'smete/new',
        element: (
          <RequireCompanyRole routePath="/smete">
            <CompanyEstimateWizardPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'smete/:id',
        element: (
          <RequireCompanyRole routePath="/smete">
            <CompanyEstimateWizardPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'oferte',
        element: (
          <RequireCompanyRole routePath="/oferte">
            <CompanyQuotesPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'servicii',
        element: (
          <RequireCompanyRole routePath="/servicii">
            <CompanyServicesPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'facturi',
        element: (
          <RequireCompanyRole routePath="/facturi">
            <CompanyInvoicesPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'recenzii',
        element: (
          <RequireCompanyRole routePath="/recenzii">
            <CompanyReviewsPage />
          </RequireCompanyRole>
        ),
      },
      {
        path: 'subscription',
        element: (
          <RequireCompanyRole routePath="/subscription">
            <CompanySubscriptionPage />
          </RequireCompanyRole>
        ),
      },
    ],
  },
  {
    path: 'portal',
    element: (
      <RequireAuth kinds={['END_CLIENT']}>
        <PortalLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PortalDashboardPage /> },
      { path: 'lucrari', element: <PortalLucrariPage /> },
      { path: 'oferte', element: <PortalOfertePage /> },
      { path: 'smete', element: <PortalSmetePage /> },
      { path: 'facturi', element: <PortalFacturiPage /> },
    ],
  },
  {
    path: 'admin',
    element: (
      <RequireAuth kinds={['PLATFORM_ADMIN']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'companies', element: <AdminCompaniesPage /> },
      { path: 'subscriptions', element: <AdminSubscriptionsPage /> },
      { path: 'waitlist', element: <AdminWaitlistPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'audit', element: <AdminAuditPage /> },
      { path: 'cities', element: <AdminCitiesPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'clients', element: <AdminClientsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
