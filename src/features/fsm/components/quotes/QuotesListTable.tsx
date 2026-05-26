import { useTranslation } from 'react-i18next';
import type { QuoteDto } from '@/types/fsm';
import { getQuoteStatusStyle } from '@/utils/quoteStatusStyles';
import { EntityListPanel, entityListRowClass } from '@/components/cabinet/EntityListPanel';
import { formatDateLocalized } from '@/utils/date';
import { useLocale } from '@/hooks/useLocale';
import { quoteStatusLabel } from '@/utils/i18nStatusLabels';

type Props = {
  quotes: QuoteDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function QuotesListTable({ quotes, isLoading, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!quotes?.length}
      loadingMessage={t('company.fsm.quotes.list.loading')}
      emptyMessage={t('company.fsm.quotes.list.empty')}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.quotes.list.columns.numberDate')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.quotes.list.columns.customer')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.quotes.list.columns.total')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.quotes.list.columns.status')}
              </th>
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
                    {formatDateLocalized(item.createdAt, locale)}
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
                    {quoteStatusLabel(item.status, t)}
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
