import { useTranslation } from 'react-i18next';
import type { CompanyLeadStatus } from '@/types/fsm';
import { LEAD_STATUS_FILTERS } from '@/constants/leads.constants';
import { leadFilterLabel } from '@/utils/i18nStatusLabels';

export function LeadsStatusFilter({
  value,
  onChange,
}: {
  value: CompanyLeadStatus | undefined;
  onChange: (value: CompanyLeadStatus | undefined) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {LEAD_STATUS_FILTERS.map((filter) => (
        <button
          key={filter.value ?? 'all'}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
            value === filter.value
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-200'
          }`}
        >
          {leadFilterLabel(filter.value, t)}
        </button>
      ))}
    </div>
  );
}
