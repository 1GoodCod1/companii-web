import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CalculatorIcon, CaretRightIcon, PercentIcon, PlusIcon, SparkleIcon, TrashIcon } from '@phosphor-icons/react';
import {
  PageHero,
  Panel,
  EmptyState,
  SkeletonPage,
  cabinetBtnPrimary,
  SoftBadge,
} from '@/widgets/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies';
import {
  useEstimateProjectsQuery,
  useDeleteEstimateProjectMutation,
} from '@/features/estimates';
import {
  ESTIMATE_STATUS_TONES,
} from '@/entities/estimate/model/estimates.constants';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

export function CompanyEstimatesPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useEstimateProjectsQuery();
  const deleteProjectMutation = useDeleteEstimateProjectMutation();
  const { ask, dialog } = useCabinetConfirmDialog();

  const handleDeleteClick = (id: string, number: string) => {
    ask({
      title: t('company.estimatesPage.deleteModalTitle'),
      confirmLabel: t('company.estimatesPage.confirmDeleteBtn'),
      message: (
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('company.estimatesPage.confirmDelete', { number })}
        </p>
      ),
      onConfirm: async () => {
        try {
          await deleteProjectMutation.mutateAsync(id);
          toast.success(t('company.estimatesPage.deleteSuccess'));
        } catch {
          toast.error(t('company.estimatesPage.deleteError'));
        }
      },
    });
  };

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          flat
          title={t('company.estimatesPage.title')}
          description={t('company.estimatesPage.description')}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/company/smete/coeficienti"
                className="inline-flex items-center gap-1.5 rounded-none border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
              >
                <PercentIcon className="size-4" />
                {t('company.estimatesPage.pricingModifiersBtn', { defaultValue: 'Coeficienți de preț' })}
              </Link>
              <Link to="/company/smete/new" className={cabinetBtnPrimary}>
                <PlusIcon className="size-4" />
                {t('company.estimatesPage.newBtn')}
              </Link>
            </div>
          }
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Panel className="p-5 bg-violet-50 border-violet-100">
            <SparkleIcon className="size-5 text-violet-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureCategories')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureCategoriesHint')}</p>
          </Panel>
          <Panel className="p-5 bg-sky-50 border-sky-100">
            <CalculatorIcon className="size-5 text-sky-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureAutoCalc')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureAutoCalcHint')}</p>
          </Panel>
          <Panel className="p-5 bg-emerald-50 border-emerald-100">
            <CaretRightIcon className="size-5 text-emerald-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureExecution')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureExecutionHint')}</p>
          </Panel>
        </div>

        <Panel>
          {isLoading ? (
            <SkeletonPage rows={6} />
          ) : !projects?.length ? (
            <EmptyState message={t('company.estimatesPage.empty')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">{t('company.estimatesPage.colNumber')}</th>
                    <th className="px-6 py-3 text-left">{t('company.estimatesPage.colClient')}</th>
                    <th className="px-6 py-3 text-left">{t('company.estimatesPage.colCategory')}</th>
                    <th className="px-6 py-3 text-left">{t('company.estimatesPage.colStatus')}</th>
                    <th className="px-6 py-3 text-right">{t('company.estimatesPage.colTotal')}</th>
                    <th className="px-6 py-3">
                      <span className="sr-only">
                        {t('company.estimatesPage.colActions', { defaultValue: 'Acțiuni' })}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-violet-50/30">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{project.number}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{project.title}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{project.customer.fullName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {project.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <SoftBadge tone={ESTIMATE_STATUS_TONES[project.status] ?? 'gray'}>
                          {estimateStatusLabel(project.status, t) ?? project.status}
                        </SoftBadge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {Number(project.grandTotal).toLocaleString('ro-MD')} MDL
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <Link
                            to={`/company/smete/${project.id}`}
                            className="inline-flex items-center gap-1 text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                          >
                            {t('company.estimatesPage.open')} <CaretRightIcon className="size-4" />
                          </Link>
                          {project.status !== 'IN_EXECUTION' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(project.id, project.number)}
                              className="text-gray-800 hover:text-rose-700 p-1.5 rounded-lg transition-all cursor-pointer"
                              title={t('company.estimatesPage.confirmDeleteBtn')}
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {dialog}
      </div>
    </CompanyManagementGate>
  );
}
