import { PortalLayout } from '@/widgets/layout/PortalLayout';
import { RequireAuth } from '@/features/auth';
import { LazyPage } from './LazyPage';
import {
  PortalCereriPage,
  PortalDashboardPage,
  PortalLucrariPage,
  PortalOfertePage,
  PortalFacturiPage,
  PortalSmetePage,
  PortalNotificationsPage,
} from './lazy-pages';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { ROUTE_ROOT, ROUTE_ACCESS, PORTAL_ROUTE } from '@/shared/constants/routes.constants';

export const portalRoutesSection = {
  path: ROUTE_ROOT.PORTAL,
  element: (
    <RequireAuth kinds={[...ROUTE_ACCESS.END_CLIENT]}>
      <PortalLayout />
    </RequireAuth>
  ),
  children: [
    { index: true, element: <LazyPage><PortalDashboardPage /></LazyPage> },
    { path: PORTAL_ROUTE.CERERI, element: <LazyPage><PortalCereriPage /></LazyPage> },
    { path: PORTAL_ROUTE.LUCRARI, element: <LazyPage><PortalLucrariPage /></LazyPage> },
    { path: PORTAL_ROUTE.OFERTE, element: <LazyPage><PortalOfertePage /></LazyPage> },
    { path: PORTAL_ROUTE.SMETE, element: <LazyPage><PortalSmetePage /></LazyPage> },
    { path: PORTAL_ROUTE.FACTURI, element: <LazyPage><PortalFacturiPage /></LazyPage> },
    { path: PORTAL_ROUTE.NOTIFICATIONS, element: <LazyPage><PortalNotificationsPage /></LazyPage> },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
