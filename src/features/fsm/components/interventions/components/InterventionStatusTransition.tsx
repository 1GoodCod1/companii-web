import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { interventionStatusHint, interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import {
  getAllowedInterventionTransitions,
  isTerminalInterventionStatus,
} from '@/entities/fsm/model/interventionStatus';
import type { InterventionDto, InterventionStatus } from '@/entities/fsm/model/types';
import type { CompanyRole } from '@/entities/company/model/roles.types';
import {
  interventionAccentButtonClass,
  interventionFieldInputClass,
  interventionHighlightCardClass,
  interventionSectionTitleClass,
} from '../interventionPanelUi';

interface InterventionStatusTransitionProps {
  detail: InterventionDto;
  role: CompanyRole | undefined;
  statusNote: string;
  setStatusNote: (v: string) => void;
  handleStatusChange: (status: InterventionStatus) => Promise<void>;
  isStatusUpdating: boolean;
  isGeneratingInvoice: boolean;
  isManagement: boolean;
  handleGenerateInvoice: () => Promise<void>;
}

export function InterventionStatusTransition({
  detail,
  role,
  statusNote,
  setStatusNote,
  handleStatusChange,
  isStatusUpdating,
  isGeneratingInvoice,
  isManagement,
  handleGenerateInvoice,
}: InterventionStatusTransitionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // A SCHEDULED transition needs a date + assignment, which is what the calendar
  // is for. When no date is set yet, management is sent to the calendar to plan
  // the work there (no duplicated date picker here); technicians, who can't set
  // dates, simply don't see the SCHEDULED action.
  const needsDate = !detail.scheduledAt;
  const canSchedule = needsDate && isManagement;

  let allowed = getAllowedInterventionTransitions(detail.status, role);
  if (needsDate && !isManagement) {
    allowed = allowed.filter((st) => st !== INTERVENTION_STATUS.SCHEDULED);
  }
  const hint = interventionStatusHint(detail.status, t);

  const goToCalendar = () => {
    navigate(`/company/calendar?schedule=${detail.id}`);
  };

  return (
    <div className={`space-y-3 ${interventionHighlightCardClass}`}>
      <h4 className={interventionSectionTitleClass}>
        {t('company.fsm.interventions.detail.nextStep.title')}
      </h4>

      {allowed.length === 0 ? (
        <p className="text-xs font-medium leading-relaxed text-gray-500">
          {hint ||
            (isTerminalInterventionStatus(detail.status)
              ? t('company.fsm.interventions.detail.nextStep.terminalStatus')
              : t('company.fsm.interventions.detail.nextStep.noActions'))}
        </p>
      ) : (
        <>
          <input
            type="text"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder={t('company.fsm.interventions.detail.nextStep.statusNotePlaceholder')}
            aria-label={t('company.fsm.interventions.detail.nextStep.statusNotePlaceholder')}
            className={interventionFieldInputClass}
          />
          <div className="flex flex-wrap gap-2">
            {allowed.map((status) => {
              if (status === INTERVENTION_STATUS.SCHEDULED && canSchedule) {
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={goToCalendar}
                    disabled={isStatusUpdating}
                    className={`${interventionAccentButtonClass} px-3 py-2 text-[10px]`}
                  >
                    {t('company.fsm.interventions.detail.nextStep.schedule')}
                  </button>
                );
              }
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => void handleStatusChange(status)}
                  disabled={isStatusUpdating}
                  className={
                    status === INTERVENTION_STATUS.CANCELLED
                      ? 'inline-flex cursor-pointer items-center justify-center border border-red-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50'
                      : `${interventionAccentButtonClass} px-3 py-2 text-[10px]`
                  }
                >
                  {interventionStatusLabel(status, t)}
                </button>
              );
            })}
          </div>

          {canSchedule ? (
            <p className="text-[11px] font-medium leading-relaxed text-gray-500">
              {t('company.fsm.interventions.detail.nextStep.scheduleHint')}
            </p>
          ) : null}
        </>
      )}

      {isManagement && detail.status === INTERVENTION_STATUS.COMPLETED ? (
        <button
          type="button"
          onClick={() => void handleGenerateInvoice()}
          disabled={isGeneratingInvoice}
          className={`${interventionAccentButtonClass} mt-1 w-full py-2.5 disabled:opacity-50`}
        >
          {t('company.fsm.interventions.detail.generateInvoice')}
        </button>
      ) : null}
    </div>
  );
}
