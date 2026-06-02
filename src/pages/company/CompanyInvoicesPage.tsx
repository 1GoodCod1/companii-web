import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppSelect, PageHero, cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
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
        <PageHero
          title={t('company.invoicesPage.title')}
          description={t('company.invoicesPage.description')}
          action={
            <div className="flex flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadInvoicesCsv().catch((e: Error) => toast.error(e.message))}
                className={cabinetBtnSecondary}
              >
                {t('company.invoicesPage.exportCsv')}
              </button>
              <AppSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={statusFilterOptions}
                aria-label={t('company.invoicesPage.filter.all', { defaultValue: 'Toate' })}
                className="w-[118px] shrink-0 [&>button]:px-2.5 [&>button]:py-1.5 [&>button]:text-xs"
                maxVisibleItems={6}
                menuPortal
              />
              <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
                {t('company.invoicesPage.generateBtn')}
              </button>
            </div>
          }
        />

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
