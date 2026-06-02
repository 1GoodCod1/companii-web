import { useTranslation } from 'react-i18next';
import { INTERVENTION_STATUS_TABS } from '@/entities/fsm/model/interventionStatus.constants';
import { interventionTabLabel } from '@/entities/fsm/model/i18nStatusLabels';
import type { InterventionStatus } from '@/entities/fsm/model/types';

type StatusFilterProps = {
  value: string;
  onChange: (value: InterventionStatus | '') => void;
};

export function InterventionsStatusFilter({ value, onChange }: StatusFilterProps) {
  const { t } = useTranslation();

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
          {interventionTabLabel(tab.value, t)}
        </button>
      ))}
    </div>
  );
}
