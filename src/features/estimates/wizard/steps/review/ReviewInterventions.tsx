import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Panel } from '@/widgets/cabinet/cabinet-ui';
import type { EstimateProjectDto } from '@/entities/estimate/model/estimates';

type ReviewInterventionsProps = {
  project: EstimateProjectDto;
};

export function ReviewInterventions({ project }: ReviewInterventionsProps) {
  const { t } = useTranslation();

  if (project.status !== 'IN_EXECUTION' || !project.interventions?.length) {
    return null;
  }

  return (
    <Panel className="p-6 border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-teal-50/40 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse" />
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
          {t('company.estimateWizard.reviewStep.executionTitle', { defaultValue: 'Deviz în Execuție (FSM)' })}
        </h3>
      </div>
      <p className="text-xs text-slate-500">
        {t('company.estimateWizard.reviewStep.executionDescription', {
          defaultValue: 'Lucrările pentru acest deviz au fost planificate și sunt în proces de execuție. Mai jos găsiți fișele de execuție active:',
        })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.interventions.map((intervention) => (
          <div key={intervention.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs flex flex-col justify-between gap-3 hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900">#{intervention.number}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border",
                  intervention.status === 'DONE'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : intervention.status === 'CANCELLED'
                      ? 'bg-rose-50 border-rose-100 text-rose-700'
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                )}>
                  {intervention.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-bold mt-1.5 capitalize">
                {intervention.type}
              </p>
              {intervention.technician?.fullName && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('company.calendar.technician', { defaultValue: 'Master' })}: <span className="text-slate-700 font-extrabold">{intervention.technician.fullName}</span>
                </p>
              )}
              {intervention.scheduledAt && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('company.calendar.scheduledAt', { defaultValue: 'Planificat' })}: <span className="text-slate-700 font-extrabold">{new Date(intervention.scheduledAt).toLocaleDateString('ro-MD')}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50 mt-2">
              <Link
                to={`/company/lucrari/${intervention.id}/fisa`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('company.estimateWizard.reviewStep.worksheetLink', { defaultValue: 'Fișă de execuție' })}
              </Link>
              <Link
                to={`/company/lucrari?selectedId=${intervention.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {t('company.estimateWizard.reviewStep.detailsLink', { defaultValue: 'Detalii' })}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
