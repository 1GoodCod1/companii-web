import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, PaperPlaneTiltIcon, ReceiptIcon } from '@phosphor-icons/react';
import { Panel, PanelHeader, EmptyState } from '@/widgets/cabinet/cabinet-ui';
import type { InvoiceDto, InvoicePaymentStatus } from '@/entities/fsm/model/types';
import { isPaidPaymentStatus } from '@/entities/fsm/model/invoicePaymentStatus';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import {
  dashboardPanelHeaderClass,
  dashboardPanelListClass,
  dashboardPanelRowClass,
  dashboardPanelShellClass,
} from './dashboardPanelList';

function InvoiceStatusBadge({ status }: { status: InvoicePaymentStatus }) {
  const { t } = useTranslation();
  const paid = isPaidPaymentStatus(status);

  return (
    <span
      className={
        paid
          ? 'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-success)]'
          : 'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-accent)]'
      }
    >
      {paid ? <CheckCircleIcon className="size-3.5" weight="fill" /> : <PaperPlaneTiltIcon className="size-3.5" />}
      {paymentStatusLabel(status, t)}
    </span>
  );
}

function InvoiceRowSkeleton() {
  return (
    <div className={`flex items-center justify-between gap-4 ${dashboardPanelRowClass}`}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 size-8 shrink-0 rounded bg-gray-100" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-gray-100" />
          <div className="h-3.5 w-20 rounded bg-gray-200" />
          <div className="h-2.5 w-24 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-3 w-16 shrink-0 rounded bg-gray-100" />
    </div>
  );
}

export function DashboardRecentInvoicesPanel({
  invoices,
  isLoading = false,
}: {
  invoices: InvoiceDto[] | undefined;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Panel className={dashboardPanelShellClass}>
      <div className={dashboardPanelHeaderClass}>
        <PanelHeader
          className="mb-0"
          title={t('company.dashboard.panels.recentInvoices.title')}
          action={
            <Link
              to="/company/facturi"
              className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
            >
              {t('company.dashboard.panels.recentInvoices.viewAll')}
            </Link>
          }
        />
      </div>

      {isLoading && !invoices?.length ? (
        <div className={`animate-pulse ${dashboardPanelListClass}`}>
          {Array.from({ length: 4 }).map((_, index) => (
            <InvoiceRowSkeleton key={index} />
          ))}
        </div>
      ) : !invoices?.length ? (
        <div className={dashboardPanelRowClass}>
          <EmptyState
            message={t('company.dashboard.panels.recentInvoices.empty')}
            action={
              <Link
                to="/company/facturi"
                className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
              >
                {t('company.dashboard.panels.recentInvoices.generateInvoice')}
              </Link>
            }
          />
        </div>
      ) : (
        <div className={dashboardPanelListClass}>
          {invoices.slice(0, 5).map((inv) => (
            <div
              key={inv.id}
              className={`flex items-center justify-between gap-4 ${dashboardPanelRowClass}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-gray-100 text-gray-400">
                  <ReceiptIcon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    {inv.number}
                  </p>
                  <p className="mt-0.5 text-sm font-black text-gray-900">
                    {Number(inv.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {inv.intervention?.customer?.fullName ||
                      t('company.dashboard.panels.recentInvoices.packageClient')}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <InvoiceStatusBadge status={inv.paymentStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
