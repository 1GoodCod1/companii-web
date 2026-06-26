import { env } from '@/shared/config/env';
import { apiFetch, downloadApiBlob } from '@/shared/api/client';
import { useAuthStore } from '@/entities/user/model/authStore';
import type { FileDto, FileVisibility } from '@/shared/types/file';

function unwrapUploadResponse(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const envelope = raw as { data?: unknown };
    return envelope.data ?? raw;
  }
  return raw;
}

type UploadOptions = {
  visibility?: FileVisibility;
  signal?: AbortSignal;
  onProgress?: (pct: number) => void;
};

function buildUploadPath(base: string, opts?: UploadOptions): string {
  if (!opts?.visibility) return base;
  const v = opts.visibility.toLowerCase();
  return `${base}?visibility=${encodeURIComponent(v)}`;
}

export async function uploadFile(
  file: File,
  opts?: UploadOptions,
): Promise<FileDto> {
  if (opts?.onProgress) {
    return uploadFileWithProgress(file, opts);
  }

  const fd = new FormData();
  fd.append('file', file);
  return apiFetch<FileDto>(buildUploadPath('/files/upload', opts), {
    method: 'POST',
    body: fd,
    signal: opts?.signal,
  });
}

async function uploadFileWithProgress(
  file: File,
  opts: UploadOptions,
): Promise<FileDto> {
  return new Promise<FileDto>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${env.apiUrl}${buildUploadPath('/files/upload', opts)}`;

    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');

    const { accessToken } = useAuthStore.getState();
    if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    xhr.withCredentials = true;

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        opts.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const raw = JSON.parse(xhr.responseText);
        const data = unwrapUploadResponse(raw) as FileDto;
        resolve(data);
      } catch {
        reject(new Error('Failed to parse upload response'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  });
}

export async function uploadFiles(
  files: File[],
  opts?: UploadOptions,
): Promise<FileDto[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const data = await apiFetch<FileDto[] | { items: FileDto[] }>(
    buildUploadPath('/files/upload-many', opts),
    { method: 'POST', body: fd },
  );
  return Array.isArray(data) ? data : data.items;
}

export function fileDownloadPath(fileId: string): string {
  return `${env.apiUrl}/files/${fileId}/download`;
}

export async function downloadFile(fileId: string, filename?: string): Promise<void> {
  await downloadApiBlob(`/files/${fileId}/download`, filename);
}

/**
 * Opens a (private) file inline in a new tab — for *viewing* a photo/PDF rather
 * than downloading it. Fetches with the auth token (the file endpoint is private
 * and `<img src>`/plain links can't send the bearer header), then points a tab
 * at the resulting blob URL. The tab is opened synchronously so popup blockers
 * allow it.
 */
export async function openFileInNewTab(fileId: string): Promise<void> {
  const tab = window.open('', '_blank');
  try {
    const { accessToken } = useAuthStore.getState();
    const headers = new Headers();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const res = await fetch(`${env.apiUrl}/files/${fileId}/download`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error(`Failed to load file (${res.status})`);

    const url = URL.createObjectURL(await res.blob());
    if (tab) tab.location.href = url;
    else window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    tab?.close();
    throw err;
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiFetch(`/files/${fileId}`, { method: 'DELETE' });
}
