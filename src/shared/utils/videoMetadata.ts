import {
  MP4_HEAD_BYTES,
  MP4_TAIL_BYTES,
  VIDEO_METADATA_TIMEOUT_MS,
} from '@/shared/constants/fileMedia.constants';

function readUint32(data: Uint8Array, offset: number): number {
  return (
    ((data[offset]! << 24) |
      (data[offset + 1]! << 16) |
      (data[offset + 2]! << 8) |
      data[offset + 3]!) >>>
    0
  );
}

function readUint64(data: Uint8Array, offset: number): number {
  const high = readUint32(data, offset);
  const low = readUint32(data, offset + 4);
  return high * 2 ** 32 + low;
}

function findAtomOffset(data: Uint8Array, atomType: string, from = 0): number {
  const t0 = atomType.charCodeAt(0);
  const t1 = atomType.charCodeAt(1);
  const t2 = atomType.charCodeAt(2);
  const t3 = atomType.charCodeAt(3);

  for (let i = from; i <= data.length - 8; i += 1) {
    if (data[i + 4] === t0 && data[i + 5] === t1 && data[i + 6] === t2 && data[i + 7] === t3) {
      return i;
    }
  }

  return -1;
}

function parseMvhdDuration(data: Uint8Array): number | null {
  const mvhd = findAtomOffset(data, 'mvhd');
  if (mvhd < 0 || mvhd + 32 > data.length) return null;

  const version = data[mvhd + 8];
  if (version === 0) {
    const timescale = readUint32(data, mvhd + 20);
    const duration = readUint32(data, mvhd + 24);
    if (!timescale || !Number.isFinite(duration)) return null;
    return duration / timescale;
  }

  if (version === 1 && mvhd + 44 <= data.length) {
    const timescale = readUint32(data, mvhd + 28);
    const duration = readUint64(data, mvhd + 32);
    if (!timescale || !Number.isFinite(duration)) return null;
    return duration / timescale;
  }

  return null;
}

async function readMp4DurationFromFile(file: File): Promise<number | null> {
  const headBuffer = await file.slice(0, Math.min(file.size, MP4_HEAD_BYTES)).arrayBuffer();
  let duration = parseMvhdDuration(new Uint8Array(headBuffer));
  if (duration != null && duration > 0) return duration;

  if (file.size <= MP4_HEAD_BYTES) return null;

  const tailStart = Math.max(0, file.size - MP4_TAIL_BYTES);
  const tailBuffer = await file.slice(tailStart, file.size).arrayBuffer();
  duration = parseMvhdDuration(new Uint8Array(tailBuffer));
  return duration != null && duration > 0 ? duration : null;
}

function getVideoDurationFromElement(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    let settled = false;

    const settle = (action: 'resolve' | 'reject', value?: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      video.onloadedmetadata = null;
      video.ondurationchange = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
      if (action === 'resolve' && value != null) resolve(value);
      else reject(new Error('video metadata unavailable'));
    };

    const tryResolve = () => {
      const { duration } = video;
      if (Number.isFinite(duration) && duration > 0) {
        settle('resolve', duration);
      }
    };

    const timeoutId = window.setTimeout(() => settle('reject'), VIDEO_METADATA_TIMEOUT_MS);

    video.onloadedmetadata = tryResolve;
    video.ondurationchange = tryResolve;
    video.onerror = () => settle('reject');
    video.src = `${url}#t=0.001`;
    video.load();
  });
}

function isMp4Like(file: File): boolean {
  const lower = file.name.split('.').pop()?.toLowerCase() ?? '';
  return lower === 'mp4' || lower === 'mov' || file.type === 'video/mp4' || file.type === 'video/quicktime';
}

export async function getVideoDuration(file: File): Promise<number> {
  try {
    return await getVideoDurationFromElement(file);
  } catch {
    if (!isMp4Like(file)) throw new Error('video metadata unavailable');
  }

  const fromMp4 = await readMp4DurationFromFile(file);
  if (fromMp4 != null && fromMp4 > 0) return fromMp4;

  throw new Error('video metadata unavailable');
}
