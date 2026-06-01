import type { FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';

export function showFirstFormError(errors: FieldErrors) {
  for (const error of Object.values(errors)) {
    if (error && typeof error === 'object' && 'message' in error && error.message) {
      toast.error(String(error.message));
      return;
    }
  }
}
