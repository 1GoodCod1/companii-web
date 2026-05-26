import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import type { CatalogOptionDto } from '@/types/companies';
import type { CompanyLeadDto } from '@/types/fsm';

export function ConvertLeadToEstimateModal({
  lead,
  categories,
  categoryId,
  estimateTitle,
  pending,
  onCategoryChange,
  onTitleChange,
  onClose,
  onSubmit,
}: {
  lead: CompanyLeadDto | null;
  categories: CatalogOptionDto[] | undefined;
  categoryId: string;
  estimateTitle: string;
  pending: boolean;
  onCategoryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AppModal open={!!lead} onClose={onClose} title="Convertire în smetă">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Cerere de la <strong>{lead?.contactName}</strong>
        </p>
        <label className={cabinetLabelClass}>
          Categorie smetă *
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cabinetSelectClass}
            required
          >
            <option value="">Selectați categoria...</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className={cabinetLabelClass}>
          Titlu proiect
          <input
            value={estimateTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cabinetFieldClass}
          />
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={pending} className={cabinetBtnPrimary}>
            Creează smeta
          </button>
          <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
            Anulează
          </button>
        </div>
      </form>
    </AppModal>
  );
}
