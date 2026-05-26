import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { cabinetQueryDefaults, publicPlansQueryOptions } from '@/api/queryPolicies';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { refreshAuthSession } from '@/features/auth/api/useAuth';
import type { ClaimableSubscriptionPlanCode, CompanyPlanDto, CompanySubscriptionDto, CompanySubscriptionPlanCode } from '@/types/subscriptions';

export function useSubscriptionPlansQuery(): UseQueryResult<CompanyPlanDto[], Error> {
  return useQuery<CompanyPlanDto[], Error>({
    queryKey: queryKeys.subscriptions.plans,
    queryFn: () => apiFetch<CompanyPlanDto[]>('/subscriptions/plans'),
    ...publicPlansQueryOptions,
  });
}

export function useMySubscriptionQuery(): UseQueryResult<CompanySubscriptionDto | null, Error> {
  const user = useAuthStore((s) => s.user);
  const contextCompanyId = useCompanyContextStore((s) => s.activeCompanyId);
  const activeCompanyId = contextCompanyId ?? user?.activeCompanyId;
  return useQuery<CompanySubscriptionDto | null, Error>({
    queryKey: queryKeys.subscriptions.me,
    queryFn: () => apiFetch<CompanySubscriptionDto | null>('/subscriptions/me'),
    ...cabinetQueryDefaults,
    enabled: !!activeCompanyId,
  });
}

export function useClaimFreePlanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planCode: ClaimableSubscriptionPlanCode) =>
      apiFetch<CompanySubscriptionDto>('/subscriptions/claim-free', {
        method: 'POST',
        body: JSON.stringify({ planCode }),
      }),
    onSuccess: async () => {
      await refreshAuthSession();
      void qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      void qc.invalidateQueries({ queryKey: queryKeys.companies.me });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.plans });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customers });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.invoices });
    },
  });
}

export function useAdminSetCompanyPlanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      planCode,
    }: {
      companyId: string;
      planCode: CompanySubscriptionPlanCode;
    }) =>
      apiFetch(`/subscriptions/admin/companies/${companyId}/plan/${planCode}`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.companies });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}
