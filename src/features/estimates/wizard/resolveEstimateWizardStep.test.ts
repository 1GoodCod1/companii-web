import { describe, expect, it } from 'vitest';
import { ESTIMATE_STATUS } from '@/entities/estimate/model/estimateStatus.constants';
import {
  resolveEstimateWizardStep,
  resolveEstimateWizardStepIndex,
} from './resolveEstimateWizardStep';

const defaultSteps = ['object', 'plan', 'diagnostic', 'stages', 'review'] as const;
const config = {
  wizardSteps: [...defaultSteps],
  diagnosticQuestions: [{ key: 'roomCount', label: 'Rooms', type: 'number', required: true }],
  customFields: [],
  workModules: [],
} as const;

describe('resolveEstimateWizardStep', () => {
  it('opens draft estimates on object step', () => {
    expect(
      resolveEstimateWizardStep(
        ESTIMATE_STATUS.DRAFT,
        { sitePlan: null, diagnosticAnswers: {}, stages: [] },
        [...defaultSteps],
        config,
      ),
    ).toBe('object');
  });

  it('opens calculated estimates on review step', () => {
    expect(
      resolveEstimateWizardStep(
        ESTIMATE_STATUS.CALCULATED,
        { sitePlan: { plan2d: { rooms: [{ id: '1' }], points: [] } }, diagnosticAnswers: {}, stages: [] },
        [...defaultSteps],
        config,
      ),
    ).toBe('review');
  });

  it('opens measured estimates without plan on plan step', () => {
    expect(
      resolveEstimateWizardStepIndex(
        {
          status: ESTIMATE_STATUS.MEASURED,
          sitePlan: null,
          diagnosticAnswers: {},
          stages: [],
        },
        [...defaultSteps],
        config,
      ),
    ).toBe(1);
  });
});
