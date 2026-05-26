import toast from 'react-hot-toast';
import { EntityDetailPanel } from '@/components/cabinet/EntityDetailPanel';
import type { InvoicePaymentStatus } from '@/types/fsm';
import {
  useInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  downloadCompanyInvoicePdf,
} from '@/features/fsm/api/useInvoices';
import {
  getAllowedPaymentTransitions,
  getPaymentStatusHint,
} from '@/utils/fsmStatusTransitions';
import { PAYMENT_STATUS_LABELS } from '@/constants/invoices.constants';
import { getInvoicePaymentStatusStyle } from '@/utils/invoicePaymentStatusStyles';
import { formatDateRo } from '@/utils/date';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
};

export function InvoiceDetailPanel({ selectedId, onClearSelection }: Props) {
  const { data: detail, isLoading: isLoadingDetail } = useInvoiceQuery(selectedId || '');
  const updateInvoice = useUpdateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();

  const handlePaymentStatusChange = async (newStatus: InvoicePaymentStatus) => {
    if (!selectedId || !detail) return;
    if (newStatus === detail.paymentStatus) return;
    try {
      await updateInvoice.mutateAsync({ id: selectedId, paymentStatus: newStatus });
      toast.success(`Factura a fost marcată ca ${PAYMENT_STATUS_LABELS[newStatus]}!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la actualizarea facturii.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    try {
      await downloadCompanyInvoicePdf(selectedId, `${detail.number}.pdf`);
      toast.success('PDF descărcat cu succes!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la generarea PDF.');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Sigur doriți să ștergeți această factură? (Facturile plătite nu pot fi șterse)')) return;
    try {
      await deleteInvoice.mutateAsync(selectedId);
      toast.success('Factură ștearsă cu succes!');
      onClearSelection();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut șterge factura.');
    }
  };

  return (
    <EntityDetailPanel
      title="Vizualizare factură"
      selectedId={selectedId}
      isLoading={isLoadingDetail}
      hasDetail={!!detail}
      loadingMessage="Se încarcă detaliile facturii..."
      emptyMessage="Selectează o factură din listă pentru a-i vedea descrierea fiscală detaliată."
      headerAction={
        selectedId && !isLoadingDetail && detail ? (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Șterge
          </button>
        ) : undefined
      }
    >
      {detail ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{detail.number}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                  Emisă la: {formatDateRo(detail.issuedAt)}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getInvoicePaymentStatusStyle(
                  detail.paymentStatus,
                )}`}
              >
                {PAYMENT_STATUS_LABELS[detail.paymentStatus]}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Descarcă chitanța PDF
            </button>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Modifică status plată
              </h4>
              {(() => {
                const allowed = getAllowedPaymentTransitions(detail.paymentStatus);
                const hint = getPaymentStatusHint(detail.paymentStatus);
                if (allowed.length === 0) {
                  return (
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {hint || 'Nu există acțiuni disponibile pentru acest status.'}
                    </p>
                  );
                }
                return (
                  <div className="flex gap-2">
                    {[detail.paymentStatus, ...allowed]
                      .filter((st, idx, arr) => arr.indexOf(st) === idx)
                      .map((st) => {
                        const isCurrent = detail.paymentStatus === st;
                        const isAction = allowed.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => isAction && handlePaymentStatusChange(st)}
                            disabled={isCurrent || updateInvoice.isPending}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${
                              isCurrent
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs cursor-default'
                                : isAction
                                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-violet-50 hover:border-violet-200 cursor-pointer'
                                  : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[st]}
                          </button>
                        );
                      })}
                  </div>
                );
              })()}
            </div>

            <div className="text-sm border-t border-gray-100 pt-3 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  CLIENT BENEFICIAR
                </span>
                <span className="font-bold text-gray-900">
                  {detail.intervention?.customer?.fullName || 'Client pachet'}
                </span>
                <span className="text-xs text-gray-500 block font-medium">
                  {detail.intervention?.customer?.phone}
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">
                  {detail.intervention?.customer?.address}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  LUCRARE ASOCIATĂ
                </span>
                <span className="font-semibold text-xs text-gray-800">
                  {detail.intervention?.number} — {detail.intervention?.type}
                </span>
              </div>

              {detail.dueDate && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    TERMEN DE PLATĂ
                  </span>
                  <span className="font-bold text-red-500 text-xs">
                    Până la {formatDateRo(detail.dueDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
              <h4 className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                Calcul fiscal detaliat
              </h4>
              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Bază impozabilă:</span>
                  <span className="font-bold text-gray-800">
                    {Number(detail.amount).toLocaleString('ro-MD')} MDL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TVA ({detail.tvaRate}%):</span>
                  <span className="font-bold text-gray-800">
                    {Number(detail.tvaAmount).toLocaleString('ro-MD')} MDL
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-1.5">
                  <span>TOTAL DE PLATĂ:</span>
                  <span className="text-violet-700">
                    {(Number(detail.amount) + Number(detail.tvaAmount)).toLocaleString('ro-MD', {
                      style: 'currency',
                      currency: 'MDL',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
      ) : null}
    </EntityDetailPanel>
  );
}
