import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { EntityDetailPanel } from '@/components/cabinet/EntityDetailPanel';
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
import { getAllowedPaymentTransitions } from '@/utils/fsmStatusTransitions';
import { paymentStatusHint, paymentStatusLabel } from '@/utils/i18nStatusLabels';
import { getInvoicePaymentStatusStyle } from '@/utils/invoicePaymentStatusStyles';
import { formatDateLocalized } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
};

export function InvoiceDetailPanel({ selectedId, onClearSelection }: Props) {
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

  return (
    <EntityDetailPanel
      title={t('company.fsm.invoices.detail.title')}
      selectedId={selectedId}
      isLoading={isLoadingDetail}
      hasDetail={!!detail}
      loadingMessage={t('company.fsm.invoices.detail.loading')}
      emptyMessage={t('company.fsm.invoices.detail.empty')}
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
                  {t('company.fsm.invoices.detail.issuedAt')}{' '}
                  {formatDateLocalized(detail.issuedAt, locale)}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getInvoicePaymentStatusStyle(
                  detail.paymentStatus,
                )}`}
              >
                {paymentStatusLabel(detail.paymentStatus, t)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                {t('company.fsm.invoices.detail.downloadPdf')}
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendEmail.isPending || !detail.intervention?.customer?.email}
                title={!detail.intervention?.customer?.email
                  ? t('company.fsm.invoices.detail.email.noEmail', { defaultValue: 'Clientul nu are email' })
                  : undefined}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {sendEmail.isPending
                  ? t('cabinet.common.loading')
                  : t('company.fsm.invoices.detail.sendEmail', { defaultValue: 'Trimite email' })}
              </button>
            </div>

            {/* P2.#16 — paid amount progress bar (only meaningful for in-flight invoices). */}
            {(() => {
              const total = Number(detail.amount) + Number(detail.tvaAmount);
              const paid = Number(detail.paidAmount ?? 0);
              if (total <= 0 || detail.paymentStatus === 'CANCELLED') return null;
              if (paid === 0 && detail.paymentStatus !== 'PAID') return null;
              const pct = Math.min(100, (paid / total) * 100);
              const fullyPaid = paid + 0.005 >= total;
              return (
                <div className="rounded-xl bg-emerald-50/40 border border-emerald-100 p-3 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-emerald-700 uppercase tracking-wider">
                      {t('company.fsm.invoices.detail.payment.progress', { defaultValue: 'Plătit' })}
                    </span>
                    <span className="text-emerald-900">
                      {paid.toLocaleString('ro-MD')} / {total.toLocaleString('ro-MD')} MDL
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${fullyPaid ? 'bg-emerald-600' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('company.fsm.invoices.detail.paymentSection.title')}
              </h4>

              {/* P2.#16 / P2.#3 — action shortcuts for in-flight invoices. */}
              {(detail.paymentStatus === 'UNPAID' || detail.paymentStatus === 'OVERDUE') && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePartialPayment}
                    disabled={recordPayment.isPending}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {t('company.fsm.invoices.detail.payment.recordBtn', {
                      defaultValue: 'Înregistrează plată',
                    })}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelInvoice.isPending}
                    className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {t('company.fsm.invoices.detail.cancel.btn', {
                      defaultValue: 'Anulează factura',
                    })}
                  </button>
                </div>
              )}

              {detail.paymentStatus === 'CANCELLED' && detail.cancellationReason && (
                <div className="rounded-lg bg-rose-50/60 border border-rose-100 p-2.5 text-[11px] text-rose-900">
                  <span className="font-bold">
                    {t('company.fsm.invoices.detail.cancel.reasonLabel', { defaultValue: 'Motiv anulare' })}:
                  </span>{' '}
                  {detail.cancellationReason}
                </div>
              )}
              {(() => {
                const allowed = getAllowedPaymentTransitions(detail.paymentStatus);
                const hint = paymentStatusHint(detail.paymentStatus, t);
                if (allowed.length === 0) {
                  return (
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {hint || t('company.fsm.invoices.detail.paymentSection.noActions')}
                    </p>
                  );
                }
                return (
                  <div className="flex gap-2">
                    {[detail.paymentStatus, ...allowed]
                      .filter((st, idx, arr) => arr.indexOf(st) === idx)
                      .map((st) => {
                        const isCurrent = detail.paymentStatus === st;
                        const isAction = allowed.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => isAction && handlePaymentStatusChange(st)}
                            disabled={isCurrent || updateInvoice.isPending}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${
                              isCurrent
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs cursor-default'
                                : isAction
                                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-violet-50 hover:border-violet-200 cursor-pointer'
                                  : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {paymentStatusLabel(st, t)}
                          </button>
                        );
                      })}
                  </div>
                );
              })()}
            </div>

            <div className="text-sm border-t border-gray-100 pt-3 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  {t('company.fsm.invoices.detail.fields.customer')}
                </span>
                <span className="font-bold text-gray-900">
                  {detail.intervention?.customer?.fullName || t('company.fsm.invoices.detail.fields.packageCustomer')}
                </span>
                <span className="text-xs text-gray-500 block font-medium">
                  {detail.intervention?.customer?.phone}
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">
                  {detail.intervention?.customer?.address}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                  {t('company.fsm.invoices.detail.fields.intervention')}
                </span>
                <span className="font-semibold text-xs text-gray-800">
                  {detail.intervention?.number} — {detail.intervention?.type}
                </span>
              </div>

              {detail.dueDate && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    {t('company.fsm.invoices.detail.fields.dueDate')}
                  </span>
                  <span className="font-bold text-red-500 text-xs">
                    {t('company.fsm.common.until')}{' '}
                    {formatDateLocalized(detail.dueDate, locale)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 bg-violet-50/10 p-3.5 rounded-xl border border-violet-100">
              <h4 className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                {t('company.fsm.invoices.detail.tax.title')}
              </h4>
              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>{t('company.fsm.invoices.detail.tax.taxableBase')}</span>
                  <span className="font-bold text-gray-800">
                    {Number(detail.amount).toLocaleString('ro-MD')} MDL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('company.fsm.invoices.detail.tax.vat', { rate: detail.tvaRate })}</span>
                  <span className="font-bold text-gray-800">
                    {Number(detail.tvaAmount).toLocaleString('ro-MD')} MDL
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-1.5">
                  <span>{t('company.fsm.invoices.detail.tax.totalDue')}</span>
                  <span className="text-violet-700">
                    {(Number(detail.amount) + Number(detail.tvaAmount)).toLocaleString('ro-MD', {
                      style: 'currency',
                      currency: 'MDL',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
      ) : null}
    </EntityDetailPanel>
  );
}
