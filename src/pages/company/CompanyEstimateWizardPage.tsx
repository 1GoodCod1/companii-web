import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, MegaphoneIcon } from '@phosphor-icons/react';
import { SkeletonForm } from '@/widgets/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies';
import { useEstimateProjectQuery } from '@/features/estimates';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import {
  ExistingEstimateWizard,
  EstimateDevNoticeBanner,
  EstimateFeedbackModal,
  getEstimateWizardRemountKey,
  NewEstimateForm,
} from '@/features/estimates';

export function CompanyEstimateWizardPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const { companyMe, activeCompanyId } = useCompanyPermissions();
  const activeCompany = useMemo(() => {
    return resolveActiveCompany(companyMe, activeCompanyId).company;
  }, [companyMe, activeCompanyId]);

  const { data: project, isLoading } = useEstimateProjectQuery(isNew ? '' : id!);

  if (!isNew && isLoading) {
    return <SkeletonForm fields={6} />;
  }

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/company/smete"
              title={t('company.estimateWizardPage.backToList')}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-violet-200 hover:text-violet-600"
            >
              <ArrowLeftIcon className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg sm:text-xl font-black tracking-tight text-gray-900">
                {isNew
                  ? t('company.estimateWizardPage.newTitle')
                  : project?.title ?? t('company.estimateWizardPage.defaultTitle')}
              </h1>
              <p className="truncate text-xs text-gray-400 mt-0.5">
                {isNew
                  ? t('company.estimateWizardPage.newDescription')
                  : `${project?.number ?? ''} · ${project?.category.name ?? ''} · ${project ? estimateStatusLabel(project.status, t) : ''}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="inline-flex items-center justify-center rounded-none border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors cursor-pointer"
            title={t('company.devNotice.feedbackBtn')}
          >
            <MegaphoneIcon className="size-4" />
          </button>
        </div>

        <EstimateDevNoticeBanner />

        {isNew ? (
          <NewEstimateForm activeCompany={activeCompany} />
        ) : project ? (
          <ExistingEstimateWizard key={getEstimateWizardRemountKey(project)} project={project} />
        ) : null}

        {feedbackOpen && (
          <EstimateFeedbackModal
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            projectId={isNew ? undefined : id}
          />
        )}
      </div>
    </CompanyManagementGate>
  );
}
