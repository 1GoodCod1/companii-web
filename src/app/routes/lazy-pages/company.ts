import { lazyWithRetry } from '@/shared/lib/lazyWithRetry';

export const CompanyDashboardPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyDashboardPage').then((m) => ({
    default: m.CompanyDashboardPage,
  })),
);

export const CompanyProfilePage = lazyWithRetry(() =>
  import('@/pages/company/CompanyProfilePage').then((m) => ({
    default: m.CompanyProfilePage,
  })),
);

export const CompanyGalleryPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyGalleryPage').then((m) => ({
    default: m.CompanyGalleryPage,
  })),
);

export const CompanyTeamPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyTeamPage').then((m) => ({
    default: m.CompanyTeamPage,
  })),
);

export const CompanyCustomersPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyCustomersPage').then((m) => ({
    default: m.CompanyCustomersPage,
  })),
);

export const CompanyLeadsPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyLeadsPage').then((m) => ({
    default: m.CompanyLeadsPage,
  })),
);

export const CompanyInterventionsPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyInterventionsPage').then((m) => ({
    default: m.CompanyInterventionsPage,
  })),
);

export const CompanyPipelinePage = lazyWithRetry(() =>
  import('@/pages/company/CompanyPipelinePage').then((m) => ({
    default: m.CompanyPipelinePage,
  })),
);

export const CompanyCalendarPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyCalendarPage').then((m) => ({
    default: m.CompanyCalendarPage,
  })),
);

export const CompanyPricingModifiersPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyPricingModifiersPage').then((m) => ({
    default: m.CompanyPricingModifiersPage,
  })),
);

export const CompanyQuotesPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyQuotesPage').then((m) => ({
    default: m.CompanyQuotesPage,
  })),
);

export const CompanyServicesPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyServicesPage').then((m) => ({
    default: m.CompanyServicesPage,
  })),
);

export const CompanyInvoicesPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyInvoicesPage').then((m) => ({
    default: m.CompanyInvoicesPage,
  })),
);

export const CompanyReviewsPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyReviewsPage').then((m) => ({
    default: m.CompanyReviewsPage,
  })),
);

export const CompanyAuditPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyAuditPage').then((m) => ({
    default: m.CompanyAuditPage,
  })),
);

export const CompanySubscriptionPage = lazyWithRetry(() =>
  import('@/pages/company/CompanySubscriptionPage').then((m) => ({
    default: m.CompanySubscriptionPage,
  })),
);

export const SettingsPage = lazyWithRetry(() =>
  import('@/features/settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
);

// ── Estimates ──

export const CompanyEstimatesPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyEstimatesPage').then((m) => ({
    default: m.CompanyEstimatesPage,
  })),
);

export const CompanyTemplatesPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyTemplatesPage').then((m) => ({
    default: m.CompanyTemplatesPage,
  })),
);

export const CompanyEstimateWizardPage = lazyWithRetry(() =>
  import('@/pages/company/CompanyEstimateWizardPage').then((m) => ({
    default: m.CompanyEstimateWizardPage,
  })),
);

export const EstimateWorkSheetPage = lazyWithRetry(() =>
  import('@/pages/company/EstimateWorkSheetPage').then((m) => ({
    default: m.EstimateWorkSheetPage,
  })),
);

export const MyWorksheetsPage = lazyWithRetry(() =>
  import('@/pages/company/MyWorksheetsPage').then((m) => ({
    default: m.MyWorksheetsPage,
  })),
);