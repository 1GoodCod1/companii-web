import { useTranslation } from 'react-i18next';
import type { CustomerDto } from '@/types/fsm';
import { EntityListPanel, entityListRowClass } from '@/components/cabinet/EntityListPanel';

type Props = {
  customers: CustomerDto[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (customer: CustomerDto) => void;
  onEdit: (customer: CustomerDto) => void;
  onDelete: (id: string) => void;
};

export function CustomersListTable({
  customers,
  isLoading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={customers.length === 0}
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
              <th className="p-4 text-xs uppercase tracking-wider text-right">
                {t('company.fsm.customers.list.columns.actions')}
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
                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-2 hover:bg-violet-50 rounded-xl text-gray-500 hover:text-violet-600 transition-colors cursor-pointer text-xs"
                      title={t('cabinet.common.edit')}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-600 transition-colors cursor-pointer text-xs"
                      title={t('cabinet.common.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntityListPanel>
  );
}
