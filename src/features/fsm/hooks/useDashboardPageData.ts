import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCustomersCountQuery,
  useInterventionsQuery,
  useInvoicesQuery,
  useLeadsQuery,
  useConvertLeadMutation,
} from '@/features/fsm/api/useFsm';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useMySubscriptionQuery } from '@/entities/subscription/api/useSubscriptions';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { needsCompanyOnboarding } from '@/features/companies/companyHomeRoute';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import type { InterventionDto } from '@/entities/fsm/model/types';
import { KPI_ACCENTS, type DashboardKpi } from '@/entities/fsm/model/dashboard.constants';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatMdl } from '@/shared/utils/money';
import { isActiveInterventionStatus } from '@/entities/fsm/model/interventionStatus';
import { isPaidPaymentStatus } from '@/entities/fsm/model/invoicePaymentStatus';

export function useDashboardPageData() {
  const { t } = useTranslation();
  const { isManagement, activeCompanyId } = useCompanyPermissions();
  const { data: meData } = useCompanyMeQuery();
  const { data: subData } = useMySubscriptionQuery();
  const { data: customersTotal } = useCustomersCountQuery({ enabled: isManagement });
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
          label: t('company.dashboard.kpi.totalCustomers.label'),
          value: String(customersTotal ?? 0),
          hint: t('company.dashboard.kpi.totalCustomers.hint'),
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[0],
        },
        {
          label: t('company.dashboard.kpi.activeInterventions.label'),
          value: String(activeInterventions.length),
          hint: t('company.dashboard.kpi.activeInterventions.hint'),
          hintClass: 'text-amber-600',
          accent: KPI_ACCENTS[1],
        },
        {
          label: t('company.dashboard.kpi.totalInvoiced.label'),
          value: formatMdl(totalInvoiced),
          hint: t('company.dashboard.kpi.totalInvoiced.hint'),
          hintClass: 'text-gray-400',
          accent: KPI_ACCENTS[2],
        },
        {
          label: t('company.dashboard.kpi.confirmedPayments.label'),
          value: formatMdl(totalPaid),
          hint: t('company.dashboard.kpi.confirmedPayments.hint'),
          hintClass: 'text-emerald-600',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-emerald-600',
        },
      ];
    }

    return [
      {
        label: t('company.dashboard.kpi.myJobs.label'),
        value: String(interventions?.length ?? 0),
        hint: t('company.dashboard.kpi.myJobs.hint'),
        hintClass: 'text-violet-600',
        accent: KPI_ACCENTS[1],
      },
      {
        label: t('company.dashboard.kpi.activeJobs.label'),
        value: String(activeInterventions.length),
        hint: t('company.dashboard.kpi.activeJobs.hint'),
        hintClass: 'text-amber-600',
        accent: KPI_ACCENTS[0],
      },
      {
        label: t('company.dashboard.kpi.scheduledToday.label'),
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
        hint: t('company.dashboard.kpi.scheduledToday.hint'),
        hintClass: 'text-blue-600',
        accent: KPI_ACCENTS[2],
      },
      {
        label: t('company.dashboard.kpi.completed.label'),
        value: String(
          interventions?.filter(
            (i) =>
              i.status === INTERVENTION_STATUS.COMPLETED ||
              i.status === INTERVENTION_STATUS.PAID,
          ).length ?? 0,
        ),
        hint: t('company.dashboard.kpi.completed.hint'),
        hintClass: 'text-emerald-600',
        accent: KPI_ACCENTS[3],
        valueClass: 'text-emerald-600',
      },
    ];
  },
    [
      isManagement,
      customersTotal,
      activeInterventions.length,
      totalInvoiced,
      totalPaid,
      interventions,
      t,
    ]);

  const handleConvertLead = async (leadId: string, mode: 'intervention' | 'estimate') => {
    try {
      await convertLead.mutateAsync({ id: leadId, mode });
      toast.success(
        mode === 'intervention'
          ? t('company.dashboard.toasts.leadConvertedIntervention')
          : t('company.dashboard.toasts.leadConvertedEstimate'),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.dashboard.toasts.convertLeadFailed')));
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
