/**
 * Shared file/media limits and type allowlists.
 * Keep in sync with companii-api/src/common/constants/file-media.constants.ts
 */
export const FILE_MEDIA_LIMITS = {
  maxImageBytes: 10 * 1024 * 1024,
  maxVideoBytes: 150 * 1024 * 1024,
  maxBatchCount: 10,
  maxGalleryVideos: 2,
  maxVideoDurationSeconds: 120,
} as const;

/** Convenience aliases for validation and UI limits. */
export const MAX_FILE_SIZE = FILE_MEDIA_LIMITS.maxImageBytes;
export const MAX_VIDEO_SIZE = FILE_MEDIA_LIMITS.maxVideoBytes;
export const MAX_VIDEO_DURATION = FILE_MEDIA_LIMITS.maxVideoDurationSeconds;
export const MAX_VIDEO_COUNT = FILE_MEDIA_LIMITS.maxGalleryVideos;

/** MP4/MOV atom parsing limits for reading video duration without full decode. */
export const MP4_HEAD_BYTES = 512 * 1024;
export const MP4_TAIL_BYTES = 4 * 1024 * 1024;
export const VIDEO_METADATA_TIMEOUT_MS = 30_000;

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'] as const;

export const IMAGE_MIME_SET = new Set<string>(IMAGE_MIME_TYPES);
export const IMAGE_EXT_SET = new Set<string>(IMAGE_EXTENSIONS);
export const VIDEO_MIME_SET = new Set<string>(VIDEO_MIME_TYPES);
export const VIDEO_EXT_SET = new Set<string>(VIDEO_EXTENSIONS);
