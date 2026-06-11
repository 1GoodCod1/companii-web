import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpenIcon, CalendarIcon, StackIcon, ListChecksIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import {
  Panel,
  EmptyState,
  SkeletonPage,
  cabinetBtnPrimary,
} from '@/widgets/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies';
import {
  useEstimateTemplatesQuery,
  useDeleteEstimateTemplateMutation,
} from '@/features/estimates';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

export function CompanyTemplatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: templates, isLoading } = useEstimateTemplatesQuery();
  const deleteTemplate = useDeleteEstimateTemplateMutation();
  const { ask, dialog } = useCabinetConfirmDialog();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (id: string, name: string) => {
    ask({
      title: t('company.estimatesTemplatesPage.deleteModalTitle'),
      confirmLabel: t('company.estimatesTemplatesPage.confirmDeleteBtn'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.estimatesTemplatesPage.confirmDelete', { name })}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteTemplate.mutateAsync(id);
          toast.success(t('company.estimatesTemplatesPage.deleted'));
        } catch {
          toast.error(t('company.estimatesTemplatesPage.deleteError'));
        }
      },
    });
  };

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative min-w-[220px] flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Căutare șablon..."
              aria-label="Căutare șablon"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/company/smete/new')}
            className={cabinetBtnPrimary}
          >
            <PlusIcon className="size-4" />
            {t('company.estimatesTemplatesPage.newBtn')}
          </button>
        </div>

        <Panel>
          {isLoading ? (
            <SkeletonPage rows={6} />
          ) : !templates?.length ? (
            <EmptyState message={t('company.estimatesTemplatesPage.empty')} />
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              Niciun șablon găsit pentru criteriul de căutare.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {filteredTemplates.map((template) => {
                const stageCount = template.stages?.length ?? 0;
                const lineCount =
                  template.stages?.reduce(
                    (acc, s) => acc + (s.lines?.length ?? 0),
                    0,
                  ) ?? 0;

                return (
                  <div
                    key={template.id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-white/20 bg-white/70 shadow-xs backdrop-blur-md transition-all hover:translate-y-[-2px] hover:border-violet-200/50 hover:bg-white/90 hover:shadow-lg p-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
                          <BookOpenIcon className="size-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(template.id, template.name)}
                          className="rounded-xl p-1.5 text-violet-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-gray-900 group-hover:text-violet-700 transition-colors leading-snug">
                          {template.name}
                        </h4>
                        {template.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-4 pt-4 border-t border-gray-100/50">
                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                        <div className="flex items-center gap-1.5 bg-gray-50/50 px-2.5 py-1.5 rounded-xl border border-gray-100/30">
                          <StackIcon className="size-3.5 text-violet-500/80" />
                          <span>{t('company.estimatesTemplatesPage.stages', { count: stageCount })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50/50 px-2.5 py-1.5 rounded-xl border border-gray-100/30">
                          <ListChecksIcon className="size-3.5 text-violet-500/80" />
                          <span>{t('company.estimatesTemplatesPage.lines', { count: lineCount })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {new Date(template.createdAt).toLocaleDateString('ro-MD')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/company/smete/new?templateId=${template.id}`)}
                        className={`${cabinetBtnPrimary} w-full text-xs font-bold py-2`}
                      >
                        {t('company.estimatesTemplatesPage.apply')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {dialog}
      </div>
    </CompanyManagementGate>
  );
}
