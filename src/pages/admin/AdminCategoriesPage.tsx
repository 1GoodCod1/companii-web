import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import { getErrorMessage } from '@/utils/errors';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  type AdminCategoryDto,
} from '@/features/admin/api/useAdmin';

export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategoriesQuery();
  const createCategory = useCreateAdminCategoryMutation();
  const updateCategory = useUpdateAdminCategoryMutation();
  const deleteCategory = useDeleteAdminCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryDto | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setModalOpen(true);
  };

  const openEdit = (category: AdminCategoryDto) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Introduceți numele categoriei.');
      return;
    }

    try {
      if (editing) {
        await updateCategory.mutateAsync({
          id: editing.id,
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success('Categoria a fost actualizată.');
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success('Categoria a fost creată.');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Operația a eșuat.'));
    }
  };

  const handleDelete = async (category: AdminCategoryDto) => {
    if (!confirm(`Ștergeți categoria „${category.name}”?`)) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success('Categoria a fost ștearsă.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut șterge categoria.'));
    }
  };

  const inUseCount = (category: AdminCategoryDto) =>
    (category._count?.companies ?? 0) + (category._count?.companyServices ?? 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Catalog"
        title="Categorii servicii"
        description="Gestionați domeniile de activitate disponibile pe platformă."
        action={
          <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
            + Categorie nouă
          </button>
        }
      />

      <Panel>
        <PanelHeader
          title="Lista categoriilor"
          description="Folosite la profilul companiilor și pachetele de servicii."
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Se încarcă...</p>
        ) : !categories?.length ? (
          <EmptyState
            message="Nu există categorii în catalog."
            action={
              <button type="button" onClick={openCreate} className={cabinetBtnSecondary}>
                Adaugă prima categorie
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Nume</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Utilizări</th>
                  <th className="px-4 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{inUseCount(category)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" onClick={() => openEdit(category)} className={cabinetBtnSecondary}>
                        Editează
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(category)}
                        disabled={inUseCount(category) > 0 || deleteCategory.isPending}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        Șterge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editează categorie' : 'Categorie nouă'}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className={cabinetLabelClass}>Nume *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cabinetFieldClass}
            />
          </div>
          <div>
            <label className={cabinetLabelClass}>Slug (opțional)</label>
            <input
              type="text"
              placeholder="ex: santehnika"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={cabinetFieldClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={cabinetBtnSecondary}>
              Anulează
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className={cabinetBtnPrimary}
            >
              {editing ? 'Salvează' : 'Creează'}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
