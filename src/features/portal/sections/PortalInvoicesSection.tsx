import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { useSubmitPortalInvoicePaymentProofMutation } from '@/features/portal/api/usePortal';
import { invoiceStatusTone } from '@/features/portal/portalStatus';
import type { InvoiceDto } from '@/entities/fsm/model/types';
import { INVOICE_PAYMENT_STATUS } from '@/entities/fsm/model/invoicePaymentStatus.constants';
import { downloadPortalInvoicePdf } from '@/features/fsm';
import { uploadFile } from '@/shared/api/files';
import { formatDateLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getErrorMessage } from '@/shared/utils/errors';

export function PortalInvoicesSection({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { invoices } = data;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadInvoiceId = useRef<string | null>(null);
  const submitProof = useSubmitPortalInvoicePaymentProofMutation();

  const handleDownload = async (inv: InvoiceDto) => {
    setDownloadingId(inv.id);
    try {
      await downloadPortalInvoicePdf(inv.id, `${inv.number}.pdf`);
      toast.success(t('portal.invoicesSection.toastDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.invoicesSection.toastError')));
    } finally {
      setDownloadingId(null);
    }
  };

  const startUpload = (inv: InvoiceDto) => {
    pendingUploadInvoiceId.current = inv.id;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const invoiceId = pendingUploadInvoiceId.current;
    e.target.value = '';
    pendingUploadInvoiceId.current = null;
    if (!file || !invoiceId) return;

    setUploadingId(invoiceId);
    try {
      const uploaded = await uploadFile(file);
      await submitProof.mutateAsync({ invoiceId, fileId: uploaded.id });
      toast.success(t('portal.invoicesSection.toastProofSubmitted'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('portal.invoicesSection.toastProofError')));
    } finally {
      setUploadingId(null);
    }
  };

  const canUploadProof = (inv: InvoiceDto) =>
    inv.paymentStatus === INVOICE_PAYMENT_STATUS.UNPAID ||
    inv.paymentStatus === INVOICE_PAYMENT_STATUS.OVERDUE;

  return (
    <Panel>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileSelected}
        aria-label={t('portal.invoicesSection.uploadProof', { defaultValue: 'Încarcă dovada plății' })}
      />
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
                    {inv.paymentStatus === INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION && (
                      <p className="text-[10px] text-blue-600 font-medium mt-1 max-w-[140px]">
                        {t('portal.invoicesSection.pendingHint')}
                      </p>
                    )}
                    {inv.paymentProofRejectedReason &&
                      (inv.paymentStatus === INVOICE_PAYMENT_STATUS.UNPAID ||
                        inv.paymentStatus === INVOICE_PAYMENT_STATUS.OVERDUE) && (
                        <p className="text-[10px] text-amber-700 font-medium mt-1 max-w-[160px]">
                          {t('portal.invoicesSection.rejectedHint', {
                            reason: inv.paymentProofRejectedReason,
                          })}
                        </p>
                      )}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
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
                    {canUploadProof(inv) && (
                      <button
                        type="button"
                        onClick={() => startUpload(inv)}
                        disabled={uploadingId === inv.id}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingId === inv.id
                          ? t('portal.invoicesSection.uploading')
                          : t('portal.invoicesSection.uploadProof')}
                      </button>
                    )}
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
