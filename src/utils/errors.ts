export function getErrorMessage(err: unknown, fallback = 'A apărut o eroare.'): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err.trim();
  return fallback;
}
