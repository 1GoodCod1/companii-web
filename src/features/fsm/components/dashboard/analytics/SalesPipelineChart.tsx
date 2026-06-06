import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import type { SalesPipelineDto } from '@/entities/fsm/model/analytics';
import { CHART_TEXT_COLOR, PIPELINE_COLORS } from './apexTheme';

export function SalesPipelineChart({ data }: { data: SalesPipelineDto }) {
  const { t } = useTranslation();

  const stages = [
    { label: t('company.analytics.charts.pipeline.leads'), value: data.leads },
    { label: t('company.analytics.charts.pipeline.quotes'), value: data.quotes },
    { label: t('company.analytics.charts.pipeline.accepted'), value: data.accepted },
    { label: t('company.analytics.charts.pipeline.completed'), value: data.completed },
    { label: t('company.analytics.charts.pipeline.paid'), value: data.paid },
  ];

  const series = [
    { name: t('company.analytics.charts.pipeline.series'), data: stages.map((stage) => stage.value) },
  ];

  const options: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'inherit', foreColor: CHART_TEXT_COLOR, toolbar: { show: false } },
    colors: PIPELINE_COLORS,
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 4,
        barHeight: '74%',
        isFunnel: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value, opts) => {
        const stage = stages[opts?.dataPointIndex ?? 0];
        return stage ? `${stage.label}: ${value}` : String(value);
      },
      style: { fontSize: '12px', colors: ['#ffffff'] },
      dropShadow: { enabled: false },
    },
    xaxis: { categories: stages.map((stage) => stage.label) },
    yaxis: { labels: { show: false } },
    legend: { show: false },
    grid: { show: false },
    tooltip: { y: { formatter: (value) => String(value) } },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
}
