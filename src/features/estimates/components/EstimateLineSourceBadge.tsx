import { useTranslation } from 'react-i18next';

const STYLES: Record<string, string> = {
  rule: 'bg-violet-50 text-violet-700 ring-violet-100',
  manual: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'stage-default': 'bg-slate-100 text-slate-500 ring-slate-200',
  'custom-total-override': 'bg-amber-50 text-amber-700 ring-amber-100',
  actual: 'bg-sky-50 text-sky-700 ring-sky-100',
};

type Props = {
  source?: string;
};

export function EstimateLineSourceBadge({ source }: Props) {
  const { t } = useTranslation();
  if (!source) return null;
  const cls = STYLES[source] ?? STYLES['stage-default'];
  const label = t(`company.estimateWizard.lineSource.${source}`, {
    defaultValue: source,
  });
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${cls}`}
      title={label}
    >
      {label}
    </span>
  );
}
