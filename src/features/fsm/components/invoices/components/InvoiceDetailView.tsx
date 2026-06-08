import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { paymentStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getInvoicePaymentStatusStyle } from '@/entities/fsm/model/invoicePaymentStatusStyles';
import { formatDateLocalized } from '@/shared/utils/date';
import { useInvoiceDetail } from '../hooks/useInvoiceDetail';
import { AppModal } from '@/shared/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';

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
    cancelInvoicePending,
    recordPaymentPending,
    sendEmailPending,
    confirmPaymentPending,
    rejectPaymentPending,
    handleDownloadPdf,
    handleCancel,
    handlePartialPayment,
    handleConfirmPayment,
    handleRejectPayment,
    handleDownloadPaymentProof,
    handleSendEmail,
  } = hookData;

  const [activeModal, setActiveModal] = useState<'payment' | 'reject' | 'cancel' | null>(null);

  // Payment Modal State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [customAmount, setCustomAmount] = useState('');

  // Reject / Cancel Modal State
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  if (!detail) return null;

  const total = Number(detail.amount) + Number(detail.tvaAmount);
  const paid = Number(detail.paidAmount ?? 0);
  const remaining = Math.max(0, total - paid);

  const onOpenPayment = (method: 'cash' | 'transfer') => {
    setPaymentMethod(method);
    setPaymentType('full');
    setCustomAmount(remaining.toFixed(2));
    setActiveModal('payment');
  };

  const onSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = paymentType === 'full' ? remaining : Number(customAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining + 0.01) {
      toast.error(t('company.fsm.invoices.detail.payment.invalidAmount', { defaultValue: 'Sumă invalidă' }));
      return;
    }
    const note = paymentMethod === 'cash' 
      ? (paymentType === 'full' ? 'Plată în numerar (integral)' : 'Plată în numerar (parțial)')
      : (paymentType === 'full' ? 'Transfer / Card (integral)' : 'Transfer / Card (parțial)');

    await handlePartialPayment(amount, note);
    setActiveModal(null);
  };

  const onSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    await handleRejectPayment(rejectReason);
    setActiveModal(null);
  };

  const onSubmitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    await handleCancel(cancelReason);
    setActiveModal(null);
  };

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
                  'Clientul a încărcat dovada plății. Verificați fișierul și confirmați sau înregistrați plata manual.',
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
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirmPaymentPending}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {t('company.fsm.invoices.detail.paymentProof.confirmBtn', {
                  defaultValue: 'Confirmă plata (integral)',
                })}
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPayment('cash')}
                  disabled={recordPaymentPending}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {t('company.fsm.invoices.detail.payment.cashBtn', {
                    defaultValue: 'Plătită (numerar)',
                  })}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPayment('transfer')}
                  disabled={recordPaymentPending}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {t('company.fsm.invoices.detail.payment.recordBtn', {
                    defaultValue: 'Înregistrează plată',
                  })}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectReason('');
                    setActiveModal('reject');
                  }}
                  disabled={rejectPaymentPending}
                  className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {t('company.fsm.invoices.detail.paymentProof.rejectBtn', {
                    defaultValue: 'Respinge',
                  })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCancelReason('');
                    setActiveModal('cancel');
                  }}
                  disabled={cancelInvoicePending}
                  className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {t('company.fsm.invoices.detail.cancel.btn', {
                    defaultValue: 'Anulează factura',
                  })}
                </button>
              </div>
            </div>
          </div>
        )}

        {(detail.paymentStatus === 'UNPAID' || detail.paymentStatus === 'OVERDUE') && (
          <div className="rounded-xl bg-amber-50/40 border border-amber-100/60 p-3">
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              {t('company.fsm.invoices.detail.payment.statusOnlyHint', {
                defaultValue: 'În așteptarea răspunsului din partea clientului. Factura a fost trimisă.',
              })}
            </p>
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

        {detail.paymentStatus === 'PAID' && (
          <p className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-100/60 p-3 rounded-xl">
            {t('company.fsm.invoices.detail.paymentSection.paid', { defaultValue: 'Factura este plătită în întregime. Nu sunt necesare alte acțiuni.' })}
          </p>
        )}
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

      {/* Modern React Form Modals replacing browser window.prompts */}
      <AppModal
        open={activeModal === 'payment'}
        onClose={() => setActiveModal(null)}
        title={t('company.fsm.invoices.detail.payment.recordTitle', { defaultValue: 'Înregistrare plată' })}
      >
        <form onSubmit={onSubmitPayment} className="space-y-4">
          <div className="rounded-xl bg-violet-50/50 p-4 border border-violet-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block">
                {t('company.fsm.invoices.detail.payment.remaining', { defaultValue: 'Sumă restantă' })}
              </span>
              <span className="text-lg font-black text-violet-950">
                {remaining.toLocaleString('ro-MD')} MDL
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-right">
                {t('company.fsm.invoices.detail.tax.totalDue', { defaultValue: 'Total de plată' })}
              </span>
              <span className="text-sm font-semibold text-gray-600 block text-right">
                {total.toLocaleString('ro-MD')} MDL
              </span>
            </div>
          </div>

          <div>
            <label className={cabinetLabelClass}>
              {t('company.fsm.invoices.detail.payment.methodLabel', { defaultValue: 'Metodă de plată' })}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`py-2.5 px-4 text-xs font-black uppercase border transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                }`}
              >
                {t('company.fsm.invoices.detail.payment.transferBtn', { defaultValue: 'Transfer / Card' })}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2.5 px-4 text-xs font-black uppercase border transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                }`}
              >
                {t('company.fsm.invoices.detail.payment.cashBtn', { defaultValue: 'Numerar' })}
              </button>
            </div>
          </div>

          <div>
            <label className={cabinetLabelClass}>
              {t('company.fsm.invoices.detail.payment.optionsTitle', { defaultValue: 'Tipul plății' })}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentType('full');
                  setCustomAmount(remaining.toFixed(2));
                }}
                className={`py-2.5 px-4 text-xs font-black uppercase border transition-all cursor-pointer ${
                  paymentType === 'full'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                }`}
              >
                {t('company.fsm.invoices.detail.payment.fullOption', { defaultValue: 'Plată integrală' })}
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('partial')}
                className={`py-2.5 px-4 text-xs font-black uppercase border transition-all cursor-pointer ${
                  paymentType === 'partial'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                }`}
              >
                {t('company.fsm.invoices.detail.payment.partialOption', { defaultValue: 'Plată parțială' })}
              </button>
            </div>
          </div>

          {paymentType === 'partial' && (
            <div className="animate-fade-in">
              <label htmlFor="payment-amount" className={cabinetLabelClass}>
                {t('company.fsm.invoices.detail.payment.amountLabel', { defaultValue: 'Sumă de înregistrat (MDL)' })}
              </label>
              <input
                id="payment-amount"
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
                className={cabinetFieldClass}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className={cabinetBtnSecondary}
            >
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={recordPaymentPending}
              className={cabinetBtnPrimary}
            >
              {recordPaymentPending
                ? t('cabinet.common.loading')
                : t('company.fsm.invoices.detail.payment.submitBtn', { defaultValue: 'Înregistrează' })}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        open={activeModal === 'reject'}
        onClose={() => setActiveModal(null)}
        title={t('company.fsm.invoices.detail.paymentProof.rejectTitle', { defaultValue: 'Respingere dovadă plată' })}
      >
        <form onSubmit={onSubmitReject} className="space-y-4">
          <div>
            <label htmlFor="reject-reason" className={cabinetLabelClass}>
              {t('company.fsm.invoices.detail.paymentProof.rejectPrompt', { defaultValue: 'Motiv respingere (clientul va putea reîncărca dovada):' })}
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className={`${cabinetFieldClass} resize-none`}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className={cabinetBtnSecondary}
            >
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={rejectPaymentPending}
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {rejectPaymentPending ? t('cabinet.common.loading') : t('company.fsm.invoices.detail.paymentProof.rejectBtn', { defaultValue: 'Respinge' })}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        open={activeModal === 'cancel'}
        onClose={() => setActiveModal(null)}
        title={t('company.fsm.invoices.detail.cancel.title', { defaultValue: 'Anulare factură' })}
      >
        <form onSubmit={onSubmitCancel} className="space-y-4">
          <div>
            <label htmlFor="cancel-reason" className={cabinetLabelClass}>
              {t('company.fsm.invoices.detail.cancel.prompt', { defaultValue: 'Motivul anulării (va apărea pe PDF și în istoric):' })}
            </label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className={`${cabinetFieldClass} resize-none`}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className={cabinetBtnSecondary}
            >
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={cancelInvoicePending}
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {cancelInvoicePending ? t('cabinet.common.loading') : t('company.fsm.invoices.detail.cancel.btn', { defaultValue: 'Anulează factura' })}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
