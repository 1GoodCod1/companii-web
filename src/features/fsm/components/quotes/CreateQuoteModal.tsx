import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/shared/ui/AppModal';
import { AppSelect, cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
import type { CompanyServiceDto, CustomerDto } from '@/entities/fsm/model/types';
import { useCreateQuoteForm } from './hooks/useCreateQuoteForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateQuoteModal({ open, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('company.fsm.quotes.createModal.title')}
      size="xl"
    >
      {open ? <CreateQuoteForm onClose={onClose} /> : null}
    </AppModal>
  );
}

function CreateQuoteForm({ onClose }: Pick<Props, 'onClose'>) {
  const { t } = useTranslation();
  const {
    customers,
    services,
    customerId,
    setCustomerId,
    validUntil,
    setValidUntil,
    lines,
    catalogServiceId,
    setCatalogServiceId,
    handleAddLine,
    handleAddFromCatalog,
    handleRemoveLine,
    handleLineChange,
    calculateTotal,
    handleCreateSubmit,
    isPending,
  } = useCreateQuoteForm({ onClose });

  const customerOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.quotes.createModal.fields.customerPlaceholder') },
      ...(customers?.map((c: CustomerDto) => ({ value: c.id, label: c.fullName })) ?? []),
    ],
    [customers, t],
  );

  const catalogServiceOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.quotes.createModal.lines.catalogPlaceholder') },
      ...(services?.map((service: CompanyServiceDto) => ({
        value: service.id,
        label: `${service.name} — ${Number(service.defaultPrice).toLocaleString('ro-MD')} MDL`,
      })) ?? []),
    ],
    [services, t],
  );

  return (
    <form onSubmit={handleCreateSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.quotes.createModal.fields.customer')}
          </label>
          <AppSelect
            value={customerId}
            onChange={setCustomerId}
            options={customerOptions}
            aria-label={t('company.fsm.quotes.createModal.fields.customer')}
          />
        </div>
        <div>
          <label htmlFor="quote-valid-until" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.quotes.createModal.fields.validUntil')}
          </label>
          <input
            id="quote-valid-until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center mb-1 gap-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('company.fsm.quotes.createModal.lines.title')}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {services?.length ? (
              <>
                <AppSelect
                  value={catalogServiceId}
                  onChange={setCatalogServiceId}
                  options={catalogServiceOptions}
                  aria-label={t('company.fsm.quotes.createModal.lines.catalogPlaceholder')}
                  className="min-w-[180px]"
                  maxVisibleItems={8}
                />
                <button
                  type="button"
                  onClick={handleAddFromCatalog}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-800 cursor-pointer"
                >
                  {t('company.fsm.quotes.createModal.lines.addFromCatalog')}
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={handleAddLine}
              className="text-xs font-black text-violet-600 hover:text-violet-800 cursor-pointer"
            >
              {t('company.fsm.quotes.createModal.lines.addRow')}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {lines.map((line, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                required
                placeholder={t('company.fsm.quotes.createModal.lines.descriptionPlaceholder')}
                aria-label={t('company.fsm.quotes.createModal.lines.descriptionPlaceholder')}
                value={line.description}
                onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
              />
              <input
                type="number"
                required
                placeholder={t('company.fsm.quotes.createModal.lines.qtyPlaceholder')}
                aria-label={t('company.fsm.quotes.createModal.lines.qtyPlaceholder')}
                min={1}
                value={line.qty}
                onChange={(e) => handleLineChange(index, 'qty', Number(e.target.value))}
                className="w-16 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl p-2 text-xs outline-none transition-all bg-white text-center font-bold"
              />
              <input
                type="number"
                required
                placeholder={t('company.fsm.quotes.createModal.lines.unitPricePlaceholder')}
                aria-label={t('company.fsm.quotes.createModal.lines.unitPricePlaceholder')}
                min={0}
                value={line.unitPrice}
                onChange={(e) => handleLineChange(index, 'unitPrice', Number(e.target.value))}
                className="w-28 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl p-2 text-xs outline-none transition-all bg-white text-right font-bold"
              />
              <button
                type="button"
                onClick={() => handleRemoveLine(index)}
                disabled={lines.length === 1}
                className="text-red-500 hover:text-red-700 disabled:opacity-30 text-sm font-semibold p-1 cursor-pointer"
                title={t('company.fsm.quotes.createModal.lines.removeRow')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold bg-gray-50/50 p-4 rounded-xl border">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {t('company.fsm.quotes.createModal.totalLabel')}
          </span>
          <span className="text-violet-700 font-black text-lg">
            {calculateTotal().toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
          </span>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('cabinet.common.cancel')}
        </button>
        <button type="submit" disabled={isPending} className={cabinetBtnPrimary}>
          {t('company.fsm.quotes.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
