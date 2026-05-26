import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { useCustomersQuery } from '@/features/fsm/api/useCustomers';
import {
  useCreateEstimateProjectMutation,
  useEstimateBlueprintsQuery,
} from '@/features/estimates/api/useEstimates';
import type { OwnedCompanyDto } from '@/types/companies';
import { getErrorMessage } from '@/utils/errors';

type Props = {
  activeCompany: OwnedCompanyDto | null | undefined;
};

export function NewEstimateForm({ activeCompany }: Props) {
  const navigate = useNavigate();
  const { data: categories } = useCategoriesQuery();
  const { data: blueprints } = useEstimateBlueprintsQuery();
  const { data: customers } = useCustomersQuery();
  const createProject = useCreateEstimateProjectMutation();

  const [customerId, setCustomerId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [title, setTitle] = useState('');

  const categoryId = activeCompany?.categoryId ?? selectedCategoryId;

  const activeBlueprint = useMemo(() => {
    if (!categoryId) return null;
    return blueprints?.find((bp) => bp.category.id === categoryId) ?? null;
  }, [blueprints, categoryId]);

  const handleCreate = async () => {
    if (!customerId || !categoryId) {
      toast.error('Selectați clientul și categoria.');
      return;
    }
    try {
      const created = await createProject.mutateAsync({
        customerId,
        categoryId,
        title: title || undefined,
        siteType: 'apartment',
      });
      toast.success('Smetă creată.');
      navigate(`/company/smete/${created.id}`, { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut crea smeta.'));
    }
  };

  return (
    <Panel className="p-6 max-w-2xl">
      <div className="space-y-4">
        <label className={cabinetLabelClass}>
          Client
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={cabinetSelectClass}>
            <option value="">Selectați clientul</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} · {c.phone}
              </option>
            ))}
          </select>
        </label>

        {activeCompany?.categoryId ? (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest">
              Categorie de lucru (Auto-Detectată)
            </span>
            <p className="font-extrabold text-gray-900 text-sm">
              {categories?.find((c) => c.id === categoryId)?.name || 'Încărcare domeniu...'}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Smeta este configurată automat pentru domeniul companiei tale, blocând utilizarea altor categorii pentru a
              păstra izolarea perfectă și corectitudinea proceselor.
            </p>
          </div>
        ) : (
          <label className={cabinetLabelClass}>
            Categorie lucrare
            <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className={cabinetSelectClass}>
              <option value="">Selectați categoria</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {categoryId && activeBlueprint && (
          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-sm text-violet-900">
            <p className="font-bold">{activeBlueprint.name}</p>
            <p className="mt-1 text-violet-700/80">
              {activeBlueprint.config.defaultStages.length} etape · plan personalizat pentru această categorie
            </p>
          </div>
        )}

        <label className={cabinetLabelClass}>
          Titlu (opțional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cabinetFieldClass}
            placeholder="Ex: Renovare baie"
          />
        </label>

        <button type="button" onClick={handleCreate} disabled={createProject.isPending} className={cabinetBtnPrimary}>
          Creează smetă <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Panel>
  );
}
