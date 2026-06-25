import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { CompanyLeadStatus } from '@/entities/fsm/model/types';
import { LEAD_STATUS_FILTERS } from '@/entities/fsm/model/leads.constants';
import { leadFilterLabel } from '@/entities/fsm/model/i18nStatusLabels';

export function LeadsStatusFilter({
  value,
  onChange,
}: {
  value: CompanyLeadStatus | undefined;
  onChange: (value: CompanyLeadStatus | undefined) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="scrollbar-none flex items-center gap-6 overflow-x-auto border-b border-[var(--dashboard-divider)]"
      role="tablist"
    >
      {LEAD_STATUS_FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value ?? 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.value)}
            className={cn(
              '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-3 text-sm font-bold transition-colors',
              active
                ? 'border-[var(--dashboard-accent)] text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600',
            )}
          >
            {leadFilterLabel(filter.value, t)}
          </button>
        );
      })}
    </div>
  );
}
