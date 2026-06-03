import { env } from '@/shared/config/env';
import { apiFetch } from '@/shared/api/client';
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
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(fileDownloadPath(fileId), {
    credentials: 'include',
    headers,
  });
  if (!res.ok) {
    throw new Error(res.statusText || 'Download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_500);
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiFetch(`/files/${fileId}`, { method: 'DELETE' });
}
