import { PortalLayout } from '@/widgets/layout/PortalLayout';
import { RequireAuth } from '@/features/auth';
import { PortalCereriPage } from '@/pages/portal/PortalCereriPage';
import { PortalDashboardPage } from '@/pages/portal/PortalDashboardPage';
import { PortalLucrariPage } from '@/pages/portal/PortalLucrariPage';
import { PortalOfertePage } from '@/pages/portal/PortalOfertePage';
import { PortalFacturiPage } from '@/pages/portal/PortalFacturiPage';
import { PortalSmetePage } from '@/pages/portal/PortalSmetePage';
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
    { index: true, element: <PortalDashboardPage /> },
    { path: PORTAL_ROUTE.CERERI, element: <PortalCereriPage /> },
    { path: PORTAL_ROUTE.LUCRARI, element: <PortalLucrariPage /> },
    { path: PORTAL_ROUTE.OFERTE, element: <PortalOfertePage /> },
    { path: PORTAL_ROUTE.SMETE, element: <PortalSmetePage /> },
    { path: PORTAL_ROUTE.FACTURI, element: <PortalFacturiPage /> },
    { path: '*', element: <NotFoundPage compact /> },
  ],
};
