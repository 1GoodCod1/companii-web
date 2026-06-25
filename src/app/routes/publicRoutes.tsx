import { PublicLayout } from '@/widgets/layout/PublicLayout';
import { RedirectToLocalized } from '@/shared/ui/i18n/RedirectToLocalized';
import { LocaleOutlet } from '@/shared/ui/i18n/LocaleOutlet';
import { PUBLIC_ROUTE } from '@/shared/constants/routes.constants';
import { LazyPage } from './LazyPage';
import {
  LandingPage,
  CompaniesListPage,
  CompaniesCatalogPage,
  CompanyDetailPage,
  HowItWorksPage,
  FaqPage,
  ContactsPage,
  PrivacyPage,
  TermsPage,
  SubscriptionsPage,
} from './lazy-pages';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

export const localizedPublicRoutes = [
  { index: true, element: <LazyPage><LandingPage /></LazyPage> },
  { path: PUBLIC_ROUTE.COMPANII, element: <LazyPage><LandingPage /></LazyPage> },
  { path: PUBLIC_ROUTE.HOW_IT_WORKS, element: <LazyPage><HowItWorksPage /></LazyPage> },
  { path: PUBLIC_ROUTE.FAQ, element: <LazyPage><FaqPage /></LazyPage> },
  { path: PUBLIC_ROUTE.CONTACTS, element: <LazyPage><ContactsPage /></LazyPage> },
  { path: PUBLIC_ROUTE.PRIVACY, element: <LazyPage><PrivacyPage /></LazyPage> },
  { path: PUBLIC_ROUTE.TERMS, element: <LazyPage><TermsPage /></LazyPage> },
  { path: PUBLIC_ROUTE.SUBSCRIPTIONS, element: <LazyPage><SubscriptionsPage /></LazyPage> },
  { path: PUBLIC_ROUTE.COMPANIES, element: <LazyPage><CompaniesListPage /></LazyPage> },
  { path: PUBLIC_ROUTE.COMPANY_CATALOG, element: <LazyPage><CompaniesCatalogPage /></LazyPage> },
  { path: PUBLIC_ROUTE.COMPANY_DETAIL, element: <LazyPage><CompanyDetailPage /></LazyPage> },
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
        element: <PublicLayout />,
        children: localizedPublicRoutes,
      },
    ],
  },
  ...legacyLocalizedRedirects,
];
