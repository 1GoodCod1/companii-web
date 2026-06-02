import { isVideoUrl } from '@/shared/utils/validateFile';
import type { MediaThumbItem } from './MediaThumb';

export function isMediaItemVideo(item: MediaThumbItem): boolean {
  return item.kind === 'video' || isVideoUrl(item.url);
}
