import { useTranslation } from 'react-i18next';
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
    <div className="flex flex-wrap gap-1.5 pb-2">
      {LEAD_STATUS_FILTERS.map((filter) => (
        <button
          key={filter.value ?? 'all'}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            value === filter.value
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white/80 text-gray-500 hover:bg-slate-100'
          }`}
        >
          {leadFilterLabel(filter.value, t)}
        </button>
      ))}
    </div>
  );
}
