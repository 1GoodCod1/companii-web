import { useTranslation } from 'react-i18next';
import {
  SoftBadge,
  cabinetPanelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { memberDisplayName, technicianDisplayName } from '@/utils/teamMembers';
import type { CompanyMemberDto, InterventionDto } from '@/types/fsm';
import { statusTone } from '@/utils/calendar';
import { formatTimeLocalized } from '@/utils/date';

export function InterventionCard({
  item,
  onSchedule,
  scheduling,
  scheduleAt,
  scheduleTechnicianId,
  onScheduleAtChange,
  onScheduleTechnicianChange,
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
  onScheduleAtChange?: (value: string) => void;
  onScheduleTechnicianChange?: (value: string) => void;
  onSubmitSchedule?: () => void;
  onCancelSchedule?: () => void;
  technicians?: CompanyMemberDto[];
  canDispatch?: boolean;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const ns = 'company.fsm.calendar.interventionCard';

  return (
    <article className={cn(cabinetPanelClass, 'p-4 space-y-3 hover:shadow-md transition-shadow')}>
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
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <input
              type="datetime-local"
              value={scheduleAt ?? ''}
              onChange={(e) => onScheduleAtChange?.(e.target.value)}
              className={cabinetFieldClass}
            />
            <select
              value={scheduleTechnicianId ?? ''}
              onChange={(e) => onScheduleTechnicianChange?.(e.target.value)}
              className={cabinetSelectClass}
            >
              <option value="">{t(`${ns}.noTechnician`)}</option>
              {technicians?.map((member) => (
                <option key={member.id} value={member.id}>
                  {memberDisplayName(member)}
                </option>
              ))}
            </select>
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
