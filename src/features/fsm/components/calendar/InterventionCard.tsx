import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SoftBadge,
  AppSelect,
  cabinetPanelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
} from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { useLocale } from '@/shared/hooks/useLocale';
import { memberDisplayName, technicianDisplayName } from '@/entities/company/model/teamMembers';
import type { CompanyMemberDto, InterventionDto } from '@/entities/fsm/model/types';
import { statusTone } from '@/entities/fsm/model/calendar';
import { formatTimeLocalized } from '@/shared/utils/date';
import { useCrewsQuery } from '@/features/fsm/api/useCrews';

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
    <article className={cn(cabinetPanelClass, 'p-4 space-y-3')}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{item.number}</span>
        <SoftBadge tone={statusTone(item.status)}>{item.status}</SoftBadge>
      </div>
      <p className="font-semibold text-gray-900 text-sm">{item.type}</p>
      <p className="text-xs text-gray-500">📍 {item.address}</p>
      <div className="bg-slate-50/80 p-3 rounded-xl text-xs text-gray-700 space-y-1.5">
        <div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wide block mb-0.5">
            {t(`${ns}.beneficiary`)}
          </span>
          {item.customer?.fullName}
        </div>
        <div>
          <span className="text-gray-400 text-[10px] uppercase tracking-wide block mb-0.5">
            {t(`${ns}.technician`)}
          </span>
          {technicianDisplayName(item.technician)}
        </div>
      </div>
      {item.scheduledAt ? (
        <div className="pt-2 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100/80">
          <span className="font-medium">{t(`${ns}.scheduledTime`)}</span>
          <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
            {formatTimeLocalized(item.scheduledAt, locale)}
          </span>
        </div>
      ) : null}
      {canDispatch && onSchedule && !item.scheduledAt ? (
        scheduling ? (
          <div className="space-y-2.5 border-t border-gray-100 pt-3">
            <input
              type="datetime-local"
              value={scheduleAt ?? ''}
              onChange={(e) => onScheduleAtChange?.(e.target.value)}
              aria-label={t(`${ns}.scheduledTime`)}
              className={cabinetFieldClass}
            />

            {/* Assignment Mode Tabs */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-2 space-y-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['single', 'multiple', 'crew'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onAssignModeChange?.(mode)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${
                      assignMode === mode
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-violet-50'
                    }`}
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
                <div className="space-y-1 max-h-36 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
                  {techniciansSorted.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-1">
                      {t('company.fsm.interventions.createModal.assignMode.noMembers', {
                        defaultValue: 'Niciun membru disponibil',
                      })}
                    </p>
                  ) : (
                    techniciansSorted.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-violet-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={scheduleMemberIds.includes(m.id)}
                          onChange={() => toggleMember(m.id)}
                          className="size-3.5 accent-violet-600 cursor-pointer"
                        />
                        <span className="font-semibold text-gray-800">{memberDisplayName(m)}</span>
                        {scheduleMemberIds.indexOf(m.id) === 0 && scheduleMemberIds.length > 1 && (
                          <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
                            Lead
                          </span>
                        )}
                        {scheduleMemberIds.length === 1 && scheduleMemberIds[0] === m.id && (
                          <span className="ml-auto text-[9px] font-black uppercase text-violet-600">
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
                      <p className="text-[9px] text-gray-400 leading-normal pl-1">
                        {chosen.members
                          .map((mm) => mm.member.fullName || '—')
                          .join(', ')}
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
    </article>
  );
}
