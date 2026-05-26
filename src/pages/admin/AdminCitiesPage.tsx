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
  useAdminCitiesQuery,
  useCreateAdminCityMutation,
  useUpdateAdminCityMutation,
  useDeleteAdminCityMutation,
  type AdminCityDto,
} from '@/features/admin/api/useAdmin';

export function AdminCitiesPage() {
  const { data: cities, isLoading } = useAdminCitiesQuery();
  const createCity = useCreateAdminCityMutation();
  const updateCity = useUpdateAdminCityMutation();
  const deleteCity = useDeleteAdminCityMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCityDto | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setModalOpen(true);
  };

  const openEdit = (city: AdminCityDto) => {
    setEditing(city);
    setName(city.name);
    setSlug(city.slug);
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Introduceți numele orașului.');
      return;
    }

    try {
      if (editing) {
        await updateCity.mutateAsync({
          id: editing.id,
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success('Orașul a fost actualizat.');
      } else {
        await createCity.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
        });
        toast.success('Orașul a fost creat.');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Operația a eșuat.'));
    }
  };

  const handleDelete = async (city: AdminCityDto) => {
    if (!confirm(`Ștergeți orașul „${city.name}”?`)) return;
    try {
      await deleteCity.mutateAsync(city.id);
      toast.success('Orașul a fost șters.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut șterge orașul.'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Catalog"
        title="Orașe"
        description="Gestionați orașele disponibile în catalogul companiilor."
        action={
          <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
            + Oraș nou
          </button>
        }
      />

      <Panel>
        <PanelHeader title="Lista orașelor" description="Folosite la profilul companiilor și filtrare publică." />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Se încarcă...</p>
        ) : !cities?.length ? (
          <EmptyState message="Nu există orașe în catalog." action={<button type="button" onClick={openCreate} className={cabinetBtnSecondary}>Adaugă primul oraș</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Nume</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Companii</th>
                  <th className="px-4 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{city.name}</td>
                    <td className="px-4 py-3 text-gray-500">{city.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{city._count?.companies ?? 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" onClick={() => openEdit(city)} className={cabinetBtnSecondary}>
                        Editează
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(city)}
                        disabled={(city._count?.companies ?? 0) > 0 || deleteCity.isPending}
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

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editează oraș' : 'Oraș nou'}>
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
              placeholder="ex: chisinau"
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
              disabled={createCity.isPending || updateCity.isPending}
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
