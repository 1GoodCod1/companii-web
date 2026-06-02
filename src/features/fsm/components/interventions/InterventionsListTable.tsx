import type { InterventionDto } from '@/entities/fsm/model/types';
import { getInterventionStatusStyle } from '@/entities/fsm/model/interventionStatus';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { technicianDisplayName } from '@/entities/company/model/teamMembers';
import { EntityListPanel } from '@/widgets/cabinet/EntityListPanel';
import { entityListRowClass } from '@/widgets/cabinet/rowStyles';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/shared/hooks/useLocale';

type Props = {
  interventions: InterventionDto[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (item: InterventionDto) => void;
};

export function InterventionsListTable({ interventions, isLoading, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <EntityListPanel
      isLoading={isLoading}
      isEmpty={!interventions?.length}
      loadingMessage={t('company.fsm.interventions.list.loading')}
      emptyMessage={t('company.fsm.interventions.list.empty')}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold">
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.interventions.list.colCodeType')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.interventions.list.colClientAddress')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.interventions.list.colScheduleTechnician')}
              </th>
              <th className="p-4 text-xs uppercase tracking-wider">
                {t('company.fsm.interventions.list.colStatus')}
              </th>
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
                      ? formatDateTimeLocalized(item.scheduledAt, locale, 'datetimeShort')
                      : t('company.fsm.interventions.list.unscheduled')}
                  </div>
                  <div className="text-gray-400 mt-0.5">{technicianDisplayName(item.technician)}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getInterventionStatusStyle(
                      item.status,
                    )}`}
                  >
                    {interventionStatusLabel(item.status, t)}
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
