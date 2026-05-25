import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';

export function useWaitlistMutation() {
  return useMutation({
    mutationFn: (body: { email: string; companyName: string }) =>
      apiFetch('/companies/waitlist', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}
