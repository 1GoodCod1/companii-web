import type { InterventionStatus, InterventionDto } from '@/types/fsm';
import { INTERVENTION_STATUS_LABELS, INTERVENTION_STATUS_TABS } from '@/constants/interventionStatus.constants';
import { getInterventionStatusStyle } from '@/utils/interventionStatus';
import { technicianDisplayName } from '@/utils/teamMembers';
import { EntityListPanel, entityListRowClass } from '@/components/cabinet/EntityListPanel';
import { formatDateTimeRo } from '@/utils/date';

type Props = {
  interventions: InterventionDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (item: InterventionDto) => void;
};

export function InterventionsListTable({ interventions, isLoading, selectedId, onSelect }: Props) {
  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!interventions?.length}
      loadingMessage="Se încarcă lucrările..."
      emptyMessage="Nicio lucrare găsită."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">Cod / Tip</th>
              <th className="p-4 text-xs uppercase tracking-wider">Client & Adresă</th>
              <th className="p-4 text-xs uppercase tracking-wider">Programare & Tehnician</th>
              <th className="p-4 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interventions?.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className={entityListRowClass(selectedId === item.id)}
              >
                  <td className="p-4">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{item.number}</span>
                    <div className="font-bold text-gray-800 text-sm mt-0.5">{item.type}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-bold text-gray-900">{item.customer?.fullName}</div>
                    <div className="text-gray-500 mt-0.5 max-w-xs truncate">{item.address}</div>
                  </td>
                  <td className="p-4 text-xs text-gray-700">
                    <div className="font-bold text-gray-800">
                      {item.scheduledAt
                        ? formatDateTimeRo(item.scheduledAt, 'datetimeShort')
                        : 'Neprogramată'}
                    </div>
                    <div className="text-gray-400 mt-0.5">{technicianDisplayName(item.technician)}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getInterventionStatusStyle(
                        item.status,
                      )}`}
                    >
                      {INTERVENTION_STATUS_LABELS[item.status]}
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

type StatusFilterProps = {
  value: string;
  onChange: (value: InterventionStatus | '') => void;
};

export function InterventionsStatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pb-2">
      {INTERVENTION_STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value as InterventionStatus | '')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            value === tab.value
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white/80 text-gray-500 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
