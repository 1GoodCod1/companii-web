import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import { EntityDetailPanel } from '@/widgets/cabinet/EntityDetailPanel';
import {
  QUOTE_STATUS,
  getAllowedQuoteTransitions,
} from '@/entities/fsm/model/quoteStatus.constants';
import { quoteTvaAmount } from '@/entities/fsm/model/quoteTotals';
import type { QuoteLineDto, QuoteStatus } from '@/entities/fsm/model/types';
import {
  useQuoteQuery,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
  useConvertQuoteMutation,
  useSendQuoteMutation,
  downloadCompanyQuotePdf,
} from '@/features/fsm/api/useQuotes';
import { useLocale } from '@/shared/hooks/useLocale';
import { getQuoteStatusStyle } from '@/entities/fsm/model/quoteStatusStyles';
import { formatDateLocalized } from '@/shared/utils/date';
import { quoteStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
};

export function QuoteDetailPanel({ selectedId, onClearSelection }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: detail, isLoading: isLoadingDetail } = useQuoteQuery(selectedId || '');

  const updateQuote = useUpdateQuoteMutation();
  const deleteQuote = useDeleteQuoteMutation();
  const convertQuote = useConvertQuoteMutation();
  const sendQuote = useSendQuoteMutation();
  const { ask, dialog } = useCabinetConfirmDialog();

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!selectedId) return;
    try {
      await updateQuote.mutateAsync({ id: selectedId, status: newStatus });
      toast.success(
        t('company.fsm.quotes.detail.toast.statusChanged', {
          status: quoteStatusLabel(newStatus, t),
        }),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.quotes.detail.toast.statusError')));
    }
  };

  const handleSend = async () => {
    if (!selectedId) return;
    try {
      await sendQuote.mutateAsync(selectedId);
      toast.success(t('company.fsm.quotes.detail.toast.sent'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.quotes.detail.toast.sendError')));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    setDownloadingPdf(true);
    try {
      await downloadCompanyQuotePdf(selectedId, `${detail.number}.pdf`);
      toast.success(t('company.fsm.quotes.detail.toast.pdfDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.quotes.detail.toast.pdfError')));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedId) return;
    try {
      await convertQuote.mutateAsync(selectedId);
      toast.success(t('company.fsm.quotes.detail.toast.converted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.quotes.detail.toast.convertError')));
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    ask({
      title: t('cabinet.common.delete'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.fsm.quotes.detail.confirm.delete')}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteQuote.mutateAsync(selectedId);
          toast.success(t('company.fsm.quotes.detail.toast.deleted'));
          onClearSelection();
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.fsm.quotes.detail.toast.deleteError')));
        }
      },
    });
  };

  return (
    <>
    <EntityDetailPanel
      title={t('company.fsm.quotes.detail.title')}
      selectedId={selectedId}
      isLoading={isLoadingDetail}
      hasDetail={!!detail}
      loadingMessage={t('company.fsm.quotes.detail.loading')}
      emptyMessage={t('company.fsm.quotes.detail.empty')}
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
      {detail ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{detail.number}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                  {t('company.fsm.quotes.detail.issuedAt')}{' '}
                  {formatDateLocalized(detail.createdAt, locale)}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getQuoteStatusStyle(
                  detail.status,
                )}`}
              >
                {quoteStatusLabel(detail.status, t)}
              </span>
            </div>

            <div className="text-sm border-t border-gray-100 pt-3 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  {t('company.fsm.quotes.detail.fields.customer')}
                </span>
                <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
                <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
                <span className="text-xs text-gray-400 block mt-0.5">{detail.customer?.address}</span>
              </div>
              {detail.validUntil && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    {t('company.fsm.quotes.detail.fields.validity')}
                  </span>
                  <span className="font-bold text-red-500 text-xs">
                    {t('company.fsm.common.until')}{' '}
                    {formatDateLocalized(detail.validUntil, locale)}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('company.fsm.quotes.detail.statusSection.title')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {(getAllowedQuoteTransitions(detail.status).filter(
                  (st) => st !== QUOTE_STATUS.SENT,
                ) as QuoteStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                  >
                    {quoteStatusLabel(st, t)}
                  </button>
                ))}
              </div>

              {detail.status === QUOTE_STATUS.DRAFT ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendQuote.isPending}
                  className={`${cabinetBtnPrimary} w-full`}
                >
                  {sendQuote.isPending
                    ? t('company.fsm.quotes.detail.statusSection.sending')
                    : t('company.fsm.quotes.detail.statusSection.send')}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className={`${cabinetBtnSecondary} w-full`}
              >
                {downloadingPdf
                  ? t('company.fsm.quotes.detail.statusSection.generatingPdf')
                  : t('company.fsm.quotes.detail.statusSection.downloadPdf')}
              </button>

              {detail.status === QUOTE_STATUS.ACCEPTED && (
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {t('company.fsm.quotes.detail.convertToIntervention')}
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('company.fsm.quotes.detail.lines.title')}
              </h4>
              <div className="divide-y divide-gray-100 text-xs font-semibold">
                {detail.lines?.map((line: QuoteLineDto) => (
                  <div key={line.id} className="py-2.5 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{line.description}</p>
                      <span className="text-gray-400 text-[10px] font-bold block uppercase mt-0.5">
                        {t('company.fsm.quotes.detail.lines.qtyUnit', {
                          qty: line.qty,
                          price: Number(line.unitPrice).toLocaleString('ro-MD'),
                        })}
                      </span>
                    </div>
                    <span className="font-black text-gray-900">
                      {(line.qty * Number(line.unitPrice)).toLocaleString('ro-MD')} MDL
                    </span>
                  </div>
                ))}
              </div>
              {(() => {
                const tva = quoteTvaAmount(detail.lines);
                const net = Number(detail.total);
                return (
                  <div className="border-t border-gray-100 pt-3.5 space-y-1.5 text-sm font-bold bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
                    {tva > 0 && (
                      <>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{t('company.fsm.quotes.detail.lines.subtotal', { defaultValue: 'Subtotal (fără TVA)' })}</span>
                          <span>{net.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{t('company.fsm.quotes.detail.lines.tva', { defaultValue: 'TVA' })}</span>
                          <span>{tva.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs uppercase tracking-wider font-bold">
                        {t('company.fsm.quotes.detail.lines.total')}
                      </span>
                      <span className="text-violet-700 font-black text-lg">
                        {(net + tva).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
      ) : null}
    </EntityDetailPanel>
    {dialog}
    </>
  );
}
