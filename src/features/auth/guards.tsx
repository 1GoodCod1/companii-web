import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore, type AccountKind } from '@/stores/authStore';
import {
  canAccessCompanyRoute,
  defaultRouteForRole,
} from '@/features/companies/roleAccess';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { resolveCompanyRole } from '@/components/layout/cabinet-nav';
import {
  hasMinPlan,
  requiredPlanForRoute,
} from '@/config/planEntitlements';
import type { CompanySubscriptionPlanCode } from '@/features/subscriptions/types';
import { PlanUpgradePanel } from '@/features/subscriptions/components/PlanUpgradePanel';

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

function resolveCurrentPlanCode(
  subscriptionPlanCode: CompanySubscriptionPlanCode | undefined,
  companyMe: ReturnType<typeof useCompanyMeQuery>['data'],
  activeCompanyId: string | undefined,
): CompanySubscriptionPlanCode | undefined {
  if (subscriptionPlanCode) return subscriptionPlanCode;

  if (!activeCompanyId || !companyMe) return undefined;

  const owned = companyMe.owned?.find((item) => item.id === activeCompanyId);
  const ownedCode = owned?.subscription?.plan?.code;
  if (ownedCode === 'FREE' || ownedCode === 'PRO' || ownedCode === 'BUSINESS') {
    return ownedCode;
  }

  const membership = companyMe.memberships?.find(
    (item) => item.companyId === activeCompanyId,
  );
  const memberCode = membership?.company?.subscription?.plan?.code;
  if (memberCode === 'FREE' || memberCode === 'PRO' || memberCode === 'BUSINESS') {
    return memberCode;
  }

  return undefined;
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
  const { data: subscription, isLoading: subscriptionLoading } = useMySubscriptionQuery();
  const role = resolveCompanyRole(user?.companyRole, companyMe, activeCompanyId);

  if (!canAccessCompanyRoute(role, routePath)) {
    const fallback = defaultRouteForRole(role);
    if (location.pathname === fallback) return children;
    return <Navigate to={fallback} replace />;
  }

  const requiredPlan = requiredPlanForRoute(routePath);
  if (requiredPlan) {
    const currentPlan = resolveCurrentPlanCode(
      subscription?.plan?.code as CompanySubscriptionPlanCode | undefined,
      companyMe,
      activeCompanyId,
    );

    if (subscriptionLoading && !currentPlan) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-gray-500">
          Se verifică abonamentul...
        </div>
      );
    }

    if (!hasMinPlan(currentPlan, requiredPlan)) {
      return <PlanUpgradePanel requiredPlan={requiredPlan} />;
    }
  }

  return children;
}
