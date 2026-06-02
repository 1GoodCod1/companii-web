import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AppModal } from '@/shared/ui/AppModal';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  buildCatalogTranslations,
  readCatalogRuName,
} from '@/shared/utils/catalogTranslations';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useAdminCitiesQuery,
  useCreateAdminCityMutation,
  useUpdateAdminCityMutation,
  useDeleteAdminCityMutation,
  type AdminCityDto,
} from '@/features/admin';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

export function AdminCitiesPage() {
  const { t } = useTranslation();
  const { data: cities, isLoading } = useAdminCitiesQuery();
  const { ask, dialog } = useCabinetConfirmDialog();
  const createCity = useCreateAdminCityMutation();
  const updateCity = useUpdateAdminCityMutation();
  const deleteCity = useDeleteAdminCityMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCityDto | null>(null);
  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [slug, setSlug] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setNameRu('');
    setSlug('');
    setModalOpen(true);
  };

  const openEdit = (city: AdminCityDto) => {
    setEditing(city);
    setName(city.name);
    setNameRu(readCatalogRuName(city.translations));
    setSlug(city.slug);
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error(t('admin.citiesPage.nameRequired'));
      return;
    }

    const translations = buildCatalogTranslations(name, nameRu);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      translations,
    };

    try {
      if (editing) {
        await updateCity.mutateAsync({
          id: editing.id,
          ...payload,
        });
        toast.success(t('admin.citiesPage.toastUpdated'));
      } else {
        await createCity.mutateAsync(payload);
        toast.success(t('admin.citiesPage.toastCreated'));
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  const handleDelete = (city: AdminCityDto) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('admin.citiesPage.confirmDelete', { name: city.name }),
      onConfirm: async () => {
        try {
          await deleteCity.mutateAsync(city.id);
          toast.success(t('admin.citiesPage.toastDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('admin.citiesPage.eyebrow')}
        title={t('admin.citiesPage.title')}
        description={t('admin.citiesPage.description')}
        action={
          <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
            {t('admin.citiesPage.createBtn')}
          </button>
        }
      />

      <Panel>
        <PanelHeader title={t('admin.citiesPage.listTitle')} description={t('admin.citiesPage.listDescription')} />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">{t('cabinet.common.loading')}</p>
        ) : !cities?.length ? (
          <EmptyState
            message={t('admin.citiesPage.empty')}
            action={
              <button type="button" onClick={openCreate} className={cabinetBtnSecondary}>
                {t('admin.citiesPage.emptyAction')}
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">{t('admin.citiesPage.colName')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.citiesPage.colNameRu')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.citiesPage.colSlug')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.citiesPage.colCompanies')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.citiesPage.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{city.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {readCatalogRuName(city.translations) || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{city.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{city._count?.companies ?? 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" onClick={() => openEdit(city)} className={cabinetBtnSecondary}>
                        {t('cabinet.common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(city)}
                        disabled={(city._count?.companies ?? 0) > 0 || deleteCity.isPending}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        {t('cabinet.common.delete')}
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
        title={editing ? t('admin.citiesPage.modalEdit') : t('admin.citiesPage.modalCreate')}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className={cabinetLabelClass}>{t('admin.citiesPage.nameLabel')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cabinetFieldClass}
            />
          </div>
          <div>
            <label className={cabinetLabelClass}>{t('admin.citiesPage.nameRuLabel')}</label>
            <input
              type="text"
              placeholder="ex: Кишинёв"
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value)}
              className={cabinetFieldClass}
            />
          </div>
          <div>
            <label className={cabinetLabelClass}>{t('admin.citiesPage.slugLabel')}</label>
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
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createCity.isPending || updateCity.isPending}
              className={cabinetBtnPrimary}
            >
              {editing ? t('cabinet.common.save') : t('cabinet.common.create')}
            </button>
          </div>
        </form>
      </AppModal>
      {dialog}
    </div>
  );
}
