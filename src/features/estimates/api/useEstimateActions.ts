import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, downloadApiBlob } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';
import type { EstimateProjectDto } from '@/entities/estimate/model/estimates';
import { ESTIMATES_API_BASE } from './constants';

export function useGenerateEstimateQuoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<EstimateProjectDto>(`${ESTIMATES_API_BASE}/projects/${id}/generate-quote`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.quotes });
    },
  });
}

export function useConvertEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode?: 'single' | 'by-stage' }) =>
      apiFetch<{ intervention?: unknown; interventions?: unknown[] }>(`${ESTIMATES_API_BASE}/projects/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ mode: mode ?? 'single' }),
      }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
      void qc.invalidateQueries({ queryKey: queryKeys.fsm.interventions() });
    },
  });
}

export function useSendEstimateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ project: EstimateProjectDto; emailSent: boolean }>(`${ESTIMATES_API_BASE}/projects/${id}/send`, {
        method: 'POST',
      }),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.project(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.estimates.projects });
    },
  });
}

export async function downloadPortalEstimatePdf(projectId: string, filename: string, lang?: 'ro' | 'ru') {
  const langParam = lang === 'ru' ? '?lang=ru' : '';
  return downloadApiBlob(`/portal/estimates/${projectId}/pdf${langParam}`, filename);
}

export function useDownloadEstimatePdf() {
  const abortRef = useRef<AbortController | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (projectId: string, filename: string, lang?: 'ro' | 'ru') => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsDownloading(true);
    try {
      const langParam = lang === 'ru' ? '?lang=ru' : '';
      await downloadApiBlob(
        `${ESTIMATES_API_BASE}/projects/${projectId}/pdf${langParam}`,
        filename,
        false,
        { signal: controller.signal },
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') throw err;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsDownloading(false);
  }, []);

  return { download, cancel, isDownloading };
}

export function useDownloadPortalEstimatePdf() {
  const abortRef = useRef<AbortController | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (projectId: string, filename: string, lang?: 'ro' | 'ru') => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsDownloading(true);
    try {
      const langParam = lang === 'ru' ? '?lang=ru' : '';
      await downloadApiBlob(
        `/portal/estimates/${projectId}/pdf${langParam}`,
        filename,
        false,
        { signal: controller.signal },
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') throw err;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsDownloading(false);
  }, []);

  return { download, cancel, isDownloading };
}
