import { lazyWithRetry } from '@/shared/lib/lazyWithRetry';

export const AdminHomePage = lazyWithRetry(() =>
  import('@/pages/admin/AdminHomePage').then((m) => ({
    default: m.AdminHomePage,
  })),
);

export const AdminCompaniesPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminCompaniesPage').then((m) => ({
    default: m.AdminCompaniesPage,
  })),
);

export const AdminSubscriptionsPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminSubscriptionsPage').then((m) => ({
    default: m.AdminSubscriptionsPage,
  })),
);

export const AdminCitiesPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminCitiesPage').then((m) => ({
    default: m.AdminCitiesPage,
  })),
);

export const AdminCategoriesPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({
    default: m.AdminCategoriesPage,
  })),
);

export const AdminClientsPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminClientsPage').then((m) => ({
    default: m.AdminClientsPage,
  })),
);

export const AdminWaitlistPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminWaitlistPage').then((m) => ({
    default: m.AdminWaitlistPage,
  })),
);

export const AdminReviewsPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminReviewsPage').then((m) => ({
    default: m.AdminReviewsPage,
  })),
);

export const AdminAuditPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminAuditPage').then((m) => ({
    default: m.AdminAuditPage,
  })),
);

export const AdminBlueprintsPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminBlueprintsPage').then((m) => ({
    default: m.AdminBlueprintsPage,
  })),
);

export const AdminFeedbackPage = lazyWithRetry(() =>
  import('@/pages/admin/AdminFeedbackPage').then((m) => ({
    default: m.AdminFeedbackPage,
  })),
);
