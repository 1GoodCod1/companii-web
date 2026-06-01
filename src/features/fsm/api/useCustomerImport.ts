import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';

export type CustomerImportPreviewRow = {
  rowNumber: number;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  action: 'create' | 'update' | 'skip' | 'error';
  reason?: string;
  existingCustomerId?: string;
};

export type CustomerImportPreviewResult = {
  rows: CustomerImportPreviewRow[];
  summary: {
    total: number;
    create: number;
    update: number;
    skip: number;
    error: number;
  };
};

export type CustomerImportConfirmResult = {
  created: number;
  updated: number;
  skipped: number;
  customerIds: string[];
};

export function downloadCustomerImportTemplate(format: 'xlsx' | 'csv') {
  return downloadApiBlob(
    `/fsm/customers/import/template?format=${format}`,
    format === 'csv' ? 'faber-clienti-import.csv' : 'faber-clienti-import.xlsx',
  );
}

export function usePreviewCustomerImportMutation() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiFetch<CustomerImportPreviewResult>('/fsm/customers/import/preview', {
        method: 'POST',
        body: formData,
      });
    },
  });
}

export function useConfirmCustomerImportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: Array<{
      action: 'create' | 'update';
      fullName: string;
      phone: string;
      email?: string;
      address: string;
      notes?: string;
      existingCustomerId?: string;
    }>) =>
      apiFetch<CustomerImportConfirmResult>('/fsm/customers/import/confirm', {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.customersRoot });
    },
  });
}
