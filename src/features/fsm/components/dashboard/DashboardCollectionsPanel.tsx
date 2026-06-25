import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel, PanelHeader } from '@/widgets/cabinet/cabinet-ui';
import { useLocale } from '@/shared/hooks/useLocale';
import { formatMdl } from '@/shared/utils/money';
import type { InvoiceDto } from '@/entities/fsm/model/types';
import { isPaidPaymentStatus } from '@/entities/fsm/model/invoicePaymentStatus';
import { dashboardPanelHeaderClass, dashboardPanelShellClass } from './dashboardPanelList';

type MonthBucket = {
  key: string;
  label: string;
  amount: number;
  isCurrent: boolean;
};

function buildMonthlyCollections(invoices: InvoiceDto[] | undefined, locale: string): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.push({
      key,
      label: date.toLocaleDateString(locale, { month: 'short' }).replace('.', ''),
      amount: 0,
      isCurrent: offset === 0,
    });
  }

  for (const invoice of invoices ?? []) {
    if (!isPaidPaymentStatus(invoice.paymentStatus)) continue;
    const paidAt = invoice.paymentProofConfirmedAt ?? invoice.issuedAt;
    const date = new Date(paidAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) bucket.amount += Number(invoice.amount);
  }

  return buckets;
}

export function DashboardCollectionsPanel({
  totalPaid,
  totalInvoiced,
  invoices,
}: {
  totalPaid: number;
  totalInvoiced: number;
  invoices: InvoiceDto[] | undefined;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeTag = locale === 'ru' ? 'ru-RU' : 'ro-RO';

  const collectionRate =
    totalInvoiced > 0 ? Math.min(100, Math.round((totalPaid / totalInvoiced) * 100)) : 0;

  const months = useMemo(
    () => buildMonthlyCollections(invoices, localeTag),
    [invoices, localeTag],
  );
  const maxAmount = Math.max(...months.map((month) => month.amount), 1);

  return (
    <Panel className={dashboardPanelShellClass}>
      <div className={dashboardPanelHeaderClass}>
        <PanelHeader className="mb-0" title={t('company.dashboard.panels.collections.title')} />
      </div>
      <div className="px-5 py-5 sm:px-6">
      <p className="text-2xl font-black tracking-tight text-gray-900">{formatMdl(totalPaid)}</p>
      <p className="mt-1 text-xs text-gray-500">
        {t('company.dashboard.panels.collections.subtitle')}
      </p>

      <div className="mt-4 space-y-2">
        <div className="h-2 w-full overflow-hidden bg-[var(--dashboard-accent-light)]">
          <div
            className="h-full bg-[var(--dashboard-accent)] transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-[var(--dashboard-accent)]">
          {t('company.dashboard.panels.collections.rateLabel', { rate: collectionRate })}
        </p>
      </div>

      <div className="mt-5 flex h-16 items-end justify-between gap-2">
        {months.map((month) => {
          const heightPx = month.amount > 0 ? Math.max(10, Math.round((month.amount / maxAmount) * 52)) : 10;
          return (
            <div key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className="w-full max-w-[28px] transition-all"
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: month.isCurrent
                    ? 'var(--dashboard-accent)'
                    : 'var(--dashboard-accent-light)',
                }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {month.label}
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </Panel>
  );
}
