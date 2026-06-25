import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleNotchIcon, UserIcon, WrenchIcon } from '@phosphor-icons/react';
import { Panel, PanelHeader, EmptyState } from '@/widgets/cabinet/cabinet-ui';
import type { InterventionDto, InterventionStatus } from '@/entities/fsm/model/types';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { formatDateLocalized, formatTimeLocalized, parseDateInput } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { formatPersonName } from '@/shared/utils/person';
import { cn } from '@/lib/utils';
import {
  dashboardPanelHeaderClass,
  dashboardPanelListClass,
  dashboardPanelRowClass,
  dashboardPanelShellClass,
} from './dashboardPanelList';

const ACTIVE_STATUS_STYLES: Partial<
  Record<InterventionStatus, { badge: string; spin?: boolean }>
> = {
  [INTERVENTION_STATUS.IN_PROGRESS]: {
    badge: 'bg-[#e8efff] text-[#2b50ed]',
    spin: true,
  },
  [INTERVENTION_STATUS.EN_ROUTE]: {
    badge: 'bg-[#e8efff] text-[#2b50ed]',
    spin: true,
  },
  [INTERVENTION_STATUS.NEW]: {
    badge: 'bg-[#e8efff] text-[#2b50ed]',
  },
  [INTERVENTION_STATUS.SCHEDULED]: {
    badge: 'bg-violet-50 text-violet-700',
  },
  [INTERVENTION_STATUS.COMPLETED]: {
    badge: 'bg-emerald-50 text-emerald-700',
  },
  [INTERVENTION_STATUS.INVOICED]: {
    badge: 'bg-blue-50 text-blue-700',
  },
  [INTERVENTION_STATUS.PAID]: {
    badge: 'bg-emerald-50 text-emerald-700',
  },
  [INTERVENTION_STATUS.CANCELLED]: {
    badge: 'bg-gray-100 text-gray-500',
  },
};

function formatInterventionAssignees(intervention: InterventionDto): string | null {
  const assignmentNames =
    intervention.assignments
      ?.map((assignment) => assignment.member.fullName?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];

  if (assignmentNames.length > 0) {
    return assignmentNames.join(' · ');
  }

  const technicianName = formatPersonName(intervention.technician);
  if (technicianName) return technicianName;

  if (intervention.crew?.name) return intervention.crew.name;

  return intervention.customer?.fullName ?? null;
}

function formatScheduleLabel(
  scheduledAt: string | null | undefined,
  locale: ReturnType<typeof useLocale>,
  t: (key: string, options?: Record<string, string>) => string,
): string {
  if (!scheduledAt) {
    return t('company.dashboard.panels.activeInterventions.unspecified');
  }

  const date = parseDateInput(scheduledAt);
  if (!date) {
    return t('company.dashboard.panels.activeInterventions.unspecified');
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return t('company.dashboard.panels.activeInterventions.todayAt', {
      time: formatTimeLocalized(scheduledAt, locale),
    });
  }

  return formatDateLocalized(scheduledAt, locale);
}

function InterventionStatusBadge({ status }: { status: InterventionStatus }) {
  const { t } = useTranslation();
  const style = ACTIVE_STATUS_STYLES[status] ?? {
    badge: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        style.badge,
      )}
    >
      {style.spin ? <CircleNotchIcon className="size-3 animate-spin" weight="bold" /> : null}
      {interventionStatusLabel(status, t)}
    </span>
  );
}

function InterventionRowSkeleton() {
  return (
    <div className={cn('flex items-center gap-4', dashboardPanelRowClass)}>
      <span className="size-11 shrink-0 rounded-2xl bg-gray-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-2.5 w-16 rounded bg-gray-100" />
        <div className="h-3.5 w-2/3 rounded bg-gray-200" />
        <div className="h-2.5 w-1/3 rounded bg-gray-100" />
      </div>
      <div className="shrink-0 space-y-2 text-right">
        <div className="ml-auto h-5 w-20 rounded-full bg-gray-100" />
        <div className="ml-auto h-2.5 w-14 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function DashboardActiveInterventionsPanel({
  interventions,
  isManagement,
  isLoading = false,
}: {
  interventions: InterventionDto[];
  isManagement: boolean;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Panel className={dashboardPanelShellClass}>
      <div className={dashboardPanelHeaderClass}>
        <PanelHeader
          className="mb-0"
          title={t('company.dashboard.panels.activeInterventions.title')}
          description={t('company.dashboard.panels.activeInterventions.description')}
          action={
            <Link
              to="/company/lucrari"
              className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
            >
              {t('company.dashboard.panels.activeInterventions.viewAll')}
            </Link>
          }
        />
      </div>

      {isLoading && interventions.length === 0 ? (
        <div className={cn('animate-pulse', dashboardPanelListClass)}>
          {Array.from({ length: 4 }).map((_, index) => (
            <InterventionRowSkeleton key={index} />
          ))}
        </div>
      ) : interventions.length === 0 ? (
        <div className={dashboardPanelRowClass}>
          <EmptyState
            message={t('company.dashboard.panels.activeInterventions.empty')}
            action={
              <Link
                to="/company/lucrari"
                className="text-xs font-semibold text-[var(--dashboard-accent)] hover:opacity-80"
              >
                {isManagement
                  ? t('company.dashboard.panels.activeInterventions.createIntervention')
                  : t('company.dashboard.panels.activeInterventions.viewMyJobs')}
              </Link>
            }
          />
        </div>
      ) : (
        <div className={dashboardPanelListClass}>
          {interventions.slice(0, 5).map((inter) => {
            const assignees = formatInterventionAssignees(inter);

            return (
              <div
                key={inter.id}
                className={cn('flex items-center gap-4', dashboardPanelRowClass)}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <WrenchIcon className="size-4" weight="regular" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    {inter.number}
                  </p>
                  <h3 className="mt-0.5 truncate text-sm font-bold text-gray-900">{inter.type}</h3>
                  {assignees ? (
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500">
                      <UserIcon className="size-3.5 shrink-0" />
                      {assignees}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <InterventionStatusBadge status={inter.status} />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    {formatScheduleLabel(inter.scheduledAt, locale, t)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
