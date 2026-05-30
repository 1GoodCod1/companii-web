import { Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EstimateProjectDto } from '@/types/estimates';

type ObjectLeadInfoProps = {
  project: EstimateProjectDto;
};

export function ObjectLeadInfo({ project }: ObjectLeadInfoProps) {
  const { t } = useTranslation();

  if (!project.sourceLead?.estimatedBudget && !project.sourceLead?.serviceTitle) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 p-5 mb-2 shadow-xs flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0">
        <Calculator className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">
          {t('company.estimateWizard.objectStep.leadSourceLabel', {
            defaultValue: 'Cerere client',
          })}
        </p>
        {project.sourceLead?.serviceTitle && (
          <p className="text-sm font-bold text-slate-900 mt-1">
            {project.sourceLead.serviceTitle}
          </p>
        )}
        {project.sourceLead?.estimatedBudget != null && (
          <p className="text-xs font-semibold text-violet-700 mt-0.5">
            {t('company.estimateWizard.objectStep.budgetLabel')}:{' '}
            <span className="text-slate-900 font-black">
              {Number(project.sourceLead.estimatedBudget).toLocaleString('ro-MD')} MDL
            </span>
          </p>
        )}
        {project.sourceLead?.message && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed italic">
            "{project.sourceLead.message}"
          </p>
        )}
      </div>
    </div>
  );
}
