import { STORE_DRAFTS, idbDelete, idbGet, idbPut } from '@/entities/estimate/model/idb';
import type { Plan2dData } from '@/entities/estimate/model/estimate-plan2d.types';
import type { CustomPricingValues } from '../utils/customPricing';

export type EstimateDraft = {
  id: string; 
  title?: string;
  siteType?: string;
  address?: string;
  marginPct?: number;
  riskReservePct?: number;
  siteFloor?: number | null;
  accessDifficulty?: string | null;
  urgency?: string | null;
  diagnostic?: Record<string, unknown>;
  customPricing?: CustomPricingValues;
  plan2d?: Plan2dData;
  savedAt: number;
};

export async function readDraft(projectId: string): Promise<EstimateDraft | undefined> {
  try {
    return await idbGet<EstimateDraft>(STORE_DRAFTS, projectId);
  } catch {
    return undefined;
  }
}

export async function writeDraft(draft: EstimateDraft): Promise<void> {
  try {
    await idbPut(STORE_DRAFTS, draft);
  } catch {
    /* ignore — autosave is best-effort */
  }
}

export async function clearDraft(projectId: string): Promise<void> {
  try {
    await idbDelete(STORE_DRAFTS, projectId);
  } catch {
    /* ignore */
  }
}
