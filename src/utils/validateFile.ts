import {
  IMAGE_EXT_SET,
  IMAGE_MIME_SET,
  MAX_FILE_SIZE,
  MAX_VIDEO_SIZE,
  MP4_HEAD_BYTES,
  MP4_TAIL_BYTES,
  VIDEO_EXT_SET,
  VIDEO_METADATA_TIMEOUT_MS,
  VIDEO_MIME_SET,
} from '@/constants/fileMedia.constants';
import type { FileErrorKey } from '@/types/file';

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

function readFileSlice(file: File, start: number, length: number): Promise<Uint8Array> {
  const end = Math.min(start + length, file.size);
  return file.slice(start, end).arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

function findAtomStart(buffer: Uint8Array, type: string): number {
  const t0 = type.charCodeAt(0);
  const t1 = type.charCodeAt(1);
  const t2 = type.charCodeAt(2);
  const t3 = type.charCodeAt(3);

  for (let i = 4; i <= buffer.length - 4; i += 1) {
    if (
      buffer[i] === t0 &&
      buffer[i + 1] === t1 &&
      buffer[i + 2] === t2 &&
      buffer[i + 3] === t3
    ) {
      return i - 4;
    }
  }
  return -1;
}

function parseMvhdDuration(buffer: Uint8Array): number | null {
  const mvhdStart = findAtomStart(buffer, 'mvhd');
  if (mvhdStart < 0 || mvhdStart + 32 > buffer.length) return null;

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const version = buffer[mvhdStart + 8];

  if (version === 1) {
    if (mvhdStart + 40 > buffer.length) return null;
    const timescale = view.getUint32(mvhdStart + 28);
    const duration = Number(view.getBigUint64(mvhdStart + 32));
    if (!timescale || !Number.isFinite(duration)) return null;
    return duration / timescale;
  }

  const timescale = view.getUint32(mvhdStart + 20);
  const duration = view.getUint32(mvhdStart + 24);
  if (!timescale || !Number.isFinite(duration)) return null;
  return duration / timescale;
}

async function parseMp4Duration(file: File): Promise<number | null> {
  const headLength = Math.min(MP4_HEAD_BYTES, file.size);
  const head = await readFileSlice(file, 0, headLength);
  const fromHead = parseMvhdDuration(head);
  if (fromHead !== null && fromHead > 0) return fromHead;

  if (file.size <= headLength) return null;

  const tailLength = Math.min(MP4_TAIL_BYTES, file.size);
  const tailStart = file.size - tailLength;
  const tail = await readFileSlice(file, tailStart, tailLength);
  const fromTail = parseMvhdDuration(tail);
  if (fromTail !== null && fromTail > 0) return fromTail;

  return null;
}

function isMp4Like(file: File): boolean {
  if (file.type === 'video/mp4' || file.type === 'video/quicktime') return true;
  const extension = ext(file.name);
  return extension === 'mp4' || extension === 'mov';
}

function getVideoDurationFromElement(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = `${url}#t=0.001`;

    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Video metadata timeout'));
    }, VIDEO_METADATA_TIMEOUT_MS);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
        return;
      }
      reject(new Error('Invalid video duration'));
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Nu s-a putut citi metadatele video.'));
    };
  });
}

/**
 * Read video duration from MP4/MOV atoms when possible (works for large files
 * with moov at the end), then fall back to an in-memory <video> element.
 */
export async function getVideoDuration(file: File): Promise<number> {
  if (isMp4Like(file)) {
    const parsed = await parseMp4Duration(file);
    if (parsed !== null && parsed > 0) return parsed;
  }

  return getVideoDurationFromElement(file);
}
