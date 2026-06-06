import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { useCompanyAnalyticsOverviewQuery } from '@/features/fsm/api/useAnalytics';
import { type AnalyticsPeriod } from '@/entities/fsm/model/analytics';
import { Panel, EmptyState, SkeletonCard } from '@/widgets/cabinet/cabinet-ui';
import { ChartCard } from './ChartCard';
import { PeriodSelector } from './PeriodSelector';
import { RevenueTrendChart } from './RevenueTrendChart';
import { InvoiceStatusChart } from './InvoiceStatusChart';
import { SalesPipelineChart } from './SalesPipelineChart';
import { InterventionWorkloadChart } from './InterventionWorkloadChart';

export function DashboardAnalyticsSection() {
  const { t } = useTranslation();
  const { isManagement } = useCompanyPermissions();
  const [period, setPeriod] = useState<AnalyticsPeriod>('12m');
  const { data, isLoading, isError } = useCompanyAnalyticsOverviewQuery(period, {
    enabled: isManagement,
  });

  const periodLabels: Record<AnalyticsPeriod, string> = {
    '30d': t('company.analytics.period.30d'),
    '90d': t('company.analytics.period.90d'),
    '12m': t('company.analytics.period.12m'),
  };

  const hasRevenue = (data?.revenueTrend ?? []).some((p) => p.invoiced > 0 || p.collected > 0);
  const hasInvoiceStatus = (data?.invoiceStatus ?? []).length > 0;
  const hasInterventions = (data?.interventionStatus ?? []).length > 0;
  const hasPipeline = data ? Object.values(data.pipeline).some((value) => value > 0) : false;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-gray-900">
            {t('company.analytics.title')}
          </h2>
          <p className="text-xs text-gray-500">{t('company.analytics.subtitle')}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} labels={periodLabels} />
      </div>

      {isError ? (
        <Panel>
          <EmptyState message={t('company.analytics.error')} />
        </Panel>
      ) : isLoading || !data ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} className="h-[372px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard
            className="lg:col-span-2"
            title={t('company.analytics.charts.revenue.title')}
            description={t('company.analytics.charts.revenue.subtitle')}
            isEmpty={!hasRevenue}
            emptyMessage={t('company.analytics.charts.revenue.empty')}
          >
            <RevenueTrendChart data={data.revenueTrend} period={period} />
          </ChartCard>

          <ChartCard
            title={t('company.analytics.charts.invoiceStatus.title')}
            description={t('company.analytics.charts.invoiceStatus.subtitle')}
            isEmpty={!hasInvoiceStatus}
            emptyMessage={t('company.analytics.charts.invoiceStatus.empty')}
          >
            <InvoiceStatusChart data={data.invoiceStatus} />
          </ChartCard>

          <ChartCard
            title={t('company.analytics.charts.pipeline.title')}
            description={t('company.analytics.charts.pipeline.subtitle')}
            isEmpty={!hasPipeline}
            emptyMessage={t('company.analytics.charts.pipeline.empty')}
          >
            <SalesPipelineChart data={data.pipeline} />
          </ChartCard>

          <ChartCard
            className="lg:col-span-2"
            title={t('company.analytics.charts.workload.title')}
            description={t('company.analytics.charts.workload.subtitle')}
            isEmpty={!hasInterventions}
            emptyMessage={t('company.analytics.charts.workload.empty')}
          >
            <InterventionWorkloadChart data={data.interventionStatus} />
          </ChartCard>
        </div>
      )}
    </section>
  );
}

export default DashboardAnalyticsSection;
