import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHero } from '@/components/cabinet/cabinet-ui';
import { CompanyManagementGate } from '@/features/companies/CompanyManagementGate';
import { useEstimateProjectQuery } from '@/features/estimates/api/useEstimates';
import { ESTIMATE_STATUS_LABELS } from '@/constants/estimates.constants';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { resolveActiveCompany } from '@/features/companies/resolveActiveCompany';
import { ExistingEstimateWizard } from '@/features/estimates/wizard/ExistingEstimateWizard';
import { NewEstimateForm } from '@/features/estimates/wizard/NewEstimateForm';

export function CompanyEstimateWizardPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';

  const { companyMe, activeCompanyId } = useCompanyPermissions();
  const activeCompany = useMemo(() => {
    return resolveActiveCompany(companyMe, activeCompanyId).company;
  }, [companyMe, activeCompanyId]);

  const { data: project, isLoading } = useEstimateProjectQuery(isNew ? '' : id!);

  if (!isNew && isLoading) {
    return <p className="p-8 text-sm text-gray-400">Se încarcă smeta...</p>;
  }

  return (
    <CompanyManagementGate>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to="/company/smete" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-600">
            <ArrowLeft className="w-4 h-4" /> Înapoi la listă
          </Link>
        </div>

        <PageHero
          title={isNew ? 'Smetă nouă' : project?.title ?? 'Smetă'}
          description={
            isNew
              ? 'Alegeți categoria — fiecare tip de lucrare are propriul plan și etape.'
              : `${project?.number ?? ''} · ${project?.category.name ?? ''} · ${project ? ESTIMATE_STATUS_LABELS[project.status] : ''}`
          }
        />

        {isNew ? (
          <NewEstimateForm activeCompany={activeCompany} />
        ) : project ? (
          <ExistingEstimateWizard key={project.id} project={project} />
        ) : null}
      </div>
    </CompanyManagementGate>
  );
}
