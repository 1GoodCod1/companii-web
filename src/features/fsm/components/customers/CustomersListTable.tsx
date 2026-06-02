import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CustomerDto } from '@/entities/fsm/model/types';
import { EntityListPanel } from '@/widgets/cabinet/EntityListPanel';
import { cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import { entityListRowClass } from '@/widgets/cabinet/rowStyles';

export const CUSTOMERS_LIST_PAGE_SIZE = 20;

type Props = {
  customers: CustomerDto[];
  isLoading: boolean;
  isEmpty: boolean;
  selectedId: string | null;
  onSelect: (customer: CustomerDto) => void;
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function CustomersListTable({
  customers,
  isLoading,
  isEmpty,
  selectedId,
  onSelect,
  page,
  totalCount,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  const pageCount = Math.max(1, Math.ceil(totalCount / CUSTOMERS_LIST_PAGE_SIZE));
  const from = totalCount === 0 ? 0 : (page - 1) * CUSTOMERS_LIST_PAGE_SIZE + 1;
  const to = Math.min(page * CUSTOMERS_LIST_PAGE_SIZE, totalCount);

  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={isEmpty}
      loadingMessage={t('company.fsm.customers.list.loading')}
      emptyMessage={t('company.fsm.customers.list.empty')}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.customers.list.columns.fullName')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.customers.list.columns.contact')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.customers.list.columns.address')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className={entityListRowClass(selectedId === c.id)}
              >
                <td className="p-4">
                  <div className="font-bold text-gray-900">{c.fullName}</div>
                </td>
                <td className="p-4 text-xs">
                  <div className="text-gray-900 font-bold">{c.phone}</div>
                  {c.email && <div className="text-gray-400 mt-0.5">{c.email}</div>}
                </td>
                <td className="p-4 text-xs text-gray-500 max-w-xs truncate">{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalCount > CUSTOMERS_LIST_PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            {t('company.customersPage.paginationRange', { from, to, total: totalCount })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40`}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('company.customersPage.paginationPrev')}
            </button>
            <span className="text-xs font-medium text-gray-500 tabular-nums">
              {page} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pageCount}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40`}
            >
              {t('company.customersPage.paginationNext')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </EntityListPanel>
  );
}
