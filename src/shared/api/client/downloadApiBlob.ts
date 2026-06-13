import { env } from '@/shared/config/env';

import { apiClientConfig } from './config';
import { DOWNLOAD_REQUEST_TIMEOUT_MS, STREAM_DOWNLOAD_THRESHOLD_BYTES } from './constants';
import { composeAbortSignal, throwIfNotOk } from './requestHelpers';

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'text/csv': 'csv',
};

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      // fall through to the plain filename
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

/**
 * Uploaded files keep their real extension server-side, so when the caller
 * passes a descriptive name without one (e.g. "Bon-ciment"), the extension is
 * taken from the response instead of being guessed at the call site.
 */
function resolveDownloadFilename(provided: string | undefined, res: Response): string {
  const serverName = parseContentDispositionFilename(res.headers.get('content-disposition'));
  if (!provided) return serverName ?? 'download';
  if (/\.[A-Za-z0-9]{1,8}$/.test(provided)) return provided;
  const contentType = res.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  const ext =
    MIME_EXTENSIONS[contentType] ?? /\.([A-Za-z0-9]{1,8})$/.exec(serverName ?? '')?.[1] ?? null;
  return ext ? `${provided}.${ext}` : provided;
}

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
  filename?: string,
  retried = false,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const auth = apiClientConfig.getAuthContext ? apiClientConfig.getAuthContext() : { accessToken: null, companyId: null };
  const headers = new Headers();
  if (auth.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`);

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
    if (apiClientConfig.onUnauthorized) {
      const refreshed = await apiClientConfig.onUnauthorized();
      if (refreshed) return downloadApiBlob(path, filename, true, options);
    }
  }

  try {
    await throwIfNotOk(res);

    const resolvedFilename = resolveDownloadFilename(filename, res);
    const contentLength = Number(res.headers.get('content-length') ?? '0');
    const useStreaming =
      !!res.body &&
      contentLength > STREAM_DOWNLOAD_THRESHOLD_BYTES &&
      typeof window !== 'undefined' &&
      'showSaveFilePicker' in window === false;

    if (useStreaming) {
      const chunks: BlobPart[] = [];
      const reader = res.body!.getReader();
      const read = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) return;
        if (value) chunks.push(value);
        return read();
      };
      await read();
      triggerBlobDownload(
        new Blob(chunks, {
          type: res.headers.get('content-type') ?? 'application/octet-stream',
        }),
        resolvedFilename,
      );
      return;
    }

    triggerBlobDownload(await res.blob(), resolvedFilename);
  } finally {
    cancelTimer();
  }
}
