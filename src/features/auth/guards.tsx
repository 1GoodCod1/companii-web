import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, type AccountKind } from '@/entities/user/model/authStore';
import { canAccessCompanyRoute, defaultRouteForRole } from '@/entities/company/model/roleAccess';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useMySubscriptionQuery } from '@/entities/subscription/api/useSubscriptions';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import { resolveCompanyRole } from '@/widgets/layout/cabinet-nav';
import {
  hasMinPlan,
  requiredPlanForRoute,
} from '@/entities/subscription/model/planEntitlements';
import type { CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';
import { resolveSubscriptionPlanCode } from '@/entities/subscription/model/subscriptionPlan';
import { PlanUpgradePanel } from '@/features/subscriptions';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';

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
  if (kinds && (!user.accountKind || !kinds.includes(user.accountKind))) {
    return <ForbiddenPage compact />;
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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const contextCompanyId = useCompanyContextStore((s) => s.activeCompanyId);
  const activeCompanyId = contextCompanyId ?? user?.activeCompanyId;
  const { data: companyMe } = useCompanyMeQuery();
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscriptionQuery();
  const role = resolveCompanyRole(user?.companyRole, companyMe, activeCompanyId);

  if (!canAccessCompanyRoute(role, routePath)) {
    const fallback = defaultRouteForRole(role);
    if (location.pathname === fallback) return children;
    return <Navigate to={fallback} replace />;
  }

  const requiredPlan = requiredPlanForRoute(routePath);
  if (requiredPlan) {
    const currentPlan = resolveSubscriptionPlanCode(
      subscription?.plan?.code as CompanySubscriptionPlanCode | undefined,
      companyMe,
      activeCompanyId,
    );

    if (subscriptionLoading && !currentPlan) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-gray-500">
          {t('cabinet.shell.checkingSubscription')}
        </div>
      );
    }

    if (!hasMinPlan(currentPlan, requiredPlan)) {
      return <PlanUpgradePanel requiredPlan={requiredPlan} />;
    }
  }

  return children;
}
