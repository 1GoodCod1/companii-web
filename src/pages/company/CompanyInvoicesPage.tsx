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

export function CompanyInvoicesPage() {
  const { data: invoices, isLoading } = useInvoicesQuery();
  const createModal = useEntityModal();
  const { selectedId, select, clear } = useEntitySelection();

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title="Facturi FSM"
          description="Gestionează fluxul financiar, plățile, TVA-ul și facturarea comenzilor finalizate."
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadInvoicesCsv().catch((e: Error) => toast.error(e.message))}
                className={cabinetBtnSecondary}
              >
                Export CSV
              </button>
              <button type="button" onClick={createModal.openCreate} className={cabinetBtnPrimary}>
                + Generează factură
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
