import { useTranslation } from 'react-i18next';
import { INTERVENTION_STATUS } from '@/entities/fsm/model/interventionStatus.constants';
import { interventionStatusHint, interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import {
  getAllowedInterventionTransitions,
  isTerminalInterventionStatus,
} from '@/entities/fsm/model/interventionStatus';
import type { InterventionDto, InterventionStatus } from '@/entities/fsm/model/types';
import type { CompanyRole } from '@/entities/company/model/roles.types';

interface InterventionStatusTransitionProps {
  detail: InterventionDto;
  role: CompanyRole | undefined;
  statusNote: string;
  setStatusNote: (v: string) => void;
  handleStatusChange: (status: InterventionStatus) => Promise<void>;
  isStatusUpdating: boolean;
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
  isManagement,
  handleGenerateInvoice,
}: InterventionStatusTransitionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2.5">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {t('company.fsm.interventions.detail.nextStep.title')}
      </h4>
      {(() => {
        const allowed = getAllowedInterventionTransitions(detail.status, role);
        const hint = interventionStatusHint(detail.status, t);
        if (allowed.length === 0) {
          return (
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {hint ||
                (isTerminalInterventionStatus(detail.status)
                  ? t('company.fsm.interventions.detail.nextStep.terminalStatus')
                  : t('company.fsm.interventions.detail.nextStep.noActions'))}
            </p>
          );
        }
        return (
          <>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder={t('company.fsm.interventions.detail.nextStep.statusNotePlaceholder')}
              aria-label={t('company.fsm.interventions.detail.nextStep.statusNotePlaceholder')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <div className="flex flex-wrap gap-1.5">
              {allowed.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => void handleStatusChange(st)}
                  disabled={isStatusUpdating}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                    st === INTERVENTION_STATUS.CANCELLED
                      ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                      : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-xs'
                  } disabled:opacity-50`}
                >
                  {interventionStatusLabel(st, t)}
                </button>
              ))}
            </div>
          </>
        );
      })()}
      {isManagement && detail.status === INTERVENTION_STATUS.COMPLETED && (
        <button
          onClick={() => void handleGenerateInvoice()}
          className="w-full mt-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          {t('company.fsm.interventions.detail.generateInvoice')}
        </button>
      )}
    </div>
  );
}
