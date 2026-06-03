import { lazyWithRetry } from '@/shared/lib/lazyWithRetry';

export const PortalDashboardPage = lazyWithRetry(() =>
  import('@/pages/portal/PortalDashboardPage').then((m) => ({
    default: m.PortalDashboardPage,
  })),
);

export const PortalCereriPage = lazyWithRetry(() =>
  import('@/pages/portal/PortalCereriPage').then((m) => ({
    default: m.PortalCereriPage,
  })),
);

export const PortalLucrariPage = lazyWithRetry(() =>
  import('@/pages/portal/PortalLucrariPage').then((m) => ({
    default: m.PortalLucrariPage,
  })),
);

export const PortalOfertePage = lazyWithRetry(() =>
  import('@/pages/portal/PortalOfertePage').then((m) => ({
    default: m.PortalOfertePage,
  })),
);

export const PortalSmetePage = lazyWithRetry(() =>
  import('@/pages/portal/PortalSmetePage').then((m) => ({
    default: m.PortalSmetePage,
  })),
);

export const PortalFacturiPage = lazyWithRetry(() =>
  import('@/pages/portal/PortalFacturiPage').then((m) => ({
    default: m.PortalFacturiPage,
  })),
);