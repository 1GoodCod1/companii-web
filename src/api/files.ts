import { env } from '@/config/env';
import { apiFetch } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { FileDto } from '@/types/file';

export async function uploadFile(file: File): Promise<FileDto> {
  const fd = new FormData();
  fd.append('file', file);
  return apiFetch<FileDto>('/files/upload', { method: 'POST', body: fd });
}

export async function uploadFiles(files: File[]): Promise<FileDto[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const data = await apiFetch<FileDto[] | { items: FileDto[] }>(
    '/files/upload-many',
    { method: 'POST', body: fd },
  );
  return Array.isArray(data) ? data : data.items;
}

export function fileDownloadPath(fileId: string): string {
  return `${env.apiUrl}/files/${fileId}/download`;
}

/** Secure download via API (auth cookie + Bearer). */
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
  a.click();
  URL.revokeObjectURL(url);
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiFetch(`/files/${fileId}`, { method: 'DELETE' });
}
