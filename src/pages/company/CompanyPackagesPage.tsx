import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import {
  PageHero,
  EmptyState,
  SoftBadge,
  cabinetPanelClass,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetSelectClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import {
  useCompanyPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  type ServicePackageDto,
} from '@/features/packages/api/usePackages';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';

const emptyForm = {
  title: '',
  description: '',
  categoryId: '',
  price: '',
  durationMinutes: '60',
  paymentMode: 'ON_SITE' as 'PREPAID' | 'ON_SITE',
  isPublished: false,
};

export function CompanyPackagesPage() {
  const { data: packages, isLoading } = useCompanyPackagesQuery();
  const { data: categories } = useCategoriesQuery();
  const createPackage = useCreatePackageMutation();
  const updatePackage = useUpdatePackageMutation();
  const deletePackage = useDeletePackageMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (pkg: ServicePackageDto) => {
    setEditingId(pkg.id);
    setForm({
      title: pkg.title,
      description: pkg.description,
      categoryId: pkg.category?.id ?? '',
      price: String(pkg.price),
      durationMinutes: String(pkg.durationMinutes),
      paymentMode: pkg.paymentMode,
      isPublished: pkg.isPublished,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.categoryId) {
      toast.error('Completați titlul și categoria.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      price: Number(form.price || 0),
      durationMinutes: Number(form.durationMinutes || 60),
      paymentMode: form.paymentMode,
      isPublished: form.isPublished,
    };

    try {
      if (editingId) {
        await updatePackage.mutateAsync({ id: editingId, ...payload });
        toast.success('Pachetul a fost actualizat!');
      } else {
        await createPackage.mutateAsync(payload);
        toast.success('Pachetul a fost creat!');
      }
      setShowModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut salva pachetul.');
    }
  };

  const handleDelete = async (pkg: ServicePackageDto) => {
    if (!window.confirm(`Ștergeți pachetul „${pkg.title}”?`)) return;
    try {
      await deletePackage.mutateAsync(pkg.id);
      toast.success('Pachetul a fost șters.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut șterge pachetul.');
    }
  };

  return (
    <CompanyManagementGate>
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title="Pachete servicii"
        description="Creați pachete fixe pentru clienți: preț, durată, plată la fața locului sau online."
        action={
          <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
            + Pachet nou
          </button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-gray-400">Se încarcă pachetele...</p>
      ) : !packages?.length ? (
        <EmptyState
          message="Nu aveți pachete create încă."
          action={
            <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
              Creează primul pachet
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {(packages ?? []).map((pkg: ServicePackageDto) => (
            <article key={pkg.id} className={cn(cabinetPanelClass, 'p-6 flex flex-col')}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-base">{pkg.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{pkg.category?.name}</p>
                </div>
                <SoftBadge tone={pkg.isPublished ? 'emerald' : 'gray'}>
                  {pkg.isPublished ? 'Publicat' : 'Draft'}
                </SoftBadge>
              </div>

              <p className="text-sm text-gray-600 flex-1 mb-4 line-clamp-3">{pkg.description}</p>

              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div className="rounded-2xl bg-slate-50/80 px-3 py-3">
                  <p className="text-[10px] font-medium text-gray-400">Preț</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {Number(pkg.price)} {pkg.currency || 'MDL'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 px-3 py-3">
                  <p className="text-[10px] font-medium text-gray-400">Durată</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pkg.durationMinutes} min</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 px-3 py-3">
                  <p className="text-[10px] font-medium text-gray-400">Plată</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {pkg.paymentMode === 'PREPAID' ? 'Online' : 'La fața locului'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(pkg)} className={`flex-1 ${cabinetBtnSecondary}`}>
                  Editează
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AppModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editează pachet servicii' : 'Pachet servicii nou'}
        size="xl"
        backgroundIndex={2}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>Titlu *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className={cabinetFieldClass}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Categorie *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className={cabinetSelectClass}
              >
                <option value="">Alege categoria...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={cabinetLabelClass}>Descriere</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className={`${cabinetFieldClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={cabinetLabelClass}>Preț (MDL)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className={`${cabinetFieldClass} font-semibold`}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Durată (min)</label>
              <input
                type="number"
                min="15"
                value={form.durationMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                className={`${cabinetFieldClass} font-semibold`}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Mod plată</label>
              <select
                value={form.paymentMode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMode: e.target.value as 'PREPAID' | 'ON_SITE',
                  }))
                }
                className={cabinetSelectClass}
              >
                <option value="ON_SITE">La fața locului</option>
                <option value="PREPAID">Online / preplată</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer"
            />
            Publică pachetul în catalog
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className={cabinetBtnSecondary}>
              Anulează
            </button>
            <button
              type="submit"
              disabled={createPackage.isPending || updatePackage.isPending}
              className={cabinetBtnPrimary}
            >
              {createPackage.isPending || updatePackage.isPending ? 'Se salvează...' : 'Salvează pachetul'}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
    </CompanyManagementGate>
  );
}
