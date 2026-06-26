import { ApiError } from '@/shared/api/client/apiError';

export function getErrorMessage(err: unknown, fallback = 'A apărut o eroare.'): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err.trim();
  return fallback;
}

/** A 409 from the API — e.g. a scheduling slot taken by another work. */
export function isConflictError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}
