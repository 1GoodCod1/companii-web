import { env } from '@/config/env';

import { applyAuthHeaders, getRequestAuthContext } from './authContext';
import { DOWNLOAD_REQUEST_TIMEOUT_MS, STREAM_DOWNLOAD_THRESHOLD_BYTES } from './constants';
import { refreshAccessToken } from './refreshAccessToken';
import { composeAbortSignal, throwIfNotOk } from './requestHelpers';

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function downloadApiBlob(
  path: string,
  filename: string,
  retried = false,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const { accessToken, companyId } = getRequestAuthContext();
  const headers = new Headers();
  applyAuthHeaders(headers, accessToken, companyId);

  const { signal, cancelTimer } = composeAbortSignal(
    options.signal ?? null,
    DOWNLOAD_REQUEST_TIMEOUT_MS,
  );

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      credentials: 'include',
      headers,
      signal,
    });
  } catch (err) {
    cancelTimer();
    throw err;
  }

  if (res.status === 401 && !retried) {
    cancelTimer();
    if (env.useHttpOnly || accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return downloadApiBlob(path, filename, true, options);
    }
  }

  try {
    await throwIfNotOk(res);

    const contentLength = Number(res.headers.get('content-length') ?? '0');
    const useStreaming =
      !!res.body &&
      contentLength > STREAM_DOWNLOAD_THRESHOLD_BYTES &&
      typeof window !== 'undefined' &&
      'showSaveFilePicker' in window === false;

    if (useStreaming) {
      const chunks: BlobPart[] = [];
      const reader = res.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      triggerBlobDownload(
        new Blob(chunks, {
          type: res.headers.get('content-type') ?? 'application/octet-stream',
        }),
        filename,
      );
      return;
    }

    triggerBlobDownload(await res.blob(), filename);
  } finally {
    cancelTimer();
  }
}
