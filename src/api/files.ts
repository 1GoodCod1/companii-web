import { env } from '@/config/env';
import { apiFetch } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { FileDto, FileVisibility } from '@/types/file';

type UploadOptions = {
  visibility?: FileVisibility;
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
  const fd = new FormData();
  fd.append('file', file);
  return apiFetch<FileDto>(buildUploadPath('/files/upload', opts), {
    method: 'POST',
    body: fd,
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
  // Safari can dispatch the download asynchronously after `a.click()` returns,
  // so revoking the ObjectURL immediately may invalidate the URL before the
  // browser fetches it. A short delay keeps the blob alive long enough.
  setTimeout(() => URL.revokeObjectURL(url), 1_500);
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiFetch(`/files/${fileId}`, { method: 'DELETE' });
}
