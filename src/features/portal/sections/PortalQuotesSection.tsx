import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { useUpdatePortalQuoteMutation } from '@/features/portal/api/usePortal';
import {
  QUOTE_STATUS,
  type PortalQuoteActionStatus,
} from '@/constants/quoteStatus.constants';
import { quoteStatusTone } from '@/utils/portalStatus';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import type { QuoteDto } from '@/types/fsm';
import { getErrorMessage } from '@/utils/errors';
import { quoteStatusLabel } from '@/utils/i18nStatusLabels';

export function PortalQuotesSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const updateQuote = useUpdatePortalQuoteMutation();
  const { quotes } = data;

  const handleQuoteStatus = async (quoteId: string, status: PortalQuoteActionStatus) => {
    const confirmKey =
      status === QUOTE_STATUS.ACCEPTED
        ? 'portal.quotesSection.confirmAccept'
        : 'portal.quotesSection.confirmReject';
    if (!confirm(t(confirmKey))) return;
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
  };

  return (
    <Panel>
      <PanelHeader
        title={t('portal.quotesSection.title')}
        description={t('portal.quotesSection.description')}
        meta={
          <span className="text-xs text-gray-400">
            {t('portal.quotesSection.meta', { count: quotes.length })}
          </span>
        }
      />
      {quotes.length === 0 ? (
        <EmptyState message={t('portal.quotesSection.empty')} />
      ) : (
        <ul className="space-y-3">
          {quotes.map((item: QuoteDto) => (
            <li
              key={item.id}
              className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.number}
                  </span>
                  <p className="font-black text-violet-700 text-lg mt-0.5 tracking-tight">
                    {Number(item.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
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
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
