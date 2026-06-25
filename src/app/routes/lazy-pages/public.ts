import { lazyWithRetry } from '@/shared/lib/lazyWithRetry';

export const LandingPage = lazyWithRetry(() =>
  import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })),
);

export const CompaniesListPage = lazyWithRetry(() =>
  import('@/pages/public/CompaniesListPage').then((m) => ({
    default: m.CompaniesListPage,
  })),
);

export const CompanyDetailPage = lazyWithRetry(() =>
  import('@/pages/public/CompanyDetailPage').then((m) => ({
    default: m.CompanyDetailPage,
  })),
);

export const CompaniesCatalogPage = lazyWithRetry(() =>
  import('@/pages/public/CompaniesCatalogPage').then((m) => ({
    default: m.CompaniesCatalogPage,
  })),
);

export const HowItWorksPage = lazyWithRetry(() =>
  import('@/pages/public/HowItWorksPage').then((m) => ({
    default: m.HowItWorksPage,
  })),
);

export const FaqPage = lazyWithRetry(() =>
  import('@/pages/public/FaqPage').then((m) => ({ default: m.FaqPage })),
);

export const ContactsPage = lazyWithRetry(() =>
  import('@/pages/public/ContactsPage').then((m) => ({
    default: m.ContactsPage,
  })),
);

export const PrivacyPage = lazyWithRetry(() =>
  import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);

export const TermsPage = lazyWithRetry(() =>
  import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })),
);

export const SubscriptionsPage = lazyWithRetry(() =>
  import('@/pages/public/SubscriptionsPage').then((m) => ({
    default: m.SubscriptionsPage,
  })),
);