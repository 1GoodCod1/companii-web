import { CheckCircle2, CircleDashed, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Panel } from '@/widgets/cabinet/cabinet-ui';
import type { EstimateWizardApi } from '../../useEstimateWizard';

type ReviewScopeSummaryProps = {
  scopeSummary: EstimateWizardApi['scopeSummary'];
};

type ScopeEntry = {
  key: string;
  label: string;
  hint: string;
  tone: 'emerald' | 'amber' | 'slate';
};

const SCOPE_TONE: Record<ScopeEntry['tone'], string> = {
  emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-900',
  amber: 'border-amber-100 bg-amber-50/40 text-amber-900',
  slate: 'border-slate-100 bg-slate-50/60 text-slate-700',
};

function ScopeColumn({
  icon,
  title,
  entries,
  emptyMessage,
}: {
  icon: React.ReactNode;
  title: string;
  entries: ScopeEntry[];
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/60 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-700">
        {icon} {title}
      </div>
      {entries.length === 0 ? (
        emptyMessage ? (
          <p className="text-[11px] text-gray-400 italic">{emptyMessage}</p>
        ) : null
      ) : (
        <ul className="space-y-1.5">
          {entries.map((e) => (
            <li
              key={e.key}
              className={`rounded-xl border px-3 py-2 text-xs ${SCOPE_TONE[e.tone]}`}
            >
              <p className="font-semibold">{e.label}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{e.hint}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReviewScopeSummary({ scopeSummary }: ReviewScopeSummaryProps) {
  const { t } = useTranslation();

  const showScope =
    scopeSummary.included.length > 0 ||
    scopeSummary.enabledWithoutLines.length > 0 ||
    scopeSummary.available.length > 0;

  if (!showScope) return null;

  return (
    <Panel className="p-6">
      <h3 className="font-bold text-gray-900 mb-3">
        {t('company.estimateWizard.scopeSummary.title')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <ScopeColumn
          icon={<CheckCircle2 className="size-4 text-emerald-600" />}
          title={t('company.estimateWizard.scopeSummary.included')}
          entries={scopeSummary.included.map((m) => ({
            key: m.key,
            label: m.label,
            hint: t('company.estimateWizard.scopeSummary.moduleLineCount', {
              count: m.lineCount,
              amount: m.amount.toLocaleString('ro-MD'),
            }),
            tone: 'emerald',
          }))}
          emptyMessage={t('company.estimateWizard.scopeSummary.emptyIncluded')}
        />
        <ScopeColumn
          icon={<CircleDashed className="size-4 text-amber-600" />}
          title={t('company.estimateWizard.scopeSummary.enabledWithoutLines')}
          entries={scopeSummary.enabledWithoutLines.map((m) => ({
            key: m.key,
            label: m.label,
            hint:
              m.missingFieldLabels && m.missingFieldLabels.length > 0
                ? t('company.estimateWizard.scopeSummary.moduleMissingFields', {
                    fields: m.missingFieldLabels.join(', '),
                    defaultValue: 'Completați: {{fields}}',
                  })
                : t('company.estimateWizard.scopeSummary.moduleEnabledNoLines'),
            tone: 'amber',
          }))}
        />
        <ScopeColumn
          icon={<PlusCircle className="size-4 text-slate-500" />}
          title={t('company.estimateWizard.scopeSummary.available')}
          entries={scopeSummary.available.map((m) => ({
            key: m.key,
            label: m.label,
            hint: t('company.estimateWizard.scopeSummary.moduleAvailableHint'),
            tone: 'slate',
          }))}
        />
      </div>
    </Panel>
  );
}
