import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { PageHero, cabinetBtnPrimary, cabinetBtnSecondary } from '@/components/cabinet/cabinet-ui';
import { EntityListDetailLayout } from '@/components/cabinet/EntityListDetailLayout';
import { useInvoicesQuery, downloadInvoicesCsv } from '@/features/fsm/api/useInvoices';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { InvoicesListTable } from '@/features/fsm/components/invoices/InvoicesListTable';
import { InvoiceDetailPanel } from '@/features/fsm/components/invoices/InvoiceDetailPanel';
import { CreateInvoiceModal } from '@/features/fsm/components/invoices/CreateInvoiceModal';
import { useEntityModal } from '@/hooks/useEntityModal';
import { useEntitySelection } from '@/hooks/useEntitySelection';
import type { InvoicePaymentStatus } from '@/types/fsm';

type StatusFilter = InvoicePaymentStatus | 'ALL';

export function CompanyInvoicesPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data: invoices, isLoading } = useInvoicesQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.invoicesPage.title')}
          description={t('company.invoicesPage.description')}
          action={
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white cursor-pointer focus:border-violet-500 focus:outline-none"
              >
                <option value="ALL">
                  {t('company.invoicesPage.filter.all', { defaultValue: 'Toate' })}
                </option>
                <option value="UNPAID">
                  {t('company.invoicesPage.filter.unpaid', { defaultValue: 'Neplătite' })}
                </option>
                <option value="OVERDUE">
                  {t('company.invoicesPage.filter.overdue', { defaultValue: 'Restante' })}
                </option>
                <option value="PAID">
                  {t('company.invoicesPage.filter.paid', { defaultValue: 'Plătite' })}
                </option>
              </select>
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
          detail={<InvoiceDetailPanel selectedId={selectedId} onClearSelection={clear} />}
        />

        <CreateInvoiceModal open={createModal.open} onClose={createModal.closeModal} />
      </div>
    </CompanyManagementGate>
  );
}
