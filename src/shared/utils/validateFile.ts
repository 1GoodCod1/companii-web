import {
  IMAGE_EXT_SET,
  IMAGE_MIME_SET,
  MAX_FILE_SIZE,
  MAX_VIDEO_SIZE,
  VIDEO_EXT_SET,
  VIDEO_MIME_SET,
} from '@/shared/constants/fileMedia.constants';

export {
  MAX_FILE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_VIDEO_DURATION,
  MAX_VIDEO_COUNT,
} from '@/shared/constants/fileMedia.constants';

export { getVideoDuration } from '@/shared/utils/videoMetadata';

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
  return matches(file, VIDEO_MIME_SET, VIDEO_EXT_SET);
}

export function isVideoUrl(url: string): boolean {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  return VIDEO_EXT_SET.has(ext(lower));
}

export function isMediaFile(file: File): boolean {
  return matches(file, IMAGE_MIME_SET, IMAGE_EXT_SET) || matches(file, VIDEO_MIME_SET, VIDEO_EXT_SET);
}

export function validateImageFile(file: File): FileErrorKey | null {
  if (!matches(file, IMAGE_MIME_SET, IMAGE_EXT_SET)) return 'files.invalidType';
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}

export function validateMediaFile(file: File): FileErrorKey | null {
  if (!isMediaFile(file)) return 'files.invalidType';
  const maxSize = isVideoFile(file) ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) return 'files.tooLarge';
  return null;
}
