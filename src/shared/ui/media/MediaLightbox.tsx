import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { MediaImage } from '@/shared/ui/MediaImage';
import { MediaVideo } from '@/shared/ui/MediaVideo';
import { isMediaItemVideo, type MediaThumbItem } from './MediaThumb';

interface MediaLightboxProps {
  item: MediaThumbItem | null;
  index: number | null;
  total: number;
  hasMultiple: boolean;
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  labels: {
    lightboxAria: string;
    closeGallery: string;
    close: string;
    prev: string;
    next: string;
    photoAlt: string;
    hintMultiple: string;
    hintSingle: string;
  };
}

export function MediaLightbox({
  item,
  index,
  total,
  hasMultiple,
  isPlaying,
  videoRef,
  onPlayToggle,
  onPrev,
  onNext,
  onClose,
  labels,
}: MediaLightboxProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {item && index !== null ? (
        <motion.div
          key="gallery-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={labels.lightboxAria}
        >
          <button
            type="button"
            aria-label={labels.closeGallery}
            className="absolute inset-0 cursor-pointer border-0 bg-black/80 backdrop-blur-md p-0"
            onClick={onClose}
          />

          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
            <p className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md pointer-events-auto cursor-default">
              {index + 1} / {total}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto cursor-pointer inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-2 text-sm font-medium text-white hover:bg-black/55 transition-colors backdrop-blur-md"
              aria-label={labels.closeGallery}
            >
              <X className="h-4 w-4" />
              {labels.close}
            </button>
          </div>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={onPrev}
                className="absolute left-3 sm:left-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                aria-label={labels.prev}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={onNext}
                className="absolute right-3 sm:right-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                aria-label={labels.next}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <motion.div
            key={item.id}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-fit max-w-[min(100vw-7rem,80rem)]"
          >
            {isMediaItemVideo(item) ? (
              <div
                className="relative cursor-pointer mx-auto"
                onClick={onPlayToggle}
              >
                <MediaVideo
                  ref={videoRef}
                  src={item.url}
                  className="mx-auto block max-h-[min(78vh,820px)] max-w-full rounded-2xl shadow-2xl"
                  playsInline
                  loop
                  preload="metadata"
                />
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-violet-600/30">
                        <Play className="h-9 w-9 text-white ml-1" fill="white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <MediaImage
                src={item.url}
                alt={item.caption ?? labels.photoAlt}
                className="mx-auto block max-h-[min(78vh,820px)] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            )}
            {item.caption ? (
              <p className="mt-4 text-center text-sm text-white/90 leading-relaxed">
                {item.caption}
              </p>
            ) : null}
          </motion.div>

          <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-white/55 pointer-events-none">
            {hasMultiple ? labels.hintMultiple : labels.hintSingle}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
