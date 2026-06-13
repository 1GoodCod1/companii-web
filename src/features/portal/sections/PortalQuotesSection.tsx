import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import { useUpdatePortalQuoteMutation } from '@/features/portal/api/usePortal';
import {
  QUOTE_STATUS,
  type PortalQuoteActionStatus,
} from '@/entities/fsm/model/quoteStatus.constants';
import { quoteStatusTone } from '@/entities/fsm/model/portalStatus';
import { quoteTvaAmount } from '@/entities/fsm/model/quoteTotals';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { getErrorMessage } from '@/shared/utils/errors';
import { quoteStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { downloadPortalQuotePdf } from '@/features/fsm';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

export function PortalQuotesSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const updateQuote = useUpdatePortalQuoteMutation();
  const { ask, dialog } = useCabinetConfirmDialog();
  const { quotes } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (quoteId: string, number: string) => {
    setDownloadingId(quoteId);
    try {
      await downloadPortalQuotePdf(quoteId, `${number}.pdf`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.quotesSection.toastError')));
    } finally {
      setDownloadingId(null);
    }
  };

  const quotesMeta = useMemo(
    () => (
      <span className="text-xs text-gray-400">
        {t('portal.quotesSection.meta', { count: quotes.length })}
      </span>
    ),
    [quotes.length, t],
  );

  const handleQuoteStatus = (quoteId: string, status: PortalQuoteActionStatus) => {
    const confirmKey =
      status === QUOTE_STATUS.ACCEPTED
        ? 'portal.quotesSection.confirmAccept'
        : 'portal.quotesSection.confirmReject';
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      variant: status === QUOTE_STATUS.ACCEPTED ? 'primary' : 'danger',
      message: t(confirmKey),
      onConfirm: async () => {
        try {
          await updateQuote.mutateAsync({ id: quoteId, status });
          toast.success(
            status === QUOTE_STATUS.ACCEPTED
              ? t('portal.quotesSection.toastAccepted')
              : t('portal.quotesSection.toastRejected'),
          );
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('portal.quotesSection.toastError')));
        }
      },
    });
  };

  return (
    <Panel>
      <PanelHeader
        title={t('portal.quotesSection.title')}
        description={t('portal.quotesSection.description')}
        meta={quotesMeta}
      />
      {quotes.length === 0 ? (
        <EmptyState message={t('portal.quotesSection.empty')} />
      ) : (
        <ul className="space-y-3">
          {quotes.map((item) => {
            const tva = quoteTvaAmount(item.lines);
            return (
            <li
              key={item.id}
              className="rounded-2xl bg-white/60 p-4 hover:bg-violet-50/30 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.number}
                  </span>
                  {item.company?.name ? (
                    <p className="text-[11px] text-violet-600 font-semibold mt-0.5">{item.company.name}</p>
                  ) : null}
                  <p className="font-black text-violet-700 text-lg mt-0.5 tracking-tight">
                    {(Number(item.total) + tva).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                  {tva > 0 && (
                    <p className="text-[10px] text-gray-400 font-semibold">
                      {t('portal.quotesSection.tvaIncluded', {
                        defaultValue: 'include TVA: {{amount}}',
                        amount: tva.toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' }),
                      })}
                    </p>
                  )}
                </div>
                <SoftBadge tone={quoteStatusTone(item.status)}>
                  {quoteStatusLabel(item.status, t)}
                </SoftBadge>
              </div>
              {item.status === QUOTE_STATUS.SENT ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, QUOTE_STATUS.REJECTED)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t('portal.quotesSection.decline')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, QUOTE_STATUS.ACCEPTED)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    {t('portal.quotesSection.accept')}
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-3">
                {(item.lines?.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    {expandedId === item.id
                      ? t('portal.quotesSection.hideDetails', 'Ascunde detaliile')
                      : t('portal.quotesSection.showDetails', 'Vezi detaliile')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownloadPdf(item.id, item.number)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {downloadingId === item.id
                    ? t('portal.quotesSection.downloading', 'Se descarcă…')
                    : t('portal.quotesSection.pdf', 'PDF')}
                </button>
              </div>

              {expandedId === item.id && (item.lines?.length ?? 0) > 0 ? (
                <ul className="divide-y divide-gray-100 text-xs rounded-xl bg-white/70 border border-slate-100 p-3">
                  {item.lines!.map((line) => (
                    <li key={line.id} className="py-2 flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{line.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {Number(line.qty)} × {Number(line.unitPrice).toLocaleString('ro-MD')} MDL
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        {(Number(line.qty) * Number(line.unitPrice)).toLocaleString('ro-MD')} MDL
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
            );
          })}
        </ul>
      )}
      {dialog}
    </Panel>
  );
}
