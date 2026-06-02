import { useTranslation } from 'react-i18next';
import type { InvoiceDto } from '@/entities/fsm/model/types';
import { getInvoicePaymentStatusStyle } from '@/entities/fsm/model/invoicePaymentStatusStyles';
import { EntityListPanel } from '@/widgets/cabinet/EntityListPanel';
import { entityListRowClass } from '@/widgets/cabinet/rowStyles';
import { formatDateLocalized, daysSince } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';

type Props = {
  invoices: InvoiceDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function InvoicesListTable({ invoices, isLoading, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!invoices?.length}
      loadingMessage={t('company.fsm.invoices.list.loading')}
      emptyMessage={t('company.fsm.invoices.list.empty')}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.invoices.list.columns.numberIssued')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.invoices.list.columns.beneficiaryWork')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.invoices.list.columns.total')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.invoices.list.columns.status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={entityListRowClass(selectedId === item.id)}
              >
                <td className="p-4">
                  <span className="font-bold text-gray-800">{item.number}</span>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                    {formatDateLocalized(item.issuedAt, locale)}
                  </div>
                </td>
                <td className="p-4 text-xs font-semibold text-gray-900">
                  <div>
                    {item.intervention?.customer?.fullName || t('company.fsm.invoices.list.packageCustomer')}
                  </div>
                  <div className="text-gray-400 font-normal mt-0.5">
                    {t('company.fsm.invoices.list.workPrefix')} {item.intervention?.number}
                  </div>
                </td>
                <td className="p-4 font-black text-gray-950">
                  {Number(item.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getInvoicePaymentStatusStyle(
                      item.paymentStatus,
                    )} ${item.paymentStatus === 'OVERDUE' || item.paymentStatus === 'PENDING_CONFIRMATION' ? 'animate-pulse' : ''}`}
                  >
                    {paymentStatusLabel(item.paymentStatus, t)}
                  </span>
                  {item.paymentStatus === 'OVERDUE' && (() => {
                    const days = daysSince(item.dueDate);
                    if (days == null || days <= 0) return null;
                    return (
                      <div className="text-[9px] font-bold text-rose-600 mt-1">
                        {t('company.fsm.invoices.list.overdueDays', {
                          count: days,
                          defaultValue: 'Restantă {{count}} zile',
                        })}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntityListPanel>
  );
}
