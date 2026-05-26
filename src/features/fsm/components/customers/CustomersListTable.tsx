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
  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={customers.length === 0}
      loadingMessage="Se încarcă clienții..."
      emptyMessage="Niciun client găsit."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">Nume complet</th>
              <th className="p-4 text-xs uppercase tracking-wider">Telefon & Email</th>
              <th className="p-4 text-xs uppercase tracking-wider">Adresă</th>
              <th className="p-4 text-xs uppercase tracking-wider text-right">Acțiuni</th>
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
                      title="Editează"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-600 transition-colors cursor-pointer text-xs"
                      title="Șterge"
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
