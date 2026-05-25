const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

const DOC_MIME = new Set([
  ...IMAGE_MIME,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const DOC_EXT = new Set([...IMAGE_EXT, 'pdf', 'doc', 'docx']);

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

export function validateDocumentFile(file: File): FileErrorKey | null {
  if (!matches(file, DOC_MIME, DOC_EXT)) return 'files.invalidType';
  if (file.size > MAX_FILE_SIZE) return 'files.tooLarge';
  return null;
}
