const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type FileErrorKey = 'files.invalidType' | 'files.tooLarge';

function ext(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function matches(file: File, mimes: Set<string>, exts: Set<string>): boolean {
  if (mimes.has(file.type)) return true;
  if (file.type) return false;
  return exts.has(ext(file.name));
}

export function validateImageFile(file: File): FileErrorKey | null {
  if (!matches(file, IMAGE_MIME, IMAGE_EXT)) return 'files.invalidType';
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}
