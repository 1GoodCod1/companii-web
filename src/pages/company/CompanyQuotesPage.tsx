import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cabinetBtnPrimary } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { EntityListDetailLayout } from '@/widgets/cabinet/EntityListDetailLayout';
import { QUOTE_STATUS_CODES } from '@/entities/fsm/model/quoteStatus.constants';
import { quoteStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { useQuotesQuery } from '@/features/fsm';
import { CompanyManagementGate } from '@/features/companies';
import { QuotesListTable } from '@/features/fsm';
import { QuoteDetailPanel } from '@/features/fsm';
import { CreateQuoteModal } from '@/features/fsm';
import { useEntityModal } from '@/shared/hooks/useEntityModal';
import { useEntitySelection } from '@/shared/hooks/useEntitySelection';

export function CompanyQuotesPage() {
  const { t } = useTranslation();
  const { data: quotes, isLoading } = useQuotesQuery();
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredQuotes = useMemo(
    () => quotes?.filter((q) => !statusFilter || q.status === statusFilter),
    [quotes, statusFilter],
  );

  const detailPanel = useMemo(
    () => <QuoteDetailPanel selectedId={selectedId} onClearSelection={clear} />,
    [selectedId, clear],
  );

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-end justify-between gap-3 border-b border-gray-200">
          <div className="scrollbar-none flex items-center gap-5 overflow-x-auto" role="tablist">
            {['', ...QUOTE_STATUS_CODES].map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-bold transition-colors',
                    active
                      ? 'border-violet-600 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600',
                  )}
                >
                  {status ? quoteStatusLabel(status, t) : t('company.quotesPage.filterAll')}
                </button>
              );
            })}
          </div>
          <div className="shrink-0 pb-2">
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              {t('company.quotesPage.createBtn')}
            </button>
          </div>
        </div>

        <EntityListDetailLayout
          list={
            <QuotesListTable
              quotes={filteredQuotes}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={select}
            />
          }
          detail={detailPanel}
        />

        <CreateQuoteModal open={createModal.open} onClose={createModal.closeModal} />
      </div>
    </CompanyManagementGate>
  );
}
