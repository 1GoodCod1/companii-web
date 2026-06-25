import {
  ArrowUpIcon,
  CheckCircleIcon,
  ReceiptIcon,
  UsersIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { DashboardKpi } from '@/entities/fsm/model/dashboard.constants';
import { DashboardSparkline } from './DashboardSparkline';

const KPI_ICONS = [UsersIcon, WrenchIcon, ReceiptIcon, CheckCircleIcon] as const;

function KpiCardSkeleton() {
  return (
    <article className="relative flex min-h-[168px] flex-col overflow-hidden border border-gray-100 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <span className="size-9 rounded-lg bg-gray-100" />
        <span className="h-5 w-12 rounded-full bg-gray-100" />
      </div>
      <div className="mt-4 h-8 w-24 rounded bg-gray-200" />
      <div className="mt-2 h-3.5 w-28 rounded bg-gray-200" />
      <div className="mt-1.5 h-2.5 w-32 rounded bg-gray-100" />
      <div className="absolute bottom-0 right-0 h-14 w-[58%] bg-gray-50" />
    </article>
  );
}

export function DashboardKpiGrid({
  kpis,
  layout = 'row',
  isLoading = false,
}: {
  kpis: DashboardKpi[];
  layout?: 'row' | 'square';
  isLoading?: boolean;
}) {
  const gridClass = cn(
    'grid gap-4 sm:gap-5',
    layout === 'square'
      ? 'grid-cols-1 sm:grid-cols-2 h-full [grid-auto-rows:1fr]'
      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  );

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: kpis.length || 4 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {kpis.map((kpi, index) => {
        const Icon = KPI_ICONS[index % KPI_ICONS.length];
        const iconAccent = kpi.iconVariant === 'accent';

        return (
          <article
            key={kpi.label}
            className={cn(
              'relative flex min-h-[168px] flex-col overflow-hidden border bg-white p-5',
              kpi.cardStyle === 'accent-left' &&
                'border border-gray-100 border-l-[3px] border-l-[var(--dashboard-accent)]',
              kpi.cardStyle === 'accent-top' &&
                'border-gray-100 border-t-[3px] border-t-[var(--dashboard-accent)]',
              kpi.cardStyle === 'default' && 'border-gray-100',
              !kpi.cardStyle && 'border-gray-100',
            )}
          >
            <div className="relative z-[1] flex items-start justify-between gap-3">
              <span
                className={cn(
                  'flex size-9 items-center justify-center text-gray-400',
                  iconAccent &&
                    'rounded-lg bg-[var(--dashboard-accent-light)] text-[var(--dashboard-accent)]',
                )}
              >
                <Icon className="size-5" weight="regular" />
              </span>
              {kpi.trend ? (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-[var(--dashboard-success)]">
                  <ArrowUpIcon className="size-3" weight="bold" />
                  {kpi.trend}
                </span>
              ) : null}
            </div>

            <div className="relative z-[1] mt-4 pr-[42%]">
              <p
                className={cn(
                  'text-[1.75rem] font-black leading-none tracking-tight text-gray-900 sm:text-[2rem]',
                  kpi.valueClass,
                )}
              >
                {kpi.value}
                {kpi.valueSuffix ? (
                  <span className="ml-1.5 text-sm font-semibold text-gray-400">{kpi.valueSuffix}</span>
                ) : null}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{kpi.label}</p>
              <p className={cn('mt-0.5 text-xs', kpi.hintClass)}>{kpi.hint}</p>
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-[4.5rem] w-[58%]">
              <DashboardSparkline
                points={kpi.sparklinePoints}
                variant={kpi.sparklineVariant ?? 'default'}
                showLastDot={kpi.showSparklineDot}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
