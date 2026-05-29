const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

const VIDEO_MIME = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);
const VIDEO_EXT = new Set(['mp4', 'mov', 'webm']);

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 120;
export const MAX_VIDEO_COUNT = 3;

export type FileErrorKey = 'files.invalidType' | 'files.tooLarge';

function ext(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function matches(file: File, mimes: Set<string>, exts: Set<string>): boolean {
  if (mimes.has(file.type)) return true;
  if (file.type) return false;
  return exts.has(ext(file.name));
}

export function isVideoFile(file: File): boolean {
  return matches(file, VIDEO_MIME, VIDEO_EXT);
}

export function isVideoUrl(url: string): boolean {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  return VIDEO_EXT.has(ext(lower));
}

export function isMediaFile(file: File): boolean {
  return matches(file, IMAGE_MIME, IMAGE_EXT) || matches(file, VIDEO_MIME, VIDEO_EXT);
}

export function validateImageFile(file: File): FileErrorKey | null {
  if (!matches(file, IMAGE_MIME, IMAGE_EXT)) return 'files.invalidType';
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}

export function validateMediaFile(file: File): FileErrorKey | null {
  if (!isMediaFile(file)) return 'files.invalidType';
  const maxSize = isVideoFile(file) ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) return 'files.tooLarge';
  return null;
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Nu s-a putut citi metadatele video.'));
    };
  });
}
