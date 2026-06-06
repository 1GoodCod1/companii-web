import { AdminLayout } from '@/widgets/layout/AdminLayout';
import { RequireAuth } from '@/features/auth';
import { LazyPage } from './LazyPage';
import {
  AdminHomePage,
  AdminCompaniesPage,
  AdminSubscriptionsPage,
  AdminCitiesPage,
  AdminCategoriesPage,
  AdminClientsPage,
  AdminWaitlistPage,
  AdminReviewsPage,
  AdminAuditPage,
  AdminBlueprintsPage,
  AdminFeedbackPage,
} from './lazy-pages';
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
    { index: true, element: <LazyPage><AdminHomePage /></LazyPage> },
    { path: ADMIN_ROUTE.COMPANIES, element: <LazyPage><AdminCompaniesPage /></LazyPage> },
    { path: ADMIN_ROUTE.SUBSCRIPTIONS, element: <LazyPage><AdminSubscriptionsPage /></LazyPage> },
    { path: ADMIN_ROUTE.WAITLIST, element: <LazyPage><AdminWaitlistPage /></LazyPage> },
    { path: ADMIN_ROUTE.REVIEWS, element: <LazyPage><AdminReviewsPage /></LazyPage> },
    { path: ADMIN_ROUTE.AUDIT, element: <LazyPage><AdminAuditPage /></LazyPage> },
    { path: ADMIN_ROUTE.CITIES, element: <LazyPage><AdminCitiesPage /></LazyPage> },
    { path: ADMIN_ROUTE.CATEGORIES, element: <LazyPage><AdminCategoriesPage /></LazyPage> },
    { path: ADMIN_ROUTE.CLIENTS, element: <LazyPage><AdminClientsPage /></LazyPage> },
    { path: ADMIN_ROUTE.BLUEPRINTS, element: <LazyPage><AdminBlueprintsPage /></LazyPage> },
    { path: ADMIN_ROUTE.FEEDBACK, element: <LazyPage><AdminFeedbackPage /></LazyPage> },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
