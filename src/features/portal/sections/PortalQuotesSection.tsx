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

export function PortalQuotesSection({ data }: { data: PortalDashboardDto }) {
  const updateQuote = useUpdatePortalQuoteMutation();
  const { quotes } = data;

  const handleQuoteStatus = async (quoteId: string, status: PortalQuoteActionStatus) => {
    const word = status === QUOTE_STATUS.ACCEPTED ? 'acceptați' : 'respingeți';
    if (!confirm(`Sigur doriți să ${word} această ofertă?`)) return;
    try {
      await updateQuote.mutateAsync({ id: quoteId, status });
      toast.success(status === QUOTE_STATUS.ACCEPTED ? 'Oferta a fost acceptată!' : 'Oferta a fost respinsă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Eroare la actualizarea ofertei.'));
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Oferte de aprobat"
        description="Acceptă sau respinge devizele primite de la companie."
        meta={<span className="text-xs text-gray-400">{quotes.length} oferte</span>}
      />
      {quotes.length === 0 ? (
        <EmptyState message="Nu ai oferte în curs de aprobare." />
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
                <SoftBadge tone={quoteStatusTone(item.status)}>{item.status}</SoftBadge>
              </div>
              {item.status === QUOTE_STATUS.SENT ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, QUOTE_STATUS.REJECTED)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Declină
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, QUOTE_STATUS.ACCEPTED)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Acceptă
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
