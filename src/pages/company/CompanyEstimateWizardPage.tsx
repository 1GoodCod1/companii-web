import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, MegaphoneIcon } from '@phosphor-icons/react';
import { PageHero, SkeletonForm } from '@/widgets/cabinet/cabinet-ui';
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
        <div className="flex items-center gap-3">
          <Link to="/company/smete" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-600">
            <ArrowLeftIcon className="size-4" /> {t('company.estimateWizardPage.backToList')}
          </Link>
        </div>

        <PageHero
          title={isNew ? t('company.estimateWizardPage.newTitle') : project?.title ?? t('company.estimateWizardPage.defaultTitle')}
          description={
            isNew
              ? t('company.estimateWizardPage.newDescription')
              : `${project?.number ?? ''} · ${project?.category.name ?? ''} · ${project ? estimateStatusLabel(project.status, t) : ''}`
          }
          action={
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="inline-flex items-center justify-center rounded-none border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors cursor-pointer"
              title={t('company.devNotice.feedbackBtn')}
            >
              <MegaphoneIcon className="size-4" />
            </button>
          }
        />

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
