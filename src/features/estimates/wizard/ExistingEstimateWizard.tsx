import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { EstimateProjectDto } from '@/entities/estimate/model/estimates';
import { wizardStepLabel } from '@/entities/estimate/model/i18nStatusLabels';
import { useEstimateWizard } from './useEstimateWizard';
import { ObjectStep } from './steps/ObjectStep';
import { PlanStep } from './steps/PlanStep';
import { DiagnosticStep } from './steps/DiagnosticStep';
import { StagesStep } from './steps/StagesStep';
import { ReviewStep } from './steps/ReviewStep';
import { OfflineBanner } from '../components/OfflineBanner';
import { ConflictDialog } from '../components/ConflictDialog';

type ExistingEstimateWizardProps = {
  project: EstimateProjectDto;
};

export function ExistingEstimateWizard({ project }: ExistingEstimateWizardProps) {
  const { t } = useTranslation();
  const wizard = useEstimateWizard(project);
  const {
    steps,
    stepIndex,
    currentStep,
    handleStepChange,
    offlineState,
    handleSyncNow,
    offlineSyncing,
    savingStatus,
    lastSavedAt,
    handleDiscardLocalChanges,
    handleKeepLocalChanges,
    acknowledgeConflict,
    confirmDialog,
  } = wizard;

  return (
    <>
      <OfflineBanner
        online={offlineState.online}
        syncState={offlineState.syncState}
        pendingMutations={offlineState.pendingMutations}
        lastSavedAt={offlineState.lastSavedAt}
        lastSyncedAt={offlineState.lastSyncedAt}
        onSyncNow={handleSyncNow}
        syncing={offlineSyncing}
      />
      {offlineState.conflict && (
        <ConflictDialog
          conflict={offlineState.conflict}
          busy={offlineSyncing}
          onDiscardLocal={() => void handleDiscardLocalChanges()}
          onKeepLocal={() => void handleKeepLocalChanges()}
          onClose={acknowledgeConflict}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="scrollbar-none flex items-center overflow-x-auto">
          {steps.map((step, index) => {
            const isCurrent = index === stepIndex;
            const isDone = index < stepIndex;
            return (
              <li key={step} className="flex shrink-0 items-center">
                {index > 0 ? (
                  <span
                    aria-hidden
                    className={cn(
                      'mx-2.5 h-px w-6 sm:w-9',
                      index <= stepIndex ? 'bg-violet-300' : 'bg-gray-200',
                    )}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => handleStepChange(index)}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-black transition-all',
                      isCurrent
                        ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                        : isDone
                          ? 'bg-violet-100 text-violet-700'
                          : 'border border-gray-200 bg-white text-gray-400 group-hover:border-violet-200 group-hover:text-violet-500',
                    )}
                  >
                    {isDone ? <CheckIcon className="size-4" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold transition-colors',
                      isCurrent
                        ? 'text-gray-900'
                        : isDone
                          ? 'text-violet-700'
                          : 'text-gray-400 group-hover:text-gray-600',
                      !isCurrent && 'hidden sm:inline',
                    )}
                  >
                    {wizardStepLabel(step, t)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* U-07: Autosave indicator */}
        <div className="flex items-center gap-2">
          {savingStatus === 'saving' && (
            <span className="text-xs text-amber-600 animate-pulse font-medium">
              Se salvează...
            </span>
          )}
          {savingStatus === 'saved' && lastSavedAt && (
            <span className="text-xs text-emerald-600 font-medium">
              Salvat {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {currentStep === 'object' && <ObjectStep wizard={wizard} />}
      {currentStep === 'plan' && <PlanStep wizard={wizard} />}
      {currentStep === 'diagnostic' && <DiagnosticStep wizard={wizard} />}
      {currentStep === 'stages' && <StagesStep wizard={wizard} />}
      {currentStep === 'review' && <ReviewStep wizard={wizard} />}
      {confirmDialog}
    </>
  );
}
