import type { InvoiceDto } from '@/types/fsm';
import { getInvoicePaymentStatusStyle } from '@/utils/invoicePaymentStatusStyles';
import { EntityListPanel, entityListRowClass } from '@/components/cabinet/EntityListPanel';
import { formatDateRo } from '@/utils/date';

type Props = {
  invoices: InvoiceDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function InvoicesListTable({ invoices, isLoading, selectedId, onSelect }: Props) {
  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!invoices?.length}
      loadingMessage="Se încarcă facturile..."
      emptyMessage="Nicio factură emisă în sistem."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">Factură Nr / Emisă</th>
              <th className="p-4 text-xs uppercase tracking-wider">Beneficiar / Lucrare</th>
              <th className="p-4 text-xs uppercase tracking-wider">Suma totală</th>
              <th className="p-4 text-xs uppercase tracking-wider">Status</th>
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
                    {formatDateRo(item.issuedAt)}
                  </div>
                </td>
                <td className="p-4 text-xs font-semibold text-gray-900">
                  <div>{item.intervention?.customer?.fullName || 'Client pachet'}</div>
                  <div className="text-gray-400 font-normal mt-0.5">Lucrare: {item.intervention?.number}</div>
                </td>
                <td className="p-4 font-black text-gray-950">
                  {Number(item.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getInvoicePaymentStatusStyle(
                      item.paymentStatus,
                    )}`}
                  >
                    {item.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntityListPanel>
  );
}
