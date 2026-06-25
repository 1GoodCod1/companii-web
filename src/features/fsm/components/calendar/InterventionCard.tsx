import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClockIcon, MapPinIcon, UserIcon, WrenchIcon } from '@phosphor-icons/react';
import {
  SoftBadge,
  AppSelect,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { useLocale } from '@/shared/hooks/useLocale';
import { memberDisplayName, technicianDisplayName } from '@/entities/company/model/teamMembers';
import type { CompanyMemberDto, InterventionDto } from '@/entities/fsm/model/types';
import { statusTone } from '@/entities/fsm/model/calendar';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { formatTimeLocalized } from '@/shared/utils/date';
import { useCrewsQuery } from '@/features/fsm/api/useCrews';
import {
  calendarAssignTabClass,
  calendarCardBodyClass,
  calendarCardClass,
  calendarFieldInputClass,
  calendarMetaLabelClass,
} from './calendarPanelUi';

const EMPTY_SCHEDULE_MEMBER_IDS: string[] = [];

export function InterventionCard({
  item,
  onSchedule,
  scheduling,
  scheduleAt,
  scheduleTechnicianId,
  assignMode = 'single',
  scheduleMemberIds = EMPTY_SCHEDULE_MEMBER_IDS,
  scheduleCrewId = '',
  onScheduleAtChange,
  onScheduleTechnicianChange,
  onAssignModeChange,
  onScheduleMemberIdsChange,
  onScheduleCrewIdChange,
  onSubmitSchedule,
  onCancelSchedule,
  technicians,
  canDispatch,
}: {
  item: InterventionDto;
  onSchedule?: (id: string) => void;
  scheduling?: boolean;
  scheduleAt?: string;
  scheduleTechnicianId?: string;
  assignMode?: 'single' | 'multiple' | 'crew';
  scheduleMemberIds?: string[];
  scheduleCrewId?: string;
  onScheduleAtChange?: (value: string) => void;
  onScheduleTechnicianChange?: (value: string) => void;
  onAssignModeChange?: (value: 'single' | 'multiple' | 'crew') => void;
  onScheduleMemberIdsChange?: (value: string[]) => void;
  onScheduleCrewIdChange?: (value: string) => void;
  onSubmitSchedule?: () => void;
  onCancelSchedule?: () => void;
  technicians?: CompanyMemberDto[];
  canDispatch?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const ns = 'company.fsm.calendar.interventionCard';

  const { data: crews } = useCrewsQuery();
  const activeCrews = useMemo(() => crews?.filter((c) => c.isActive) ?? [], [crews]);

  const techniciansSorted = useMemo(
    () =>
      (technicians ?? []).toSorted((a, b) =>
        memberDisplayName(a).localeCompare(memberDisplayName(b)),
      ),
    [technicians],
  );

  const technicianOptions = useMemo(
    () => [
      { value: '', label: t(`${ns}.noTechnician`, { defaultValue: 'Niciun angajat' }) },
      ...techniciansSorted.map((member) => ({
        value: member.id,
        label: memberDisplayName(member),
      })),
    ],
    [techniciansSorted, t, ns],
  );

  const crewOptions = useMemo(
    () => [
      {
        value: '',
        label: t('company.fsm.interventions.createModal.assignMode.crewPlaceholder', {
          defaultValue: 'Alege o brigadă...',
        }),
      },
      ...activeCrews.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.members.length})`,
      })),
    ],
    [activeCrews, t],
  );

  const toggleMember = (id: string) => {
    if (!onScheduleMemberIdsChange) return;
    const next = scheduleMemberIds.includes(id)
      ? scheduleMemberIds.filter((x) => x !== id)
      : [...scheduleMemberIds, id];
    onScheduleMemberIdsChange(next);
  };

  return (
    <article className={calendarCardClass}>
      <div className={calendarCardBodyClass}>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {item.number}
          </span>
          <SoftBadge tone={statusTone(item.status)}>
            {interventionStatusLabel(item.status, t)}
          </SoftBadge>
        </div>

        <p className="text-sm font-black tracking-tight text-gray-900">{item.type}</p>

        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-500">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
          <span>{item.address}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--dashboard-divider)] pt-3">
          <div className="min-w-0 space-y-1">
            <p className={calendarMetaLabelClass}>{t(`${ns}.beneficiary`)}</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <UserIcon className="size-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{item.customer?.fullName}</span>
            </p>
          </div>
          <div className="min-w-0 space-y-1">
            <p className={calendarMetaLabelClass}>{t(`${ns}.technician`)}</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <WrenchIcon className="size-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{technicianDisplayName(item.technician)}</span>
            </p>
          </div>
        </div>

        {item.scheduledAt ? (
          <div className="flex items-center justify-between gap-2 border-t border-[var(--dashboard-divider)] pt-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-gray-400">
              <ClockIcon className="size-3.5" />
              {t(`${ns}.scheduledTime`)}
            </span>
            <span className="font-bold text-[var(--dashboard-accent)]">
              {formatTimeLocalized(item.scheduledAt, locale)}
            </span>
          </div>
        ) : null}

        {canDispatch && onSchedule && !item.scheduledAt ? (
          scheduling ? (
            <div className="space-y-3 border-t border-[var(--dashboard-divider)] pt-3">
              <input
                type="datetime-local"
                value={scheduleAt ?? ''}
                onChange={(e) => onScheduleAtChange?.(e.target.value)}
                aria-label={t(`${ns}.scheduledTime`)}
                className={calendarFieldInputClass}
              />

              <div className="space-y-2.5 border border-[var(--dashboard-divider)] p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['single', 'multiple', 'crew'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onAssignModeChange?.(mode)}
                      className={cn(
                        'cursor-pointer rounded-none border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-colors',
                        calendarAssignTabClass(assignMode === mode),
                      )}
                    >
                      {t(`company.fsm.interventions.createModal.assignMode.${mode}`, {
                        defaultValue:
                          mode === 'single' ? 'Un singur' : mode === 'multiple' ? 'Mai mulți' : 'Brigadă',
                      })}
                    </button>
                  ))}
                </div>

                {assignMode === 'single' && (
                  <AppSelect
                    value={scheduleTechnicianId ?? ''}
                    onChange={(value) => onScheduleTechnicianChange?.(value)}
                    options={technicianOptions}
                    aria-label={t(`${ns}.technician`)}
                  />
                )}

                {assignMode === 'multiple' && (
                  <div className="max-h-36 space-y-1 overflow-y-auto border border-gray-200 bg-white p-2">
                    {techniciansSorted.length === 0 ? (
                      <p className="p-1 text-xs italic text-gray-400">
                        {t('company.fsm.interventions.createModal.assignMode.noMembers', {
                          defaultValue: 'Niciun membru disponibil',
                        })}
                      </p>
                    ) : (
                      techniciansSorted.map((m) => (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded-none px-1.5 py-1 text-xs hover:bg-[var(--dashboard-accent-light)]/30"
                        >
                          <input
                            type="checkbox"
                            checked={scheduleMemberIds.includes(m.id)}
                            onChange={() => toggleMember(m.id)}
                            className="size-3.5 cursor-pointer accent-[var(--dashboard-accent)]"
                          />
                          <span className="font-semibold text-gray-800">{memberDisplayName(m)}</span>
                          {scheduleMemberIds.indexOf(m.id) === 0 && scheduleMemberIds.length > 1 && (
                            <span className="ml-auto text-[9px] font-black uppercase text-[var(--dashboard-accent)]">
                              Lead
                            </span>
                          )}
                          {scheduleMemberIds.length === 1 && scheduleMemberIds[0] === m.id && (
                            <span className="ml-auto text-[9px] font-black uppercase text-[var(--dashboard-accent)]">
                              Lead
                            </span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                )}

                {assignMode === 'crew' && (
                  <div className="space-y-1">
                    <AppSelect
                      value={scheduleCrewId ?? ''}
                      onChange={(value) => onScheduleCrewIdChange?.(value)}
                      options={crewOptions}
                      aria-label={t('company.fsm.interventions.createModal.assignMode.crewPlaceholder', {
                        defaultValue: 'Alege o brigadă...',
                      })}
                    />
                    {(() => {
                      const chosen = activeCrews.find((c) => c.id === scheduleCrewId);
                      if (!chosen) return null;
                      return (
                        <p className="pl-1 text-[9px] leading-normal text-gray-400">
                          {chosen.members.map((mm) => mm.member.fullName || '—').join(', ')}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={onSubmitSchedule} className={cabinetBtnPrimary}>
                  {t(`${ns}.save`)}
                </button>
                <button type="button" onClick={onCancelSchedule} className={cabinetBtnSecondary}>
                  {t(`${ns}.cancel`)}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => onSchedule(item.id)} className={cabinetBtnSecondary}>
              {t(`${ns}.schedule`)}
            </button>
          )
        ) : null}
      </div>
    </article>
  );
}
