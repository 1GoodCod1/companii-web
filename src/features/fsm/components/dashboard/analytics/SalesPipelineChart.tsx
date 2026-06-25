import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SalesPipelineDto } from '@/entities/fsm/model/analytics';

type PipelineStageKey = keyof SalesPipelineDto;

const STAGE_ORDER: PipelineStageKey[] = ['leads', 'quotes', 'accepted', 'completed', 'paid'];

const STAGE_LABEL_KEYS: Record<PipelineStageKey, string> = {
  leads: 'company.analytics.charts.pipeline.leads',
  quotes: 'company.analytics.charts.pipeline.quotes',
  accepted: 'company.analytics.charts.pipeline.accepted',
  completed: 'company.analytics.charts.pipeline.completed',
  paid: 'company.analytics.charts.pipeline.paid',
};

const STAGE_DESC_KEYS: Record<PipelineStageKey, string> = {
  leads: 'company.analytics.charts.pipeline.stageDesc.leads',
  quotes: 'company.analytics.charts.pipeline.stageDesc.quotes',
  accepted: 'company.analytics.charts.pipeline.stageDesc.accepted',
  completed: 'company.analytics.charts.pipeline.stageDesc.completed',
  paid: 'company.analytics.charts.pipeline.stageDesc.paid',
};

const STAGE_BAR_COLORS: Record<PipelineStageKey, string> = {
  leads: '#e8b4a8',
  quotes: '#d4846f',
  accepted: '#c05a44',
  completed: '#a84a38',
  paid: '#2d8a61',
};

export function SalesPipelineChart({ data }: { data: SalesPipelineDto }) {
  const { t } = useTranslation();

  const stages = useMemo(
    () =>
      STAGE_ORDER.map((key) => ({
        key,
        value: data[key],
        label: t(STAGE_LABEL_KEYS[key]),
        description: t(STAGE_DESC_KEYS[key]),
        color: STAGE_BAR_COLORS[key],
      })),
    [data, t],
  );

  const maxValue = useMemo(() => Math.max(...stages.map((stage) => stage.value), 1), [stages]);

  const paidRate =
    data.completed > 0 ? Math.round((data.paid / data.completed) * 100) : null;

  return (
    <div className="space-y-5">
      <p className="border-l-2 border-[var(--dashboard-accent)]/40 pl-3 text-xs leading-relaxed text-gray-500">
        {t('company.analytics.charts.pipeline.hint')}
      </p>

      <ol className="space-y-4">
        {stages.map((stage, index) => {
          const widthPct = stage.value > 0 ? Math.max((stage.value / maxValue) * 100, 6) : 0;

          return (
            <li key={stage.key} className="relative flex gap-3">
              {index < stages.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-7 bottom-[-12px] w-px bg-[var(--dashboard-divider)]"
                />
              ) : null}

              <span className="relative z-[1] flex size-6 shrink-0 items-center justify-center bg-[var(--dashboard-accent-light)] text-[10px] font-black text-[var(--dashboard-accent)]">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1 space-y-1.5 pb-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{stage.label}</p>
                    <p className="text-[11px] leading-snug text-gray-400">{stage.description}</p>
                  </div>
                  <span className="shrink-0 text-lg font-black tabular-nums tracking-tight text-gray-900">
                    {stage.value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden bg-gray-100">
                  <div
                    className="h-full transition-[width] duration-300"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: stage.color,
                      minWidth: stage.value > 0 ? '0.5rem' : undefined,
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {paidRate !== null && data.completed > 0 ? (
        <p className="border-t border-[var(--dashboard-divider)] pt-4 text-xs text-gray-500">
          {t('company.analytics.charts.pipeline.insightPaid', {
            paid: data.paid,
            completed: data.completed,
            rate: paidRate,
          })}
        </p>
      ) : null}
    </div>
  );
}
