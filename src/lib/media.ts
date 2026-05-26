import { env } from '@/config/env';

const UPLOAD_PATH_RE = /^\/uploads\/.+/i;
const UPLOAD_FILE_RE = /^[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/i;

export function apiOrigin(): string {
  return env.apiUrl.replace(/\/api\/v1\/?$/, '');
}

export function mediaBaseUrl(): string {
  const raw = import.meta.env.VITE_MEDIA_URL as string | undefined;
  if (raw === '') return '';
  if (raw?.trim()) return raw.trim().replace(/\/$/, '');
  return apiOrigin();
}

function normalizeUploadPath(raw: string): string | null {
  const normalized = raw.replace(/\\/g, '/').trim();
  if (UPLOAD_PATH_RE.test(normalized)) return normalized;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  if (UPLOAD_FILE_RE.test(normalized)) return `/uploads/${normalized}`;
  return null;
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('b2://')) return null;

  if (/^(https?:|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  const uploadPath = normalizeUploadPath(trimmed);
  if (uploadPath) {
    const base = mediaBaseUrl();
    return base ? `${base}${uploadPath}` : uploadPath;
  }

  if (trimmed.startsWith('/')) {
    const base = mediaBaseUrl();
    return base ? `${base}${trimmed}` : trimmed;
  }

  return trimmed;
}

export function resolvePrivateMediaUrl(fileId: string): string {
  return `${apiOrigin()}/api/v1/files/${encodeURIComponent(fileId)}/download`;
}

export function resolveFileMediaUrl(file: {
  id: string;
  path?: string | null;
  url?: string | null;
}): string | null {
  const direct = resolveMediaUrl(file.url ?? file.path);
  if (direct) return direct;
  if (file.id) return resolvePrivateMediaUrl(file.id);
  return null;
}
