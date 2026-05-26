import type { QuoteDto } from '@/types/fsm';
import { getQuoteStatusStyle } from '@/utils/quoteStatusStyles';
import { EntityListPanel, entityListRowClass } from '@/components/cabinet/EntityListPanel';
import { formatDateRo } from '@/utils/date';

type Props = {
  quotes: QuoteDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function QuotesListTable({ quotes, isLoading, selectedId, onSelect }: Props) {
  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!quotes?.length}
      loadingMessage="Se încarcă ofertele..."
      emptyMessage="Nicio ofertă creată în sistem."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">Număr / Dată</th>
              <th className="p-4 text-xs uppercase tracking-wider">Client</th>
              <th className="p-4 text-xs uppercase tracking-wider">Total</th>
              <th className="p-4 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotes?.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={entityListRowClass(selectedId === item.id)}
              >
                <td className="p-4">
                  <span className="font-bold text-gray-800">{item.number}</span>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                    {formatDateRo(item.createdAt)}
                  </div>
                </td>
                <td className="p-4 text-xs font-bold text-gray-900">{item.customer?.fullName}</td>
                <td className="p-4 font-black text-gray-950">
                  {Number(item.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getQuoteStatusStyle(
                      item.status,
                    )}`}
                  >
                    {item.status}
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
