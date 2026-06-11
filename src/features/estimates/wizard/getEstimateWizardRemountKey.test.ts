import { describe, expect, it } from 'vitest';
import type { EstimateClientFeedbackEntry } from '@/entities/estimate/model/estimates';
import { getEstimateWizardRemountKey } from './getEstimateWizardRemountKey';

describe('getEstimateWizardRemountKey', () => {
  const base = {
    id: 'proj-1',
    clientFeedback: null,
  };

  it('changes when client requests modifications', () => {
    const before = getEstimateWizardRemountKey(base);
    const after = getEstimateWizardRemountKey({
      ...base,
      clientFeedback: [
        { kind: 'REQUEST_CHANGES', comment: 'Please adjust', createdAt: '2026-05-31T12:00:00.000Z' },
      ],
    });
    expect(after).not.toBe(before);
  });

  it('stays stable for the same revision', () => {
    const feedback: EstimateClientFeedbackEntry[] = [
      { kind: 'REQUEST_CHANGES', createdAt: '2026-05-31T12:00:00.000Z' },
    ];
    const project = {
      ...base,
      clientFeedback: feedback,
    };
    expect(getEstimateWizardRemountKey(project)).toBe(getEstimateWizardRemountKey(project));
  });
});
