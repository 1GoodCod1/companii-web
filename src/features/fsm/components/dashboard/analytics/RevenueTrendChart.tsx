import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import type { AnalyticsPeriod, RevenueTrendPointDto } from '@/entities/fsm/model/analytics';
import { formatMdl, formatMdlCompact } from '@/shared/utils/money';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR, REVENUE_SERIES_COLORS } from './apexTheme';
import { formatBucketLabel } from './bucketLabel';

export function RevenueTrendChart({
  data,
  period,
}: {
  data: RevenueTrendPointDto[];
  period: AnalyticsPeriod;
}) {
  const { t, i18n } = useTranslation();

  const categories = data.map((point) => formatBucketLabel(point.bucketStart, period, i18n.language));
  const series = [
    {
      name: t('company.analytics.charts.revenue.invoiced'),
      data: data.map((point) => point.invoiced),
    },
    {
      name: t('company.analytics.charts.revenue.collected'),
      data: data.map((point) => point.collected),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      foreColor: CHART_TEXT_COLOR,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [REVENUE_SERIES_COLORS.invoiced, REVENUE_SERIES_COLORS.collected],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    grid: { borderColor: CHART_GRID_COLOR, strokeDashArray: 4 },
    xaxis: {
      categories,
      labels: { hideOverlappingLabels: true, style: { fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { formatter: (value) => formatMdlCompact(value) } },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
    tooltip: { y: { formatter: (value) => formatMdl(value) } },
  };

  return <Chart options={options} series={series} type="area" height={300} />;
}
