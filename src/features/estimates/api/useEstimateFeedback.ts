import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import { ESTIMATES_API_BASE } from './constants';

export interface CreateEstimateFeedbackDto {
  projectId?: string;
  category: string;
  details: string;
}

export interface EstimateFeedbackResponse {
  id: string;
  userId: string;
  companyId: string | null;
  projectId: string | null;
  category: string;
  details: string;
  createdAt: string;
}

export function useSubmitEstimateFeedbackMutation() {
  return useMutation({
    mutationFn: (body: CreateEstimateFeedbackDto) =>
      apiFetch<EstimateFeedbackResponse>(`${ESTIMATES_API_BASE}/feedback`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}

