import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { EMPTY_PLAN } from '@/constants/estimatesWizard.constants';
import { validateDiagnostic } from '@/features/estimates/diagnostic/diagnosticValidation';
import type {
  BlueprintWizardStep,
  EstimateBlueprintConfig,
  EstimateProjectDto,
  EstimateProjectStatus,
  Plan2dData,
} from '@/types/estimates';

function stepIndex(steps: BlueprintWizardStep[], step: BlueprintWizardStep): number {
  const index = steps.indexOf(step);
  return index >= 0 ? index : 0;
}

function isPlanEmpty(plan: Plan2dData | null | undefined): boolean {
  if (!plan) return true;
  return plan.rooms.length === 0 && plan.points.length === 0;
}

function hasMeaningfulPlan(plan: Plan2dData | null | undefined): boolean {
  if (!plan) return false;
  if (isPlanEmpty(plan)) return false;
  return JSON.stringify(plan) !== JSON.stringify(EMPTY_PLAN);
}

function resolveMeasuredStep(
  project: Pick<EstimateProjectDto, 'sitePlan' | 'diagnosticAnswers' | 'stages'>,
  steps: BlueprintWizardStep[],
  config: EstimateBlueprintConfig | null,
): BlueprintWizardStep {
  if (steps.includes('plan') && !hasMeaningfulPlan(project.sitePlan?.plan2d)) {
    return 'plan';
  }

  if (steps.includes('diagnostic') && config) {
    const diagnostic = (project.diagnosticAnswers as Record<string, unknown> | null) ?? {};
    const validation = validateDiagnostic(config, diagnostic);
    if (!validation.ok) {
      return 'diagnostic';
    }
  }

  if (steps.includes('stages')) {
    return 'stages';
  }

  const lastEditable = steps.filter((step) => step !== 'review').at(-1);
  return lastEditable ?? steps[0] ?? 'object';
}

export function resolveEstimateWizardStep(
  status: EstimateProjectStatus,
  project: Pick<EstimateProjectDto, 'sitePlan' | 'diagnosticAnswers' | 'stages'>,
  steps: BlueprintWizardStep[],
  config: EstimateBlueprintConfig | null,
): BlueprintWizardStep {
  switch (status) {
    case ESTIMATE_STATUS.DRAFT:
      return 'object';
    case ESTIMATE_STATUS.MEASURED:
      return resolveMeasuredStep(project, steps, config);
    case ESTIMATE_STATUS.CALCULATED:
    case ESTIMATE_STATUS.APPROVED:
    case ESTIMATE_STATUS.SENT:
    case ESTIMATE_STATUS.ACCEPTED:
    case ESTIMATE_STATUS.IN_EXECUTION:
    case ESTIMATE_STATUS.DONE:
    case ESTIMATE_STATUS.CANCELLED:
      return steps.includes('review') ? 'review' : steps.at(-1) ?? 'object';
    default:
      return steps[0] ?? 'object';
  }
}

export function resolveEstimateWizardStepIndex(
  project: Pick<EstimateProjectDto, 'status' | 'sitePlan' | 'diagnosticAnswers' | 'stages'>,
  steps: BlueprintWizardStep[],
  config: EstimateBlueprintConfig | null,
): number {
  const step = resolveEstimateWizardStep(project.status, project, steps, config);
  return stepIndex(steps, step);
}
