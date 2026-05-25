import { env } from '@/config/env';

const UPLOAD_PATH_RE = /^\/uploads\/.+/i;
const UPLOAD_FILE_RE = /^[a-f0-9-]{36}\.(png|jpe?g|webp|gif)$/i;

/** API origin without `/api/v1` suffix — used for absolute media URLs in production. */
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

/**
 * Resolve any stored media reference (upload path, external URL, blob preview) to a browser-loadable URL.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

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
