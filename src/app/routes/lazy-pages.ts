import { lazy } from 'react';
export const LandingPage = lazy(() =>
  import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })),
);

export const CompaniesListPage = lazy(() =>
  import('@/pages/public/CompaniesListPage').then((m) => ({
    default: m.CompaniesListPage,
  })),
);

export const CompanyDetailPage = lazy(() =>
  import('@/pages/public/CompanyDetailPage').then((m) => ({
    default: m.CompanyDetailPage,
  })),
);
