import { MediaImage } from '@/shared/ui/MediaImage';
import { MediaVideo } from '@/shared/ui/MediaVideo';
import type { MediaThumbItem } from './MediaThumb';
import { isMediaItemVideo } from './mediaItem';

interface ActiveMediaViewProps {
  item: MediaThumbItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPlayToggle: () => void;
  isPlaying: boolean;
  photoAlt: string;
}

export function ActiveMediaView({ item, videoRef, photoAlt }: ActiveMediaViewProps) {
  if (isMediaItemVideo(item)) {
    return (
      <MediaVideo
        ref={videoRef}
        src={item.url}
        className="size-full bg-black object-contain rounded-2xl"
        controls
        playsInline
        loop
        preload="metadata"
      />
    );
  }

  return (
    <MediaImage
      src={item.url}
      alt={item.caption ?? photoAlt}
      className="size-full object-cover rounded-2xl"
    />
  );
}
