import { describe, expect, it } from 'vitest';
import { ESTIMATE_STATUS } from '@/entities/estimate/model/estimateStatus.constants';
import type { EstimateBlueprintConfig } from '@/entities/estimate/model/estimates';
import {
  resolveEstimateWizardStep,
  resolveEstimateWizardStepIndex,
} from './resolveEstimateWizardStep';

const defaultSteps = ['object', 'plan', 'diagnostic', 'stages', 'review'] as const;
const config: EstimateBlueprintConfig = {
  wizardSteps: [...defaultSteps],
  diagnosticQuestions: [{ key: 'roomCount', label: 'Rooms', type: 'number' }],
  customFields: [],
  workModules: [],
  siteTypes: [],
  planPointTypes: [],
  defaultStages: [],
  pricingRules: [],
  defaultLaborRate: 185,
  defaultMarginPct: 20,
};

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
        { sitePlan: { plan2d: { rooms: [{ id: '1', name: 'Room 1', width: 5, height: 5 }], points: [] } }, diagnosticAnswers: {}, stages: [] },
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
