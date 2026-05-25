import { ApiError } from '@/api/client';

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'Acest email este deja înregistrat. Autentificați-vă sau folosiți alt email.';
    }
    if (err.status === 401) {
      return 'Email/telefon sau parolă incorectă.';
    }
    if (err.status === 429) {
      return 'Prea multe încercări. Încercați din nou peste câteva minute.';
    }
    return err.message || 'A apărut o eroare la autentificare.';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'A apărut o eroare neașteptată.';
}
