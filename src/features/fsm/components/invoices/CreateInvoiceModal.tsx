import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/ui/AppModal';
import { useCreateInvoiceForm } from './hooks/useCreateInvoiceForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateInvoiceModal({ open, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('company.fsm.invoices.createModal.title')}
      size="lg"
      backgroundIndex={2}
    >
      {open ? <CreateInvoiceForm onClose={onClose} /> : null}
    </AppModal>
  );
}

function CreateInvoiceForm({ onClose }: Pick<Props, 'onClose'>) {
  const { t } = useTranslation();

  const {
    interventions,
    activeCompany,
    interventionId,
    setInterventionId,
    tvaRate,
    setTvaRate,
    dueDate,
    setDueDate,
    handleCreateSubmit,
    isPending,
  } = useCreateInvoiceForm({ onClose });

  return (
    <form onSubmit={handleCreateSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {t('company.fsm.invoices.createModal.fields.intervention')}
        </label>
        <select
          required
          value={interventionId}
          onChange={(e) => setInterventionId(e.target.value)}
          className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
        >
          <option value="">{t('company.fsm.invoices.createModal.fields.interventionPlaceholder')}</option>
          {interventions?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.number} — {item.customer?.fullName} ({item.type})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-relaxed">
          {t('company.fsm.invoices.createModal.fields.interventionHint')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.invoices.createModal.fields.tvaRate')}
          </label>
          <select
            value={tvaRate}
            onChange={(e) => {
              setTvaRate(Number(e.target.value));
            }}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          >
            <option value="20">{t('company.fsm.invoices.createModal.tvaOptions.standard20')}</option>
            <option value="8">{t('company.fsm.invoices.createModal.tvaOptions.reduced8')}</option>
            <option value="0">{t('company.fsm.invoices.createModal.tvaOptions.exempt0')}</option>
          </select>
          {activeCompany && !activeCompany.isTvaPayer && (
            <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-relaxed">
              {t('company.fsm.invoices.createModal.tvaOptions.nonPayerHint', {
                defaultValue:
                  'Compania nu este înregistrată ca plătitor TVA — implicit 0%.',
              })}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.invoices.createModal.fields.dueDate')}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 cursor-pointer"
        >
          {t('cabinet.common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t('company.fsm.invoices.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
