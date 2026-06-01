import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RedirectToLocalized } from '@/components/i18n/RedirectToLocalized';
import { LocaleOutlet } from '@/components/i18n/LocaleOutlet';
import { PUBLIC_ROUTE } from '@/constants/routes.constants';
import { getInitialLanguage } from '@/i18n';
import { localizePath } from '@/lib/i18n/localeRoutes';
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
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

function RedirectLegacySubscriptionsPath() {
  const { locale } = useParams<{ locale: string }>();
  return <Navigate to={`/${locale ?? 'ro'}/${PUBLIC_ROUTE.SUBSCRIPTIONS}`} replace />;
}

export const localizedPublicRoutes = [
  { index: true, element: <LandingPage /> },
  { path: PUBLIC_ROUTE.COMPANII, element: <LandingPage /> },
  { path: PUBLIC_ROUTE.HOW_IT_WORKS, element: <HowItWorksPage /> },
  { path: PUBLIC_ROUTE.FAQ, element: <FaqPage /> },
  { path: PUBLIC_ROUTE.CONTACTS, element: <ContactsPage /> },
  { path: PUBLIC_ROUTE.PRIVACY, element: <PrivacyPage /> },
  { path: PUBLIC_ROUTE.TERMS, element: <TermsPage /> },
  { path: 'subscriptions', element: <RedirectLegacySubscriptionsPath /> },
  { path: PUBLIC_ROUTE.SUBSCRIPTIONS, element: <SubscriptionsPage /> },
  { path: PUBLIC_ROUTE.COMPANIES, element: <CompaniesListPage /> },
  { path: PUBLIC_ROUTE.COMPANY_DETAIL, element: <CompanyDetailPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export const legacyLocalizedRedirects = [
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

export const publicRoutesSection = [
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
    path: 'subscriptions',
    element: (
      <Navigate to={localizePath(`/${PUBLIC_ROUTE.SUBSCRIPTIONS}`, getInitialLanguage())} replace />
    ),
  },
  {
    path: 'subscriptions/*',
    element: (
      <Navigate to={localizePath(`/${PUBLIC_ROUTE.SUBSCRIPTIONS}`, getInitialLanguage())} replace />
    ),
  },
];
