import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { invoiceStatusTone } from '@/features/portal/portalStatus';
import type { InvoiceDto } from '@/types/fsm';
import { downloadPortalInvoicePdf } from '@/features/fsm/api/useFsm';
import { PAYMENT_STATUS_LABELS } from '@/constants/invoices.constants';
import { formatDateRo } from '@/utils/date';

export function PortalInvoicesSection({ data }: { data: PortalDashboardDto }) {
  const { invoices } = data;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (inv: InvoiceDto) => {
    setDownloadingId(inv.id);
    try {
      await downloadPortalInvoicePdf(inv.id, `${inv.number}.pdf`);
      toast.success('Chitanța PDF a fost descărcată!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la descărcarea PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Facturile mele"
        description="Istoricul facturilor emise pentru lucrările tale."
        meta={<span className="text-xs text-gray-400">{invoices.length} facturi</span>}
      />
      {invoices.length === 0 ? (
        <EmptyState message="Nu s-a emis nicio factură încă." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-violet-100/60 text-gray-500">
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Număr</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Emitere</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Total cu TVA</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Plată</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {invoices.map((inv: InvoiceDto) => (
                <tr key={inv.id} className="hover:bg-violet-50/20 transition-colors">
                  <td className="p-3 font-bold text-gray-800">{inv.number}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {formatDateRo(inv.issuedAt)}
                  </td>
                  <td className="p-3 font-black text-gray-900">
                    {(Number(inv.amount) + Number(inv.tvaAmount)).toLocaleString('ro-MD', {
                      style: 'currency',
                      currency: 'MDL',
                    })}
                  </td>
                  <td className="p-3">
                    <SoftBadge tone={invoiceStatusTone(inv.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[inv.paymentStatus]}
                    </SoftBadge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(inv)}
                      disabled={downloadingId === inv.id}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {downloadingId === inv.id ? 'Se generează...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
