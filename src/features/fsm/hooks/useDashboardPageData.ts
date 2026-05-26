import { useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  useCustomersQuery,
  useInterventionsQuery,
  useInvoicesQuery,
  useLeadsQuery,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { needsCompanyOnboarding } from '@/features/companies/companyHomeRoute';
import { INTERVENTION_STATUS } from '@/constants/interventionStatus.constants';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import type { InterventionDto } from '@/types/fsm';
import { KPI_ACCENTS, type DashboardKpi } from '@/utils/dashboard';
import { getErrorMessage } from '@/utils/errors';
import { isActiveInterventionStatus } from '@/utils/interventionStatus';
import { isPaidPaymentStatus } from '@/utils/invoicePaymentStatus';

export function useDashboardPageData() {
  const { isManagement, activeCompanyId } = useCompanyPermissions();
  const { data: meData } = useCompanyMeQuery();
  const { data: subData } = useMySubscriptionQuery();
  const { data: customers } = useCustomersQuery({ enabled: isManagement });
  const { data: interventions } = useInterventionsQuery();
  const { data: invoices } = useInvoicesQuery({ enabled: isManagement });
  const { data: newLeads } = useLeadsQuery(LEAD_STATUS.NEW, { enabled: isManagement });
  const convertLead = useConvertLeadMutation();

  const activeInterventions = useMemo(
    () =>
      interventions?.filter((i) => isActiveInterventionStatus(i.status)) ?? [],
    [interventions],
  );

  const totalInvoiced = useMemo(
    () => invoices?.reduce((acc, inv) => acc + Number(inv.amount), 0) ?? 0,
    [invoices],
  );

  const totalPaid = useMemo(
    () =>
      invoices
        ?.filter((inv) => isPaidPaymentStatus(inv.paymentStatus))
        .reduce((acc, inv) => acc + Number(inv.amount), 0) ?? 0,
    [invoices],
  );

  const memberships = meData?.memberships ?? [];
  const activeMembership = memberships.find((m) => m.companyId === activeCompanyId);
  const activeCompany =
    meData?.owned.find((company) => company.id === activeCompanyId) ??
    activeMembership?.company ??
    meData?.owned?.[0];

  const onboardingRequired = needsCompanyOnboarding({
    activeCompanyId,
    ownedCount: meData?.owned?.length ?? 0,
    membershipCount: memberships.length,
  });

  const activePlanName =
    subData?.plan?.name || activeCompany?.subscription?.plan?.name || 'Free';

  const kpis: DashboardKpi[] = useMemo(() => {
    if (isManagement) {
      return [
        {
          label: 'Clienți totali',
          value: String(customers?.length ?? 0),
          hint: 'Înregistrați în sistem',
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[0],
        },
        {
          label: 'Lucrări active',
          value: String(activeInterventions.length),
          hint: 'În curs de execuție',
          hintClass: 'text-amber-600',
          accent: KPI_ACCENTS[1],
        },
        {
          label: 'Total facturat',
          value: totalInvoiced.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: 'Valoare totală facturi',
          hintClass: 'text-gray-400',
          accent: KPI_ACCENTS[2],
        },
        {
          label: 'Încasări confirmate',
          value: totalPaid.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: 'Facturi plătite integral',
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-emerald-600',
        },
      ];
    }

    return [
      {
        label: 'Lucrările mele',
        value: String(interventions?.length ?? 0),
        hint: 'Total alocate',
        hintClass: 'text-violet-600',
        accent: KPI_ACCENTS[1],
      },
      {
        label: 'Lucrări active',
        value: String(activeInterventions.length),
        hint: 'De executat acum',
        hintClass: 'text-amber-600',
        accent: KPI_ACCENTS[0],
      },
      {
        label: 'Programate azi',
        value: String(
          interventions?.filter((i: InterventionDto) => {
            if (!i.scheduledAt) return false;
            const d = new Date(i.scheduledAt);
            const now = new Date();
            return (
              d.getFullYear() === now.getFullYear() &&
              d.getMonth() === now.getMonth() &&
              d.getDate() === now.getDate()
            );
          }).length ?? 0,
        ),
        hint: 'Pe calendarul de azi',
        hintClass: 'text-blue-600',
        accent: KPI_ACCENTS[2],
      },
      {
        label: 'Finalizate',
        value: String(
          interventions?.filter(
            (i) =>
              i.status === INTERVENTION_STATUS.COMPLETED ||
              i.status === INTERVENTION_STATUS.PAID,
          ).length ?? 0,
        ),
        hint: 'Lucrări închise',
        hintClass: 'text-emerald-600',
        accent: KPI_ACCENTS[3],
        valueClass: 'text-emerald-600',
      },
    ];
  }, [
    isManagement,
    customers?.length,
    activeInterventions.length,
    totalInvoiced,
    totalPaid,
    interventions,
  ]);

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(mode === 'intervention' ? 'Cerere preluată ca lucrare.' : 'Cerere convertită în smetă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut converti cererea.'));
    }
  };

  return {
    isManagement,
    onboardingRequired,
    activeCompany,
    activePlanName,
    kpis,
    newLeads,
    activeInterventions,
    invoices,
    convertPending: convertLead.isPending,
    handleConvertLead,
  };
}
