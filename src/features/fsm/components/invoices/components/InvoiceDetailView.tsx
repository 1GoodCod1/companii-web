import { useTranslation } from 'react-i18next';
import { getAllowedPaymentTransitions } from '@/entities/fsm/model/invoicePaymentStatus';
import { paymentStatusHint, paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getInvoicePaymentStatusStyle } from '@/entities/fsm/model/invoicePaymentStatusStyles';
import { formatDateLocalized } from '@/shared/utils/date';
import { useInvoiceDetail } from '../hooks/useInvoiceDetail';

type Props = {
  hookData: ReturnType<typeof useInvoiceDetail>;
};

export function InvoiceDetailView(props: Props) {
  return useInvoiceDetailView(props);
}

function useInvoiceDetailView({ hookData }: Props) {
  const { t } = useTranslation();
  const {
    detail,
    locale,
    updateInvoicePending,
    cancelInvoicePending,
    recordPaymentPending,
    sendEmailPending,
    confirmPaymentPending,
    rejectPaymentPending,
    handlePaymentStatusChange,
    handleDownloadPdf,
    handleCancel,
    handlePartialPayment,
    handleCashPaid,
    handleConfirmPayment,
    handleRejectPayment,
    handleDownloadPaymentProof,
    handleSendEmail,
  } = hookData;

  if (!detail) return null;

  return (
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
          disabled={sendEmailPending || !detail.intervention?.customer?.email}
          title={!detail.intervention?.customer?.email
            ? t('company.fsm.invoices.detail.email.noEmail', { defaultValue: 'Clientul nu are email' })
            : undefined}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {sendEmailPending
            ? t('cabinet.common.loading')
            : t('company.fsm.invoices.detail.sendEmail', { defaultValue: 'Trimite email' })}
        </button>
      </div>

      {/* paid amount progress bar */}
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

        {detail.paymentStatus === 'PENDING_CONFIRMATION' && (
          <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 space-y-2.5">
            <p className="text-xs text-blue-900 font-medium leading-relaxed">
              {t('company.fsm.invoices.detail.paymentProof.pendingHint', {
                defaultValue:
                  'Clientul a încărcat dovada plății. Verificați fișierul și confirmați sau respingeți.',
              })}
            </p>
            {detail.paymentProofSubmittedAt && (
              <p className="text-[10px] text-blue-700 font-bold">
                {t('company.fsm.invoices.detail.paymentProof.submittedAt', {
                  date: formatDateLocalized(detail.paymentProofSubmittedAt, locale),
                  defaultValue: 'Trimisă la: {{date}}',
                })}
              </p>
            )}
            {detail.paymentProofFileKey && (
              <button
                type="button"
                onClick={handleDownloadPaymentProof}
                className="w-full py-2 rounded-xl bg-white border border-blue-200 text-blue-800 text-[10px] font-black uppercase tracking-wider hover:bg-blue-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.paymentProof.viewFile', {
                  defaultValue: 'Vezi dovada plății',
                })}
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirmPaymentPending}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.paymentProof.confirmBtn', {
                  defaultValue: 'Confirmă plata',
                })}
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={rejectPaymentPending}
                className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.paymentProof.rejectBtn', {
                  defaultValue: 'Respinge',
                })}
              </button>
            </div>
          </div>
        )}

        {/* action shortcuts for in-flight invoices */}
        {(detail.paymentStatus === 'UNPAID' || detail.paymentStatus === 'OVERDUE') && (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              {t('company.fsm.invoices.detail.payment.clientUploadHint', {
                defaultValue:
                  'Clientul poate încărca dovada din portal. Pentru numerar sau transfer fără upload, marcați manual.',
              })}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCashPaid}
                disabled={updateInvoicePending}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.payment.cashBtn', {
                  defaultValue: 'Plătită (numerar)',
                })}
              </button>
              <button
                type="button"
                onClick={handlePartialPayment}
                disabled={recordPaymentPending}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.payment.recordBtn', {
                  defaultValue: 'Înregistrează plată',
                })}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelInvoicePending}
                className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.cancel.btn', {
                  defaultValue: 'Anulează factura',
                })}
              </button>
            </div>
          </div>
        )}

        {detail.paymentProofRejectedReason &&
          (detail.paymentStatus === 'UNPAID' || detail.paymentStatus === 'OVERDUE') && (
            <div className="rounded-lg bg-amber-50/60 border border-amber-100 p-2.5 text-[11px] text-amber-900">
              <span className="font-bold">
                {t('company.fsm.invoices.detail.paymentProof.lastRejection', {
                  defaultValue: 'Ultima respingere',
                })}
                :
              </span>{' '}
              {detail.paymentProofRejectedReason}
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
          if (detail.paymentStatus === 'PENDING_CONFIRMATION') return null;
          const allowed = getAllowedPaymentTransitions(detail.paymentStatus);
          const hint = paymentStatusHint(detail.paymentStatus, t);
          if (allowed.length === 0) {
            return (
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {hint || t('company.fsm.invoices.detail.paymentSection.noActions')}
              </p>
            );
          }
          // Only show reversal toggle for PAID → UNPAID (rare clerical fix)
          if (detail.paymentStatus !== 'PAID') return null;
          return (
            <div className="flex gap-2">
              {Array.from(new Set([detail.paymentStatus, ...allowed]))
                .map((st) => {
                  const isCurrent = detail.paymentStatus === st;
                  const isAction = allowed.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => isAction && handlePaymentStatusChange(st)}
                      disabled={isCurrent || updateInvoicePending}
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
            {detail.intervention?.number}: {detail.intervention?.type}
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
  );
}
