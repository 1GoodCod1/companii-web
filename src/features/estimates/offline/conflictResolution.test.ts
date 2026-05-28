import { describe, expect, it } from 'vitest';
import {
  ESTIMATE_VERSION_CONFLICT,
  extractConflict,
  isVersionConflict,
  newClientDraftId,
  newClientMutationId,
} from './conflictResolution';

describe('isVersionConflict (M-05)', () => {
  it('detects nested response.code shape from NestJS ConflictException', () => {
    const err = {
      response: {
        code: ESTIMATE_VERSION_CONFLICT,
        expectedVersion: 3,
        serverVersion: 5,
        number: 'EST-00007',
        title: 'Renovare',
      },
    };
    expect(isVersionConflict(err)).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isVersionConflict(new Error('boom'))).toBe(false);
    expect(isVersionConflict({ response: { code: 'OTHER' } })).toBe(false);
    expect(isVersionConflict(null)).toBe(false);
    expect(isVersionConflict(undefined)).toBe(false);
  });
});

describe('extractConflict (M-05)', () => {
  it('returns the payload when shape matches', () => {
    const payload = {
      code: ESTIMATE_VERSION_CONFLICT as typeof ESTIMATE_VERSION_CONFLICT,
      expectedVersion: 1,
      serverVersion: 2,
      number: 'EST-00001',
      title: 'A',
    };
    expect(extractConflict({ response: payload })).toEqual(payload);
  });

  it('returns null for non-conflict errors', () => {
    expect(extractConflict(new Error('boom'))).toBeNull();
  });
});

describe('id generators (M-05)', () => {
  it('newClientMutationId is unique across calls', () => {
    const a = newClientMutationId();
    const b = newClientMutationId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(8);
  });

  it('newClientDraftId is unique across calls', () => {
    const a = newClientDraftId();
    const b = newClientDraftId();
    expect(a).not.toBe(b);
  });
});
