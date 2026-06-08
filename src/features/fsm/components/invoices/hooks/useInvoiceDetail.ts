import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useCancelInvoiceMutation,
  useRecordInvoicePaymentMutation,
  useSendInvoiceEmailMutation,
  useConfirmInvoicePaymentMutation,
  useRejectInvoicePaymentMutation,
  downloadCompanyInvoicePdf,
} from '@/features/fsm/api/useInvoices';
import { downloadFile } from '@/shared/api/files';
import { useLocale } from '@/shared/hooks/useLocale';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

interface UseInvoiceDetailProps {
  selectedId: string | null;
  onClearSelection: () => void;
}

export function useInvoiceDetail({ selectedId, onClearSelection }: UseInvoiceDetailProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { ask, dialog: confirmDialog } = useCabinetConfirmDialog();
  const { data: detail, isLoading: isLoadingDetail } = useInvoiceQuery(selectedId || '');
  const updateInvoice = useUpdateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();
  const cancelInvoice = useCancelInvoiceMutation();
  const recordPayment = useRecordInvoicePaymentMutation();
  const sendEmail = useSendInvoiceEmailMutation();
  const confirmPayment = useConfirmInvoicePaymentMutation();
  const rejectPayment = useRejectInvoicePaymentMutation();

  const handleDownloadPdf = async () => {
    if (!selectedId || !detail) return;
    try {
      await downloadCompanyInvoicePdf(selectedId, `${detail.number}.pdf`);
      toast.success(t('company.fsm.invoices.detail.toast.pdfDownloaded'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.toast.pdfError')));
    }
  };

  const handleCancel = async (reason: string) => {
    if (!selectedId) return;
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

  const handlePartialPayment = async (amount: number, note?: string) => {
    if (!selectedId || !detail) return;
    try {
      const updated = await recordPayment.mutateAsync({ id: selectedId, amount, note });
      if (updated.paymentStatus === 'PAID') {
        toast.success(t('company.fsm.invoices.detail.payment.paidInFull', { defaultValue: 'Factura este plătită integral' }));
      } else {
        toast.success(t('company.fsm.invoices.detail.payment.partial', { defaultValue: 'Plată parțială înregistrată' }));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.payment.error', { defaultValue: 'Înregistrare eșuată' })));
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedId) return;
    try {
      await confirmPayment.mutateAsync(selectedId);
      toast.success(
        t('company.fsm.invoices.detail.paymentProof.confirmSuccess', {
          defaultValue: 'Plata confirmată — factura este plătită',
        }),
      );
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(
          err,
          t('company.fsm.invoices.detail.paymentProof.confirmError', {
            defaultValue: 'Confirmare eșuată',
          }),
        ),
      );
    }
  };

  const handleRejectPayment = async (reason: string) => {
    if (!selectedId) return;
    try {
      await rejectPayment.mutateAsync({ id: selectedId, reason: reason.trim() });
      toast.success(
        t('company.fsm.invoices.detail.paymentProof.rejectSuccess', {
          defaultValue: 'Dovada respinsă — clientul poate reîncărca',
        }),
      );
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(
          err,
          t('company.fsm.invoices.detail.paymentProof.rejectError', {
            defaultValue: 'Respingere eșuată',
          }),
        ),
      );
    }
  };

  const handleDownloadPaymentProof = async () => {
    if (!detail?.paymentProofFileKey) return;
    try {
      await downloadFile(detail.paymentProofFileKey, `dovada-${detail.number}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.paymentProof.downloadError', {
        defaultValue: 'Nu s-a putut descărca dovada',
      })));
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

  const handleDelete = () => {
    if (!selectedId) return;
    const interventionNumber = detail?.intervention?.number;
    const confirmMsg = interventionNumber
      ? t('company.fsm.invoices.detail.confirm.deleteWithRollback', {
          intervention: interventionNumber,
          defaultValue:
            'Ștergi factura definitiv? Lucrarea „{{intervention}}” va reveni în statusul „Finalizată” și va putea fi re-facturată.',
        })
      : t('company.fsm.invoices.detail.confirm.delete');
    ask({
      title: t('cabinet.common.delete'),
      message: confirmMsg,
      onConfirm: async () => {
        try {
          await deleteInvoice.mutateAsync(selectedId);
          toast.success(t('company.fsm.invoices.detail.toast.deleted'));
          onClearSelection();
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.fsm.invoices.detail.toast.deleteError')));
        }
      },
    });
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
    confirmPaymentPending: confirmPayment.isPending,
    rejectPaymentPending: rejectPayment.isPending,
    handleDownloadPdf,
    handleCancel,
    handlePartialPayment,
    handleConfirmPayment,
    handleRejectPayment,
    handleDownloadPaymentProof,
    handleSendEmail,
    handleDelete,
    confirmDialog,
  };
}
