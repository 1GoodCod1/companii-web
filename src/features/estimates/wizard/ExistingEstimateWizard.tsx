import { useTranslation } from 'react-i18next';
import type { EstimateProjectDto } from '@/types/estimates';
import { wizardStepLabel } from '@/utils/i18nStatusLabels';
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
      {/* U-07: Autosave indicator */}
      <div className="flex items-center justify-end gap-2 mb-1">
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
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => handleStepChange(index)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              index === stepIndex
                ? 'bg-violet-600 text-white shadow-md'
                : index < stepIndex
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {index + 1}. {wizardStepLabel(step, t)}
          </button>
        ))}
      </div>

      {currentStep === 'object' && <ObjectStep wizard={wizard} />}
      {currentStep === 'plan' && <PlanStep wizard={wizard} />}
      {currentStep === 'diagnostic' && <DiagnosticStep wizard={wizard} />}
      {currentStep === 'stages' && <StagesStep wizard={wizard} />}
      {currentStep === 'review' && <ReviewStep wizard={wizard} />}
    </>
  );
}
