import type { InterventionDto } from '@/entities/fsm/model/types';
import { getInterventionStatusStyle } from '@/entities/fsm/model/interventionStatus';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { technicianDisplayName } from '@/entities/company/model/teamMembers';
import { EntityListPanel } from '@/widgets/cabinet/EntityListPanel';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/shared/hooks/useLocale';
import { interventionListRowClass } from './interventionPanelUi';

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
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--dashboard-divider)] text-gray-400">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                {t('company.fsm.interventions.list.colCodeType')}
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                {t('company.fsm.interventions.list.colClientAddress')}
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                {t('company.fsm.interventions.list.colScheduleTechnician')}
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em]">
                {t('company.fsm.interventions.list.colStatus')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dashboard-divider)]">
            {interventions?.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className={interventionListRowClass(selectedId === item.id)}
              >
                <td className="px-5 py-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {item.number}
                  </span>
                  <div className="mt-0.5 text-sm font-bold text-gray-900">{item.type}</div>
                </td>
                <td className="px-5 py-4 text-xs">
                  <div className="font-semibold text-gray-900">{item.customer?.fullName}</div>
                  <div className="mt-0.5 max-w-xs truncate text-gray-500">{item.address}</div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-700">
                  <div className="font-semibold text-gray-900">
                    {item.scheduledAt
                      ? formatDateTimeLocalized(item.scheduledAt, locale, 'datetimeShort')
                      : t('company.fsm.interventions.list.unscheduled')}
                  </div>
                  <div className="mt-0.5 text-gray-400">{technicianDisplayName(item.technician)}</div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getInterventionStatusStyle(
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
