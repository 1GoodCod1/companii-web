import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import {
  backoffDelayMs,
  clearOfflineQueue,
  enqueueMutation,
  flushMutationQueue,
  getProjectMeta,
  isReady,
  readMutationQueue,
  setProjectMeta,
  type EstimateMutationRecord,
} from './mutationQueue';
import { _resetEstimateDb, idbClear, STORE_DRAFTS, STORE_META } from '@/entities/estimate/model/idb';

beforeEach(async () => {
  _resetEstimateDb();
  // Clean all stores between tests.
  try {
    await clearOfflineQueue();
    await idbClear(STORE_DRAFTS);
    await idbClear(STORE_META);
  } catch {
    // first run — db not yet created
  }
});

afterEach(() => {
  _resetEstimateDb();
});

describe('backoffDelayMs (M-03)', () => {
  it('grows exponentially up to 30s cap', () => {
    expect(backoffDelayMs(0)).toBe(1000);
    expect(backoffDelayMs(1)).toBe(2000);
    expect(backoffDelayMs(3)).toBe(8000);
    expect(backoffDelayMs(6)).toBeLessThanOrEqual(30_000);
    expect(backoffDelayMs(20)).toBe(30_000);
  });
});

describe('isReady (M-03)', () => {
  const baseline: EstimateMutationRecord = {
    projectId: 'p1',
    kind: 'update-project',
    payload: {},
    attempts: 0,
    enqueuedAt: 0,
  };

  it('is ready when never attempted', () => {
    expect(isReady(baseline)).toBe(true);
  });

  it('is not ready before backoff window passes', () => {
    const failed: EstimateMutationRecord = {
      ...baseline,
      attempts: 2,
      lastErrorAt: 10_000,
    };
    expect(isReady(failed, 10_500)).toBe(false); // 500ms passed, need 4s
    expect(isReady(failed, 15_000)).toBe(true); // 5s passed
  });
});

describe('enqueueMutation + readMutationQueue (M-03)', () => {
  it('round-trips records ordered by autoIncrement id', async () => {
    await enqueueMutation('p1', 'update-project', { title: 'A' });
    await enqueueMutation('p1', 'save-plan', { plan2d: { rooms: [], points: [] } });
    await enqueueMutation('p2', 'update-project', { title: 'B' });

    const all = await readMutationQueue();
    expect(all).toHaveLength(3);
    expect(all.map((r) => r.projectId)).toEqual(['p1', 'p1', 'p2']);

    const onlyP1 = await readMutationQueue('p1');
    expect(onlyP1).toHaveLength(2);
    expect(onlyP1.every((r) => r.projectId === 'p1')).toBe(true);
  });
});

describe('flushMutationQueue (M-03)', () => {
  it('drains queue in order on success', async () => {
    await enqueueMutation('p1', 'update-project', { v: 1 });
    await enqueueMutation('p1', 'update-project', { v: 2 });
    await enqueueMutation('p1', 'update-project', { v: 3 });

    const seen: number[] = [];
    const report = await flushMutationQueue(async (record) => {
      seen.push(Number((record.payload as { v: number }).v));
    });

    expect(seen).toEqual([1, 2, 3]);
    expect(report).toMatchObject({ attempted: 3, succeeded: 3, failed: 0, remaining: 0 });
    expect(await readMutationQueue()).toEqual([]);
  });

  it('stops a project after first failure (preserves causal order)', async () => {
    await enqueueMutation('p1', 'update-project', { v: 1 });
    await enqueueMutation('p1', 'update-project', { v: 2 });
    await enqueueMutation('p2', 'update-project', { v: 3 });

    const seen: number[] = [];
    const report = await flushMutationQueue(async (record) => {
      const v = Number((record.payload as { v: number }).v);
      seen.push(v);
      if (v === 1) throw new Error('boom');
    });

    expect(seen).toEqual([1, 3]); // p1#2 skipped because p1#1 failed
    expect(report.succeeded).toBe(1);
    expect(report.failed).toBe(1);
    expect(report.remaining).toBe(2);

    const remaining = await readMutationQueue();
    const p1Records = remaining.filter((r) => r.projectId === 'p1');
    expect(p1Records).toHaveLength(2);
    // failed record now has attempts > 0 + lastErrorAt
    expect(p1Records[0].attempts).toBe(1);
    expect(p1Records[0].lastErrorAt).toBeGreaterThan(0);
  });

  it('skips records in backoff window', async () => {
    await enqueueMutation('p1', 'update-project', { v: 1 });
    // First flush fails, then immediately retry — should not re-attempt during cooldown.
    await flushMutationQueue(async () => {
      throw new Error('fail');
    });
    const report = await flushMutationQueue(async () => {
      throw new Error('should not run');
    }, { now: Date.now() }); // immediate
    expect(report.attempted).toBe(0);
  });
});

describe('project meta (M-04)', () => {
  it('stores per-project lastSavedAt / lastSyncedAt', async () => {
    await setProjectMeta('p1', { lastSavedAt: 100, lastSyncedAt: 200 });
    const meta = await getProjectMeta('p1');
    expect(meta).toEqual({ lastSavedAt: 100, lastSyncedAt: 200 });

    const missing = await getProjectMeta('does-not-exist');
    expect(missing).toBeUndefined();
  });
});
