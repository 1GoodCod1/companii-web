import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import type { InvoiceStatusSliceDto } from '@/entities/fsm/model/analytics';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { formatMdl } from '@/shared/utils/money';
import { CHART_TEXT_COLOR, INVOICE_STATUS_COLORS } from './apexTheme';

export function InvoiceStatusChart({ data }: { data: InvoiceStatusSliceDto[] }) {
  const { t } = useTranslation();

  const labels = data.map((slice) => paymentStatusLabel(slice.status, t));
  const series = data.map((slice) => slice.amount);
  const colors = data.map((slice) => INVOICE_STATUS_COLORS[slice.status]);
  const total = data.reduce((acc, slice) => acc + slice.amount, 0);

  const options: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', foreColor: CHART_TEXT_COLOR },
    labels,
    colors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '12px' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            value: { formatter: (value) => formatMdl(Number(value)) },
            total: {
              show: true,
              label: t('company.analytics.charts.invoiceStatus.total'),
              formatter: () => formatMdl(total),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (value) => formatMdl(value) } },
  };

  return <Chart options={options} series={series} type="donut" height={300} />;
}
