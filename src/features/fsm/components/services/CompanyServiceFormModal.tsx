import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { DURATION_UNIT_OPTIONS } from '@/constants/services.constants';
import type { ServiceFormState } from '@/types/serviceForm';

export function CompanyServiceFormModal({
  open,
  editing,
  form,
  defaultCategoryName,
  canUseInternalPricing,
  onClose,
  onSubmit,
  onFormChange,
}: {
  open: boolean;
  editing: boolean;
  form: ServiceFormState;
  defaultCategoryName: string;
  canUseInternalPricing: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (updater: (prev: ServiceFormState) => ServiceFormState) => void;
}) {
  return (
    <AppModal open={open} onClose={onClose} title={editing ? 'Editează serviciu' : 'Serviciu nou'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className={cabinetLabelClass}>
          Denumire *
          <input
            value={form.name}
            onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))}
            className={cabinetFieldClass}
            required
          />
        </label>
        <label className={cabinetLabelClass}>
          Descriere (opțional)
          <textarea
            value={form.description}
            onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
            className={cabinetFieldClass}
            rows={3}
          />
        </label>
        <div className={cabinetLabelClass}>
          Categorie
          <input
            value={defaultCategoryName}
            className={`${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed`}
            readOnly
            tabIndex={-1}
          />
          <p className="text-[11px] font-medium text-gray-400 mt-1">
            Moștenită din profilul companiei — se modifică doar acolo.
          </p>
        </div>
        <label className={cabinetLabelClass}>
          Preț (MDL) *
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.defaultPrice}
            onChange={(e) => onFormChange((f) => ({ ...f, defaultPrice: e.target.value }))}
            className={cabinetFieldClass}
            required
          />
        </label>
        <div className={cabinetLabelClass}>
          Durată (opțional)
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              min={1}
              step={1}
              value={form.durationValue}
              onChange={(e) => onFormChange((f) => ({ ...f, durationValue: e.target.value }))}
              className={cabinetFieldClass}
              placeholder="Ex: 2"
            />
            <select
              value={form.durationUnit}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, durationUnit: e.target.value as ServiceFormState['durationUnit'] }))
              }
              className={cabinetSelectClass}
            >
              {DURATION_UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => onFormChange((f) => ({ ...f, isPublished: e.target.checked }))}
            className="rounded border-gray-300"
          />
          Public pe profilul companiei
        </label>
        {canUseInternalPricing ? (
          <label className={cabinetLabelClass}>
            Cost materiale (opțional)
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.materialsCost}
              onChange={(e) => onFormChange((f) => ({ ...f, materialsCost: e.target.value }))}
              className={cabinetFieldClass}
            />
          </label>
        ) : (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
            Cost materiale pentru devize — disponibil din planul Pro.
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" className={cabinetBtnPrimary}>
            {editing ? 'Salvează' : 'Adaugă'}
          </button>
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            Anulează
          </button>
        </div>
      </form>
    </AppModal>
  );
}
