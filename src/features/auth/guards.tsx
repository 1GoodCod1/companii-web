import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore, type AccountKind } from '@/stores/authStore';
import {
  canAccessCompanyRoute,
  defaultRouteForRole,
} from '@/features/companies/roleAccess';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { resolveCompanyRole } from '@/components/layout/cabinet-nav';

export function RequireAuth({
  children,
  kinds,
}: {
  children: ReactNode;
  kinds?: AccountKind[];
}) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!user || !accessToken) return <Navigate to="/login" replace />;
  if (kinds && !kinds.includes(user.accountKind)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function RequireCompanyRole({
  children,
  routePath,
}: {
  children: ReactNode;
  routePath: string;
}) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const contextCompanyId = useCompanyContextStore((s) => s.activeCompanyId);
  const activeCompanyId = contextCompanyId ?? user?.activeCompanyId;
  const { data: companyMe } = useCompanyMeQuery();
  const role = resolveCompanyRole(user?.companyRole, companyMe, activeCompanyId);

  if (!canAccessCompanyRoute(role, routePath)) {
    const fallback = defaultRouteForRole(role);
    if (location.pathname === fallback) return children;
    return <Navigate to={fallback} replace />;
  }

  return children;
}
