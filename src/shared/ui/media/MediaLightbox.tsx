import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react';
import { MediaImage } from '@/shared/ui/MediaImage';
import { MediaVideo } from '@/shared/ui/MediaVideo';
import type { MediaThumbItem } from './MediaThumb';
import { isMediaItemVideo } from './mediaItem';

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
  videoRef,
  onPrev,
  onNext,
  onClose,
  labels,
}: MediaLightboxProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {item && index !== null ? (
        <m.div
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
              <XIcon className="size-4" />
              {labels.close}
            </button>
          </div>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={onPrev}
                className="absolute left-3 sm:left-6 top-1/2 z-20 flex size-11 sm:size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                aria-label={labels.prev}
              >
                <CaretLeftIcon className="size-6" />
              </button>
              <button
                type="button"
                onClick={onNext}
                className="absolute right-3 sm:right-6 top-1/2 z-20 flex size-11 sm:size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                aria-label={labels.next}
              >
                <CaretRightIcon className="size-6" />
              </button>
            </>
          ) : null}

          <m.div
            key={item.id}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-fit max-w-[min(100vw-7rem,80rem)]"
          >
            {isMediaItemVideo(item) ? (
              <MediaVideo
                ref={videoRef}
                src={item.url}
                className="mx-auto block max-h-[min(78vh,820px)] max-w-full rounded-2xl bg-black shadow-2xl"
                controls
                autoPlay
                playsInline
                loop
                preload="metadata"
              />
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
          </m.div>

          <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-white/55 pointer-events-none">
            {hasMultiple ? labels.hintMultiple : labels.hintSingle}
          </p>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
