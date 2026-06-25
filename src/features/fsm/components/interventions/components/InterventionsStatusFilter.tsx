import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { INTERVENTION_STATUS_TABS } from '@/entities/fsm/model/interventionStatus.constants';
import { interventionTabLabel } from '@/entities/fsm/model/i18nStatusLabels';
import type { InterventionStatus } from '@/entities/fsm/model/types';

type StatusFilterProps = {
  value: string;
  onChange: (value: InterventionStatus | '') => void;
  action?: ReactNode;
};

export function InterventionsStatusFilter({ value, onChange, action }: StatusFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-end justify-between gap-3 border-b border-[var(--dashboard-divider)]">
      <div className="scrollbar-none flex items-center gap-6 overflow-x-auto" role="tablist">
        {INTERVENTION_STATUS_TABS.map((tab) => {
          const active = value === tab.value;
          return (
            <button
              type="button"
              key={tab.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value as InterventionStatus | '')}
              className={cn(
                '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-3 text-sm font-bold transition-colors',
                active
                  ? 'border-[var(--dashboard-accent)] text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              {interventionTabLabel(tab.value, t)}
            </button>
          );
        })}
      </div>
      {action ? <div className="shrink-0 pb-2">{action}</div> : null}
    </div>
  );
}
