import { describe, expect, it } from 'vitest';
import {
  EXCLUDED_CATEGORY_ALTERNATIVES,
  getExcludedAlternative,
} from './excludedCategoryAlternatives';
import {
  ESTIMATE_BLUEPRINT_CATEGORY_SLUGS,
  ESTIMATE_EXCLUDED_CATEGORY_SLUGS,
} from '@/constants/estimateCategorySlugs.constants';

describe('getExcludedAlternative (K-02)', () => {
  it('returns alternative for each excluded slug', () => {
    for (const slug of ESTIMATE_EXCLUDED_CATEGORY_SLUGS) {
      const alt = getExcludedAlternative(slug);
      expect(alt).not.toBeNull();
      expect(alt!.slug).toBe(slug);
      expect(alt!.icon).toBeDefined();
    }
  });

  it('returns null for blueprint categories (they should never trigger excluded notice)', () => {
    for (const slug of ESTIMATE_BLUEPRINT_CATEGORY_SLUGS) {
      expect(getExcludedAlternative(slug)).toBeNull();
    }
  });

  it('returns null for unknown slug', () => {
    expect(getExcludedAlternative('totally-made-up')).toBeNull();
    expect(getExcludedAlternative('')).toBeNull();
  });

  it('alternatives table covers every excluded slug exactly once', () => {
    const tableKeys = Object.keys(EXCLUDED_CATEGORY_ALTERNATIVES);
    const expectedKeys = [...ESTIMATE_EXCLUDED_CATEGORY_SLUGS];
    expect(tableKeys.sort()).toEqual([...expectedKeys].sort());
  });
});
