import { useTranslation } from 'react-i18next';
import { EntityDetailPanel } from '@/components/cabinet/EntityDetailPanel';
import { useInvoiceDetail } from './hooks/useInvoiceDetail';
import { InvoiceDetailView } from './components/InvoiceDetailView';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
};

export function InvoiceDetailPanel({ selectedId, onClearSelection }: Props) {
  const { t } = useTranslation();
  const hookData = useInvoiceDetail({ selectedId, onClearSelection });
  const { detail, isLoadingDetail, handleDelete, confirmDialog } = hookData;

  return (
    <>
    <EntityDetailPanel
      title={t('company.fsm.invoices.detail.title')}
      selectedId={selectedId}
      isLoading={isLoadingDetail}
      hasDetail={!!detail}
      loadingMessage={t('company.fsm.invoices.detail.loading')}
      emptyMessage={t('company.fsm.invoices.detail.empty')}
      headerAction={
        selectedId && !isLoadingDetail && detail ? (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            {t('cabinet.common.delete')}
          </button>
        ) : undefined
      }
    >
      {detail ? <InvoiceDetailView hookData={hookData} /> : null}
    </EntityDetailPanel>
    {confirmDialog}
    </>
  );
}
