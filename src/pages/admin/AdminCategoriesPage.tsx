import { useReducer } from 'react';
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
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  type AdminCategoryDto,
} from '@/features/admin';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

type CategoryForm = {
  modalOpen: boolean;
  editing: AdminCategoryDto | null;
  name: string;
  nameRu: string;
  slug: string;
};

type CategoryFormAction =
  | { type: 'openCreate' }
  | { type: 'openEdit'; category: AdminCategoryDto }
  | { type: 'close' }
  | { type: 'field'; field: 'name' | 'nameRu' | 'slug'; value: string };

const EMPTY_CATEGORY_FORM: CategoryForm = { modalOpen: false, editing: null, name: '', nameRu: '', slug: '' };

function categoryFormReducer(state: CategoryForm, action: CategoryFormAction): CategoryForm {
  switch (action.type) {
    case 'openCreate':
      return { ...EMPTY_CATEGORY_FORM, modalOpen: true };
    case 'openEdit':
      return {
        modalOpen: true,
        editing: action.category,
        name: action.category.name,
        nameRu: readCatalogRuName(action.category.translations),
        slug: action.category.slug,
      };
    case 'close':
      return { ...state, modalOpen: false };
    case 'field':
      return { ...state, [action.field]: action.value };
  }
}

const inUseCount = (category: AdminCategoryDto) =>
  (category._count?.companies ?? 0) + (category._count?.companyServices ?? 0);

export function AdminCategoriesPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useAdminCategoriesQuery();
  const createCategory = useCreateAdminCategoryMutation();
  const updateCategory = useUpdateAdminCategoryMutation();
  const deleteCategory = useDeleteAdminCategoryMutation();
  const { ask, dialog } = useCabinetConfirmDialog();

  const [form, dispatch] = useReducer(categoryFormReducer, EMPTY_CATEGORY_FORM);
  const { modalOpen, editing, name, nameRu, slug } = form;

  const openCreate = () => dispatch({ type: 'openCreate' });
  const openEdit = (category: AdminCategoryDto) => dispatch({ type: 'openEdit', category });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error(t('admin.categoriesPage.nameRequired'));
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
        await updateCategory.mutateAsync({
          id: editing.id,
          ...payload,
        });
        toast.success(t('admin.categoriesPage.toastUpdated'));
      } else {
        await createCategory.mutateAsync(payload);
        toast.success(t('admin.categoriesPage.toastCreated'));
      }
      dispatch({ type: 'close' });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
    }
  };

  const handleDelete = (category: AdminCategoryDto) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('admin.categoriesPage.confirmDelete', { name: category.name }),
      onConfirm: async () => {
        try {
          await deleteCategory.mutateAsync(category.id);
          toast.success(t('admin.categoriesPage.toastDeleted'));
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('cabinet.common.operationFailed')));
        }
      },
    });
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('admin.categoriesPage.eyebrow')}
        title={t('admin.categoriesPage.title')}
        description={t('admin.categoriesPage.description')}
        action={
          <button type="button" onClick={openCreate} className={cabinetBtnPrimary}>
            {t('admin.categoriesPage.createBtn')}
          </button>
        }
      />

      <Panel>
        <PanelHeader
          title={t('admin.categoriesPage.listTitle')}
          description={t('admin.categoriesPage.listDescription')}
        />

        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">{t('cabinet.common.loading')}</p>
        ) : !categories?.length ? (
          <EmptyState
            message={t('admin.categoriesPage.empty')}
            action={
              <button type="button" onClick={openCreate} className={cabinetBtnSecondary}>
                {t('admin.categoriesPage.emptyAction')}
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">{t('admin.categoriesPage.colName')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.categoriesPage.colNameRu')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.categoriesPage.colSlug')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.categoriesPage.colUsage')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.categoriesPage.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {readCatalogRuName(category.translations) || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{inUseCount(category)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button type="button" onClick={() => openEdit(category)} className={cabinetBtnSecondary}>
                        {t('cabinet.common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(category)}
                        disabled={inUseCount(category) > 0 || deleteCategory.isPending}
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
        onClose={() => dispatch({ type: 'close' })}
        title={editing ? t('admin.categoriesPage.modalEdit') : t('admin.categoriesPage.modalCreate')}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className={cabinetLabelClass}>{t('admin.categoriesPage.nameLabel')}</label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => dispatch({ type: 'field', field: 'name', value: e.target.value })}
              className={cabinetFieldClass}
            />
          </div>
          <div>
            <label htmlFor="cat-name-ru" className={cabinetLabelClass}>{t('admin.categoriesPage.nameRuLabel')}</label>
            <input
              id="cat-name-ru"
              type="text"
              placeholder="ex: Сантехника"
              value={nameRu}
              onChange={(e) => dispatch({ type: 'field', field: 'nameRu', value: e.target.value })}
              className={cabinetFieldClass}
            />
          </div>
          <div>
            <label htmlFor="cat-slug" className={cabinetLabelClass}>{t('admin.categoriesPage.slugLabel')}</label>
            <input
              id="cat-slug"
              type="text"
              placeholder="ex: santehnika"
              value={slug}
              onChange={(e) => dispatch({ type: 'field', field: 'slug', value: e.target.value })}
              className={cabinetFieldClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => dispatch({ type: 'close' })} className={cabinetBtnSecondary}>
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
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
