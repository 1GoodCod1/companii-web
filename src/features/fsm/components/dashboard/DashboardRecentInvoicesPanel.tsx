import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Panel, PanelHeader, EmptyState } from '@/widgets/cabinet/cabinet-ui';
import type { InvoiceDto } from '@/entities/fsm/model/types';
import { paymentStatusBadgeClass as paymentStatusClass } from '@/entities/fsm/model/invoicePaymentStatus';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

export function DashboardRecentInvoicesPanel({ invoices }: { invoices: InvoiceDto[] | undefined }) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Panel className="h-full">
      <PanelHeader
        title={t('company.dashboard.panels.recentInvoices.title')}
        action={
          <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            {t('company.dashboard.panels.recentInvoices.viewAll')}
          </Link>
        }
      />

      {!invoices?.length ? (
        <EmptyState
          message={t('company.dashboard.panels.recentInvoices.empty')}
          action={
            <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              {t('company.dashboard.panels.recentInvoices.generateInvoice')}
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {invoices.slice(0, 5).map((inv) => (
            <div
              key={inv.id}
              className="flex justify-between items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 transition-colors hover:bg-violet-50/40"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{inv.number}</span>
                <h3 className="font-bold text-gray-800 text-sm mt-0.5">
                  {Number(inv.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {inv.intervention?.customer?.fullName ||
                    t('company.dashboard.panels.recentInvoices.packageClient')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusClass(inv.paymentStatus)}`}
                >
                  {paymentStatusLabel(inv.paymentStatus, t)}
                </span>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {inv.dueDate
                    ? t('company.dashboard.panels.recentInvoices.dueLabel', {
                        date: formatDateLocalized(inv.dueDate, locale),
                      })
                    : t('company.dashboard.panels.recentInvoices.dueImmediate')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
