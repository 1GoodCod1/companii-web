import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, ChevronRight, Plus, Sparkles } from 'lucide-react';
import {
  PageHero,
  Panel,
  EmptyState,
  SkeletonPage,
  cabinetBtnPrimary,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useEstimateProjectsQuery } from '@/features/estimates/api/useEstimates';
import {
  ESTIMATE_STATUS_TONES,
} from '@/constants/estimates.constants';
import { estimateStatusLabel } from '@/utils/i18nStatusLabels';

export function CompanyEstimatesPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useEstimateProjectsQuery();

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <PageHero
          title={t('company.estimatesPage.title')}
          description={t('company.estimatesPage.description')}
          action={
            <Link to="/company/smete/new" className={cabinetBtnPrimary}>
              <Plus className="w-4 h-4" />
              {t('company.estimatesPage.newBtn')}
            </Link>
          }
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Panel className="p-5 bg-gradient-to-br from-violet-50 to-white border-violet-100">
            <Sparkles className="w-5 h-5 text-violet-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureCategories')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureCategoriesHint')}</p>
          </Panel>
          <Panel className="p-5 bg-gradient-to-br from-sky-50 to-white border-sky-100">
            <Calculator className="w-5 h-5 text-sky-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureAutoCalc')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureAutoCalcHint')}</p>
          </Panel>
          <Panel className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <ChevronRight className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="font-bold text-gray-900">{t('company.estimatesPage.featureExecution')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('company.estimatesPage.featureExecutionHint')}</p>
          </Panel>
        </div>

        <Panel>
          {isLoading ? (
            <SkeletonPage rows={6} />
          ) : !projects?.length ? (
            <EmptyState
              message={t('company.estimatesPage.empty')}
              action={
                <Link to="/company/smete/new" className={cabinetBtnPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('company.estimatesPage.newBtn')}
                </Link>
              }
            />
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
                    <th className="px-6 py-3" />
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
                        <Link
                          to={`/company/smete/${project.id}`}
                          className="inline-flex items-center gap-1 text-violet-600 font-semibold hover:text-violet-700"
                        >
                          {t('company.estimatesPage.open')} <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </CompanyManagementGate>
  );
}
