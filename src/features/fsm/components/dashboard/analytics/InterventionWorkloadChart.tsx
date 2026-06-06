import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import type { InterventionStatusSliceDto } from '@/entities/fsm/model/analytics';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR, INTERVENTION_STATUS_COLORS } from './apexTheme';

export function InterventionWorkloadChart({ data }: { data: InterventionStatusSliceDto[] }) {
  const { t } = useTranslation();

  const labels = data.map((slice) => interventionStatusLabel(slice.status, t));
  const colors = data.map((slice) => INTERVENTION_STATUS_COLORS[slice.status]);
  const series = [
    { name: t('company.analytics.charts.workload.series'), data: data.map((slice) => slice.count) },
  ];

  const options: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'inherit', foreColor: CHART_TEXT_COLOR, toolbar: { show: false } },
    colors,
    plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: '55%' } },
    dataLabels: { enabled: true, style: { fontSize: '12px' } },
    grid: { borderColor: CHART_GRID_COLOR, strokeDashArray: 4 },
    xaxis: {
      categories: labels,
      labels: { style: { fontSize: '11px' }, rotate: -45, trim: true, hideOverlappingLabels: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (value) => String(Math.round(value)) } },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => String(value) } },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
}
