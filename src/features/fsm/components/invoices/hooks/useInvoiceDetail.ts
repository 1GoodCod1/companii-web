import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { InvoicePaymentStatus } from '@/types/fsm';
import {
  useInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useCancelInvoiceMutation,
  useRecordInvoicePaymentMutation,
  useSendInvoiceEmailMutation,
  downloadCompanyInvoicePdf,
} from '@/features/fsm/api/useInvoices';
import { useLocale } from '@/hooks/useLocale';
import { paymentStatusLabel } from '@/utils/i18nStatusLabels';
import { getErrorMessage } from '@/utils/errors';

interface UseInvoiceDetailProps {
  selectedId: string | null;
  onClearSelection: () => void;
}

export function useInvoiceDetail({ selectedId, onClearSelection }: UseInvoiceDetailProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: detail, isLoading: isLoadingDetail } = useInvoiceQuery(selectedId || '');
  const updateInvoice = useUpdateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();
  const cancelInvoice = useCancelInvoiceMutation();
  const recordPayment = useRecordInvoicePaymentMutation();
  const sendEmail = useSendInvoiceEmailMutation();

  const handlePaymentStatusChange = async (newStatus: InvoicePaymentStatus) => {
    if (!selectedId || !detail) return;
    if (newStatus === detail.paymentStatus) return;

    // Reversal (PAID → UNPAID) requires a reason for audit. Prompt the user
    // and abort if they cancel or leave it blank.
    let paymentReversalReason: string | undefined;
    if (detail.paymentStatus === 'PAID' && newStatus === 'UNPAID') {
      const reason = window.prompt(
        t('company.fsm.invoices.detail.reversal.prompt', {
          defaultValue:
            'Motivul anulării plății (obligatoriu — va fi salvat în istoric):',
        }),
        '',
      );
      if (reason === null) return; // user clicked Cancel
      if (!reason.trim()) {
        toast.error(
          t('company.fsm.invoices.detail.reversal.reasonRequired', {
            defaultValue: 'Motivul este obligatoriu pentru anularea plății',
          }),
        );
        return;
      }
      paymentReversalReason = reason.trim();
    }

    try {
      await updateInvoice.mutateAsync({
        id: selectedId,
        paymentStatus: newStatus,
        paymentReversalReason,
      });
      toast.success(t('cabinet.toasts.invoiceMarked', { status: paymentStatusLabel(newStatus, t) }));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.toast.updateError')));
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    try {
      await downloadCompanyInvoicePdf(selectedId, `${detail.number}.pdf`);
      toast.success(t('company.fsm.invoices.detail.toast.pdfDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.toast.pdfError')));
    }
  };

  const handleCancel = async () => {
    if (!selectedId) return;
    const reason = window.prompt(
      t('company.fsm.invoices.detail.cancel.prompt', {
        defaultValue:
          'Motivul anulării (va apărea pe PDF și în istoric):',
      }),
      '',
    );
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error(
        t('company.fsm.invoices.detail.cancel.reasonRequired', {
          defaultValue: 'Motivul este obligatoriu',
        }),
      );
      return;
    }
    try {
      await cancelInvoice.mutateAsync({ id: selectedId, reason: reason.trim() });
      toast.success(
        t('company.fsm.invoices.detail.cancel.success', {
          defaultValue: 'Factura a fost anulată',
        }),
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.cancel.error', { defaultValue: 'Anulare eșuată' })));
    }
  };

  const handlePartialPayment = async () => {
    if (!selectedId || !detail) return;
    const total = Number(detail.amount) + Number(detail.tvaAmount);
    const paid = Number(detail.paidAmount ?? 0);
    const remaining = Math.max(0, total - paid);
    const input = window.prompt(
      t('company.fsm.invoices.detail.payment.prompt', {
        remaining: remaining.toLocaleString('ro-MD'),
        defaultValue: 'Sumă plătită (max {{remaining}} MDL):',
      }),
      String(remaining.toFixed(2)),
    );
    if (input === null) return;
    const amount = Number(input.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('company.fsm.invoices.detail.payment.invalidAmount', { defaultValue: 'Sumă invalidă' }));
      return;
    }
    try {
      const updated = await recordPayment.mutateAsync({ id: selectedId, amount });
      if (updated.paymentStatus === 'PAID') {
        toast.success(t('company.fsm.invoices.detail.payment.paidInFull', { defaultValue: 'Factura este plătită integral' }));
      } else {
        toast.success(t('company.fsm.invoices.detail.payment.partial', { defaultValue: 'Plată parțială înregistrată' }));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.payment.error', { defaultValue: 'Înregistrare eșuată' })));
    }
  };

  const handleSendEmail = async () => {
    if (!selectedId || !detail) return;
    const customMessage = window.prompt(
      t('company.fsm.invoices.detail.email.prompt', {
        defaultValue: 'Mesaj personalizat (opțional):',
      }),
      '',
    );
    if (customMessage === null) return; // user cancelled
    try {
      const result = await sendEmail.mutateAsync({
        id: selectedId,
        customMessage: customMessage.trim() || undefined,
      });
      if (result.sent) {
        toast.success(
          t('company.fsm.invoices.detail.email.sent', {
            email: result.recipient,
            defaultValue: 'Trimis la {{email}}',
          }),
        );
      } else {
        toast.error(
          t('company.fsm.invoices.detail.email.notSent', {
            defaultValue: 'Email nu a putut fi trimis (verifică setările SMTP)',
          }),
        );
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.email.error', { defaultValue: 'Eroare la trimitere' })));
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const interventionNumber = detail?.intervention?.number;
    const confirmMsg = interventionNumber
      ? t('company.fsm.invoices.detail.confirm.deleteWithRollback', {
          intervention: interventionNumber,
          defaultValue:
            'Ștergi factura definitiv? Lucrarea „{{intervention}}” va reveni în statusul „Finalizată” și va putea fi re-facturată.',
        })
      : t('company.fsm.invoices.detail.confirm.delete');
    if (!confirm(confirmMsg)) return;
    try {
      await deleteInvoice.mutateAsync(selectedId);
      toast.success(t('company.fsm.invoices.detail.toast.deleted'));
      onClearSelection();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.toast.deleteError')));
    }
  };

  return {
    detail,
    isLoadingDetail,
    locale,
    updateInvoicePending: updateInvoice.isPending,
    deleteInvoicePending: deleteInvoice.isPending,
    cancelInvoicePending: cancelInvoice.isPending,
    recordPaymentPending: recordPayment.isPending,
    sendEmailPending: sendEmail.isPending,
    handlePaymentStatusChange,
    handleDownloadPdf,
    handleCancel,
    handlePartialPayment,
    handleSendEmail,
    handleDelete,
  };
}
