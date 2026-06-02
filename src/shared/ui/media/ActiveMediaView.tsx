import { Play } from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
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

export function ActiveMediaView({
  item,
  videoRef,
  onPlayToggle,
  isPlaying,
  photoAlt,
}: ActiveMediaViewProps) {
  const isVideo = isMediaItemVideo(item);

  if (isVideo) {
    return (
      <button
        type="button"
        className="relative size-full group cursor-pointer border-0 bg-transparent p-0"
        onClick={onPlayToggle}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        <MediaVideo
          ref={videoRef}
          src={item.url}
          className="size-full object-cover rounded-2xl"
          playsInline
          preload="metadata"
          loop
        />
        <AnimatePresence>
          {!isPlaying && (
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="size-16 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-violet-600/30 transition-transform hover:scale-110">
                <Play className="size-7 text-white ml-1" fill="white" />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </button>
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
