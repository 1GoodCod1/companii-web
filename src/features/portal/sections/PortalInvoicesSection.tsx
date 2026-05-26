import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { formatDateLocalized } from '@/utils/date';
import { useLocale } from '@/hooks/useLocale';
import { paymentStatusLabel } from '@/utils/i18nStatusLabels';

export function PortalInvoicesSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { invoices } = data;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (inv: InvoiceDto) => {
    setDownloadingId(inv.id);
    try {
      await downloadPortalInvoicePdf(inv.id, `${inv.number}.pdf`);
      toast.success(t('portal.invoicesSection.toastDownloaded'));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('portal.invoicesSection.toastError'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title={t('portal.invoicesSection.title')}
        description={t('portal.invoicesSection.description')}
        meta={
          <span className="text-xs text-gray-400">
            {t('portal.invoicesSection.meta', { count: invoices.length })}
          </span>
        }
      />
      {invoices.length === 0 ? (
        <EmptyState message={t('portal.invoicesSection.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-violet-100/60 text-gray-500">
                <th className="p-3 text-xs font-bold uppercase tracking-wider">
                  {t('portal.invoicesSection.colNumber')}
                </th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">
                  {t('portal.invoicesSection.colIssued')}
                </th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">
                  {t('portal.invoicesSection.colTotal')}
                </th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">
                  {t('portal.invoicesSection.colPayment')}
                </th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">
                  {t('portal.invoicesSection.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {invoices.map((inv: InvoiceDto) => (
                <tr key={inv.id} className="hover:bg-violet-50/20 transition-colors">
                  <td className="p-3 font-bold text-gray-800">{inv.number}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {formatDateLocalized(inv.issuedAt, locale)}
                  </td>
                  <td className="p-3 font-black text-gray-900">
                    {(Number(inv.amount) + Number(inv.tvaAmount)).toLocaleString('ro-MD', {
                      style: 'currency',
                      currency: 'MDL',
                    })}
                  </td>
                  <td className="p-3">
                    <SoftBadge tone={invoiceStatusTone(inv.paymentStatus)}>
                      {paymentStatusLabel(inv.paymentStatus, t)}
                    </SoftBadge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(inv)}
                      disabled={downloadingId === inv.id}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {downloadingId === inv.id
                        ? t('portal.invoicesSection.generating')
                        : t('portal.invoicesSection.pdf')}
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
