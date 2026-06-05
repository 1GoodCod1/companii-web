import { useTranslation } from 'react-i18next';
import { TargetIcon } from '@phosphor-icons/react';

const toneClasses = {
  emerald: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
  },
  rose: {
    bar: 'bg-rose-500',
    text: 'text-rose-700',
    bg: 'bg-rose-50/60',
    border: 'border-rose-200',
  },
};

type Props = {
  budget: number | string | null | undefined;
  currentTotal: number;
  compact?: boolean;
};

export function LeadBudgetGauge({ budget, currentTotal, compact }: Props) {
  const { t } = useTranslation();
  const budgetNum = Number(budget);
  if (!Number.isFinite(budgetNum) || budgetNum <= 0) return null;

  const pct = currentTotal > 0 ? (currentTotal / budgetNum) * 100 : 0;
  const clampedPct = Math.min(100, Math.max(0, pct));
  const over = pct > 100;
  const tone = over ? 'rose' : pct > 80 ? 'amber' : 'emerald';

  const c = toneClasses[tone];
  const ns = 'company.estimateWizard.leadBudget';

  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} ${compact ? 'p-3' : 'p-4'} space-y-2`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TargetIcon className={`size-4 ${c.text} shrink-0`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${c.text}`}>
            {t(`${ns}.label`, { defaultValue: 'Buget client' })}
          </span>
        </div>
        <span className={`text-[11px] font-bold ${c.text}`}>
          {currentTotal.toLocaleString('ro-MD')} / {budgetNum.toLocaleString('ro-MD')} MDL
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/80 overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar} transition-all`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      <div className={`text-[10px] font-semibold ${c.text}`}>
        {over
          ? t(`${ns}.over`, {
              pct: Math.round(pct),
              diff: (currentTotal - budgetNum).toLocaleString('ro-MD'),
              defaultValue: 'Depășește bugetul cu {{diff}} MDL ({{pct}}%)',
            })
          : t(`${ns}.within`, {
              pct: Math.round(pct),
              defaultValue: '{{pct}}% din buget folosit',
            })}
      </div>
    </div>
  );
}
