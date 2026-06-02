import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import { AppSelect, cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
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

  const interventionOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.invoices.createModal.fields.interventionPlaceholder') },
      ...(interventions?.map((item) => ({
        value: item.id,
        label: `${item.number} — ${item.customer?.fullName} (${item.type})`,
      })) ?? []),
    ],
    [interventions, t],
  );

  const tvaRateOptions = useMemo(
    () => [
      { value: '20', label: t('company.fsm.invoices.createModal.tvaOptions.standard20') },
      { value: '8', label: t('company.fsm.invoices.createModal.tvaOptions.reduced8') },
      { value: '0', label: t('company.fsm.invoices.createModal.tvaOptions.exempt0') },
    ],
    [t],
  );

  return (
    <form onSubmit={handleCreateSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {t('company.fsm.invoices.createModal.fields.intervention')}
        </label>
        <AppSelect
          value={interventionId}
          onChange={setInterventionId}
          options={interventionOptions}
          aria-label={t('company.fsm.invoices.createModal.fields.intervention')}
        />
        <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-relaxed">
          {t('company.fsm.invoices.createModal.fields.interventionHint')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.invoices.createModal.fields.tvaRate')}
          </label>
          <AppSelect
            value={String(tvaRate)}
            onChange={(value) => setTvaRate(Number(value))}
            options={tvaRateOptions}
            aria-label={t('company.fsm.invoices.createModal.fields.tvaRate')}
          />
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
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('cabinet.common.cancel')}
        </button>
        <button type="submit" disabled={isPending} className={cabinetBtnPrimary}>
          {t('company.fsm.invoices.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
