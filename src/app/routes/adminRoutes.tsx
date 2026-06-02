import { AdminLayout } from '@/widgets/layout/AdminLayout';
import { RequireAuth } from '@/features/auth';
import { AdminHomePage } from '@/pages/admin/AdminHomePage';
import { AdminCompaniesPage } from '@/pages/admin/AdminCompaniesPage';
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage';
import { AdminCitiesPage } from '@/pages/admin/AdminCitiesPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminClientsPage } from '@/pages/admin/AdminClientsPage';
import { AdminWaitlistPage } from '@/pages/admin/AdminWaitlistPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminBlueprintsPage } from '@/pages/admin/AdminBlueprintsPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { ROUTE_ROOT, ROUTE_ACCESS, ADMIN_ROUTE } from '@/shared/constants/routes.constants';

export const adminRoutesSection = {
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
    { path: ADMIN_ROUTE.BLUEPRINTS, element: <AdminBlueprintsPage /> },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
