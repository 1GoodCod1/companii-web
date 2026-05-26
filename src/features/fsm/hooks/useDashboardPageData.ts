import { useMemo } from 'react';
import toast from 'react-hot-toast';
import i18n from '@/i18n';
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
          label: i18n.t('company.dashboard.kpi.totalCustomers.label'),
          value: String(customers?.length ?? 0),
          hint: i18n.t('company.dashboard.kpi.totalCustomers.hint'),
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[0],
        },
        {
          label: i18n.t('company.dashboard.kpi.activeInterventions.label'),
          value: String(activeInterventions.length),
          hint: i18n.t('company.dashboard.kpi.activeInterventions.hint'),
          hintClass: 'text-amber-600',
          accent: KPI_ACCENTS[1],
        },
        {
          label: i18n.t('company.dashboard.kpi.totalInvoiced.label'),
          value: totalInvoiced.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: i18n.t('company.dashboard.kpi.totalInvoiced.hint'),
          hintClass: 'text-gray-400',
          accent: KPI_ACCENTS[2],
        },
        {
          label: i18n.t('company.dashboard.kpi.confirmedPayments.label'),
          value: totalPaid.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
          hint: i18n.t('company.dashboard.kpi.confirmedPayments.hint'),
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-emerald-600',
        },
      ];
    }

    return [
      {
        label: i18n.t('company.dashboard.kpi.myJobs.label'),
        value: String(interventions?.length ?? 0),
        hint: i18n.t('company.dashboard.kpi.myJobs.hint'),
        hintClass: 'text-violet-600',
        accent: KPI_ACCENTS[1],
      },
      {
        label: i18n.t('company.dashboard.kpi.activeJobs.label'),
        value: String(activeInterventions.length),
        hint: i18n.t('company.dashboard.kpi.activeJobs.hint'),
        hintClass: 'text-amber-600',
        accent: KPI_ACCENTS[0],
      },
      {
        label: i18n.t('company.dashboard.kpi.scheduledToday.label'),
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
        hint: i18n.t('company.dashboard.kpi.scheduledToday.hint'),
        hintClass: 'text-blue-600',
        accent: KPI_ACCENTS[2],
      },
      {
        label: i18n.t('company.dashboard.kpi.completed.label'),
        value: String(
          interventions?.filter(
            (i) =>
              i.status === INTERVENTION_STATUS.COMPLETED ||
              i.status === INTERVENTION_STATUS.PAID,
          ).length ?? 0,
        ),
        hint: i18n.t('company.dashboard.kpi.completed.hint'),
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
    i18n.language,
  ]);

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(
        mode === 'intervention'
          ? i18n.t('company.dashboard.toasts.leadConvertedIntervention')
          : i18n.t('company.dashboard.toasts.leadConvertedEstimate'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, i18n.t('company.dashboard.toasts.convertLeadFailed')));
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
