import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { EntityDetailPanel } from '@/components/cabinet/EntityDetailPanel';
import { QUOTE_STATUS } from '@/constants/quoteStatus.constants';
import type { QuoteLineDto, QuoteStatus } from '@/types/fsm';
import {
  useQuoteQuery,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
  useConvertQuoteMutation,
  useSendQuoteMutation,
  downloadCompanyQuotePdf,
} from '@/features/fsm/api/useQuotes';
import { getQuoteStatusStyle } from '@/utils/quoteStatusStyles';
import { formatDateRo } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
};

export function QuoteDetailPanel({ selectedId, onClearSelection }: Props) {
  const { data: detail, isLoading: isLoadingDetail } = useQuoteQuery(selectedId || '');

  const updateQuote = useUpdateQuoteMutation();
  const deleteQuote = useDeleteQuoteMutation();
  const convertQuote = useConvertQuoteMutation();
  const sendQuote = useSendQuoteMutation();

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!selectedId) return;
    try {
      await updateQuote.mutateAsync({ id: selectedId, status: newStatus });
      toast.success(`Status ofertă schimbat în ${newStatus}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la actualizarea statusului.');
    }
  };

  const handleSend = async () => {
    if (!selectedId) return;
    try {
      await sendQuote.mutateAsync(selectedId);
      toast.success('Oferta a fost trimisă clientului.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la trimiterea ofertei.'));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    setDownloadingPdf(true);
    try {
      await downloadCompanyQuotePdf(selectedId, `${detail.number}.pdf`);
      toast.success('PDF descărcat.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la descărcarea PDF.'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedId) return;
    try {
      await convertQuote.mutateAsync(selectedId);
      toast.success('Oferta a fost convertită cu succes într-o comandă de lucru (Intervenție)!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la convertirea ofertei.');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Sigur doriți să ștergeți această ofertă comercială?')) return;
    try {
      await deleteQuote.mutateAsync(selectedId);
      toast.success('Ofertă ștearsă cu succes!');
      onClearSelection();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la ștergerea ofertei.');
    }
  };

  return (
    <EntityDetailPanel
      title="Vizualizare deviz"
      selectedId={selectedId}
      isLoading={isLoadingDetail}
      hasDetail={!!detail}
      loadingMessage="Se încarcă detaliile devizului..."
      emptyMessage="Selectează o ofertă din listă pentru a-i inspecta devizul detaliat."
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
                  Emis la: {formatDateRo(detail.createdAt)}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getQuoteStatusStyle(
                  detail.status,
                )}`}
              >
                {detail.status}
              </span>
            </div>

            <div className="text-sm border-t border-gray-100 pt-3 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  CLIENT BENEFICIAR
                </span>
                <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
                <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
                <span className="text-xs text-gray-400 block mt-0.5">{detail.customer?.address}</span>
              </div>
              {detail.validUntil && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    VALABILITATE OFERTĂ
                  </span>
                  <span className="font-bold text-red-500 text-xs">
                    Până la {formatDateRo(detail.validUntil)}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Actualizează stadiul ofertei
              </h4>
              <div className="flex flex-wrap gap-2">
                {([QUOTE_STATUS.DRAFT, QUOTE_STATUS.ACCEPTED, QUOTE_STATUS.REJECTED] as QuoteStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                      detail.status === st
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {detail.status !== QUOTE_STATUS.SENT && detail.status !== QUOTE_STATUS.CONVERTED ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendQuote.isPending}
                  className={`${cabinetBtnPrimary} w-full`}
                >
                  {sendQuote.isPending ? 'Se trimite...' : 'Trimite clientului'}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className={`${cabinetBtnSecondary} w-full`}
              >
                {downloadingPdf ? 'Se generează...' : 'PDF'}
              </button>

              {detail.status === QUOTE_STATUS.ACCEPTED && (
                <button
                  onClick={handleConvert}
                  className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  🚀 Convertește în Lucrare (FSM)
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Articole / Materiale / Manoperă
              </h4>
              <div className="divide-y divide-gray-100 text-xs font-semibold">
                {detail.lines?.map((line: QuoteLineDto) => (
                  <div key={line.id} className="py-2.5 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{line.description}</p>
                      <span className="text-gray-400 text-[10px] font-bold block uppercase mt-0.5">
                        {line.qty} buc x {Number(line.unitPrice).toLocaleString('ro-MD')} MDL
                      </span>
                    </div>
                    <span className="font-black text-gray-900">
                      {(line.qty * Number(line.unitPrice)).toLocaleString('ro-MD')} MDL
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-sm font-bold bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
                <span className="text-gray-600 text-xs uppercase tracking-wider font-bold">TOTAL Deviz</span>
                <span className="text-violet-700 font-black text-lg">
                  {Number(detail.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </span>
              </div>
            </div>
          </div>
      ) : null}
    </EntityDetailPanel>
  );
}
