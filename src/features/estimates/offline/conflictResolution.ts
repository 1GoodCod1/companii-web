export const ESTIMATE_VERSION_CONFLICT = 'ESTIMATE_VERSION_CONFLICT';

export type EstimateVersionConflict = {
  code: typeof ESTIMATE_VERSION_CONFLICT;
  expectedVersion: number;
  serverVersion: number;
  number: string;
  title: string;
};

export function isVersionConflict(err: unknown): err is { response: EstimateVersionConflict } {
  if (!err || typeof err !== 'object') return false;
  const response = (err as { response?: { code?: unknown } }).response;
  return !!response && response.code === ESTIMATE_VERSION_CONFLICT;
}

export function extractConflict(err: unknown): EstimateVersionConflict | null {
  if (!isVersionConflict(err)) return null;
  return (err as { response: EstimateVersionConflict }).response;
}

export function newClientMutationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `cm_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function newClientDraftId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `dd_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
