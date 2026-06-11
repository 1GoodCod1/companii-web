import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { EntityListDetailLayout } from '@/widgets/cabinet/EntityListDetailLayout';
import { useInvoicesQuery, downloadInvoicesCsv } from '@/features/fsm';
import { CompanyManagementGate } from '@/features/companies';
import { InvoicesListTable } from '@/features/fsm';
import { InvoiceDetailPanel } from '@/features/fsm';
import { CreateInvoiceModal } from '@/features/fsm';
import { useEntityModal } from '@/shared/hooks/useEntityModal';
import { useEntitySelection } from '@/shared/hooks/useEntitySelection';
import type { InvoicePaymentStatus } from '@/entities/fsm/model/types';

type StatusFilter = InvoicePaymentStatus | 'ALL';

export function CompanyInvoicesPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data: invoices, isLoading } = useInvoicesQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();

  const detailPanel = useMemo(
    () => <InvoiceDetailPanel selectedId={selectedId} onClearSelection={clear} />,
    [selectedId, clear],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: 'ALL', label: t('company.invoicesPage.filter.all', { defaultValue: 'Toate' }) },
      { value: 'UNPAID', label: t('company.invoicesPage.filter.unpaid', { defaultValue: 'Neplătite' }) },
      { value: 'OVERDUE', label: t('company.invoicesPage.filter.overdue', { defaultValue: 'Restante' }) },
      {
        value: 'PENDING_CONFIRMATION',
        label: t('company.invoicesPage.filter.pending', { defaultValue: 'Așteaptă confirmare' }),
      },
      { value: 'PAID', label: t('company.invoicesPage.filter.paid', { defaultValue: 'Plătite' }) },
    ],
    [t],
  );

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-end justify-between gap-3 border-b border-gray-200">
          <div className="scrollbar-none flex items-center gap-5 overflow-x-auto" role="tablist">
            {statusFilterOptions.map((option) => {
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(option.value as StatusFilter)}
                  className={cn(
                    '-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-bold transition-colors',
                    active
                      ? 'border-violet-600 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-2 pb-2">
            <button
              type="button"
              onClick={() => downloadInvoicesCsv().catch((e: Error) => toast.error(e.message))}
              className={cabinetBtnSecondary}
            >
              {t('company.invoicesPage.exportCsv')}
            </button>
            <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
              {t('company.invoicesPage.generateBtn')}
            </button>
          </div>
        </div>

        <EntityListDetailLayout
          list={
            <InvoicesListTable
              invoices={invoices}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={select}
            />
          }
          detail={detailPanel}
        />

        <CreateInvoiceModal open={createModal.open} onClose={createModal.closeModal} />
      </div>
    </CompanyManagementGate>
  );
}
