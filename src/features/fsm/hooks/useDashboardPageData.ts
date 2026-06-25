import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCustomersQuery,
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
import {
  buildCustomerKpiSeries,
  buildInterventionKpiSeries,
  buildInvoicedKpiSeries,
  buildPaidKpiSeries,
  formatMdlKpiAmount,
} from '@/entities/fsm/model/dashboardKpiSeries';
import { getErrorMessage } from '@/shared/utils/errors';
import { isActiveInterventionStatus } from '@/entities/fsm/model/interventionStatus';
import { isPaidPaymentStatus } from '@/entities/fsm/model/invoicePaymentStatus';

export function useDashboardPageData() {
  const { t } = useTranslation();
  const { isManagement, activeCompanyId } = useCompanyPermissions();
  const { data: meData } = useCompanyMeQuery();
  const { data: subData } = useMySubscriptionQuery();
  const { data: customers, isLoading: customersLoading } = useCustomersQuery({
    enabled: isManagement,
  });
  const { data: customersTotal } = useCustomersCountQuery({ enabled: isManagement });
  const { data: interventions, isLoading: interventionsLoading } = useInterventionsQuery();
  const { data: invoices, isLoading: invoicesLoading } = useInvoicesQuery({ enabled: isManagement });
  const { data: newLeads, isLoading: leadsLoading } = useLeadsQuery(LEAD_STATUS.NEW, {
    enabled: isManagement,
  });
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
      const customerSeries = buildCustomerKpiSeries(customers);
      const interventionSeries = buildInterventionKpiSeries(interventions);
      const invoicedSeries = buildInvoicedKpiSeries(invoices);
      const paidSeries = buildPaidKpiSeries(invoices);
      const collectionRate =
        totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : null;

      return [
        {
          label: t('company.dashboard.kpi.totalCustomers.label'),
          value: String(customers?.length ?? customersTotal ?? 0),
          hint: t('company.dashboard.kpi.totalCustomers.hint'),
          hintClass: 'text-gray-500',
          accent: KPI_ACCENTS[0],
          trend: customerSeries.trend,
          sparklinePoints: customerSeries.sparklinePoints,
          cardStyle: 'accent-left',
        },
        {
          label: t('company.dashboard.kpi.activeInterventions.label'),
          value: String(activeInterventions.length),
          hint: t('company.dashboard.kpi.activeInterventions.hint'),
          hintClass: 'text-gray-500',
          accent: KPI_ACCENTS[1],
          trend: interventionSeries.trend,
          sparklinePoints: interventionSeries.sparklinePoints,
          cardStyle: 'default',
        },
        {
          label: t('company.dashboard.kpi.totalInvoiced.label'),
          value: formatMdlKpiAmount(totalInvoiced),
          valueSuffix: 'MDL',
          hint: t('company.dashboard.kpi.totalInvoiced.hint'),
          hintClass: 'text-gray-500',
          accent: KPI_ACCENTS[2],
          trend: invoicedSeries.trend,
          sparklinePoints: invoicedSeries.sparklinePoints,
          showSparklineDot: true,
          cardStyle: 'default',
        },
        {
          label: t('company.dashboard.kpi.confirmedPayments.label'),
          value: formatMdlKpiAmount(totalPaid),
          valueSuffix: 'MDL',
          hint:
            collectionRate != null
              ? t('company.dashboard.kpi.confirmedPayments.hintRate', { rate: collectionRate })
              : t('company.dashboard.kpi.confirmedPayments.hint'),
          hintClass: 'text-[var(--dashboard-success)]',
          accent: KPI_ACCENTS[3],
          valueClass: 'text-[var(--dashboard-success)]',
          trend: paidSeries.trend,
          sparklinePoints: paidSeries.sparklinePoints,
          sparklineVariant: 'success',
          cardStyle: 'accent-top',
          iconVariant: 'accent',
        },
      ];
    }

    const interventionSeries = buildInterventionKpiSeries(interventions);

    return [
      {
        label: t('company.dashboard.kpi.myJobs.label'),
        value: String(interventions?.length ?? 0),
        hint: t('company.dashboard.kpi.myJobs.hint'),
        hintClass: 'text-violet-600',
        accent: KPI_ACCENTS[1],
        sparklinePoints: interventionSeries.sparklinePoints,
        trend: interventionSeries.trend,
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
      customers,
      customersTotal,
      activeInterventions.length,
      totalInvoiced,
      totalPaid,
      interventions,
      invoices,
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

  const kpisLoading = isManagement
    ? customersLoading || interventionsLoading || invoicesLoading
    : interventionsLoading;

  return {
    isManagement,
    onboardingRequired,
    activeCompany,
    activePlanName,
    kpis,
    kpisLoading,
    newLeads,
    leadsLoading,
    activeInterventions,
    interventionsLoading,
    invoices,
    invoicesLoading,
    totalInvoiced,
    totalPaid,
    convertPending: convertLead.isPending,
    handleConvertLead,
  };
}
