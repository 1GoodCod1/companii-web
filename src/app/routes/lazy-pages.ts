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

// U-09: Code splitting for heavy company admin routes.
export const CompanyEstimatesPage = lazy(() =>
  import('@/pages/company/CompanyEstimatesPage').then((m) => ({
    default: m.CompanyEstimatesPage,
  })),
);

export const CompanyEstimateWizardPage = lazy(() =>
  import('@/pages/company/CompanyEstimateWizardPage').then((m) => ({
    default: m.CompanyEstimateWizardPage,
  })),
);

export const EstimateWorkSheetPage = lazy(() =>
  import('@/pages/company/EstimateWorkSheetPage').then((m) => ({
    default: m.EstimateWorkSheetPage,
  })),
);

export const MyWorksheetsPage = lazy(() =>
  import('@/pages/company/MyWorksheetsPage').then((m) => ({
    default: m.MyWorksheetsPage,
  })),
);
