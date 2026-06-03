import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { cabinetQueryDefaults } from '@/shared/api/queryPolicies';

export interface PricingModifierDef {
  key: string;
  categorySlug: string;
  group: string;
  label: { ro: string; ru: string };
  defaultPct: number;
}

export interface PricingModifiersResponse {
  catalog: PricingModifierDef[];
  overrides: Record<string, number>;
}

export function usePricingModifiersQuery(
  companyId: string,
): UseQueryResult<PricingModifiersResponse, Error> {
  return useQuery<PricingModifiersResponse, Error>({
    queryKey: ['companies', companyId, 'pricing-modifiers'],
    queryFn: () => apiFetch<PricingModifiersResponse>(`/companies/me/pricing-modifiers`),
    ...cabinetQueryDefaults,
    enabled: !!companyId,
  });
}

export function useUpdatePricingModifiersMutation(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modifiers: Record<string, number | null>) =>
      apiFetch<PricingModifiersResponse>(`/companies/me/pricing-modifiers`, {
        method: 'PATCH',
        body: JSON.stringify({ modifiers }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companyId, 'pricing-modifiers'] });
    },
  });
}
