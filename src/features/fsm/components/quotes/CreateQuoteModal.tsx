import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/ui/AppModal';
import type { CompanyServiceDto, CustomerDto } from '@/types/fsm';
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
      backgroundIndex={4}
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

  return (
    <form onSubmit={handleCreateSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.quotes.createModal.fields.customer')}
          </label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white cursor-pointer font-medium"
          >
            <option value="">{t('company.fsm.quotes.createModal.fields.customerPlaceholder')}</option>
            {customers?.map((c: CustomerDto) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('company.fsm.quotes.createModal.fields.validUntil')}
          </label>
          <input
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
                <select
                  value={catalogServiceId}
                  onChange={(e) => setCatalogServiceId(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                >
                  <option value="">{t('company.fsm.quotes.createModal.lines.catalogPlaceholder')}</option>
                  {services.map((service: CompanyServiceDto) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {Number(service.defaultPrice).toLocaleString('ro-MD')} MDL
                    </option>
                  ))}
                </select>
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
                value={line.description}
                onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                className="flex-1 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-3 py-2 text-xs outline-none transition-all bg-white"
              />
              <input
                type="number"
                required
                placeholder={t('company.fsm.quotes.createModal.lines.qtyPlaceholder')}
                min={1}
                value={line.qty}
                onChange={(e) => handleLineChange(index, 'qty', Number(e.target.value))}
                className="w-16 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-2 py-2 text-xs outline-none transition-all bg-white text-center font-bold"
              />
              <input
                type="number"
                required
                placeholder={t('company.fsm.quotes.createModal.lines.unitPricePlaceholder')}
                min={0}
                value={line.unitPrice}
                onChange={(e) => handleLineChange(index, 'unitPrice', Number(e.target.value))}
                className="w-28 border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl px-2 py-2 text-xs outline-none transition-all bg-white text-right font-bold"
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
          {t('company.fsm.quotes.createModal.submit')}
        </button>
      </div>
    </form>
  );
}
