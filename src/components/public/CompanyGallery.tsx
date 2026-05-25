import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import type { CompanyGalleryImageDto } from '@/features/companies/types';
import { MediaImage } from '@/components/ui/MediaImage';

export function CompanyGallery({ images }: { images: CompanyGalleryImageDto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? images[activeIndex] : null;
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }, [images.length]);

  const close = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, close, goPrev, goNext]);

  if (!images.length) {
    return (
      <div className="rounded-3xl bg-slate-50/80 px-6 py-16 text-center text-sm text-gray-400">
        Galeria foto va fi disponibilă în curând.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`group relative overflow-hidden rounded-2xl bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              index === 0 ? 'md:col-span-2 md:row-span-2 aspect-[16/10]' : 'aspect-[4/3]'
            }`}
          >
            <MediaImage
              src={image.url}
              alt={image.caption ?? `Foto ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              fallbackClassName="h-full w-full bg-slate-200"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <ZoomIn className="h-3 w-3" />
              Mărește
            </span>
            {image.caption ? (
              <p className="absolute bottom-0 left-0 right-0 p-3 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {image.caption}
              </p>
            ) : null}
          </button>
        ))}
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {active && activeIndex !== null ? (
                <motion.div
                  key="gallery-lightbox"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Galerie foto"
                >
                  <button
                  type="button"
                  aria-label="Închide galeria"
                  className="absolute inset-0 cursor-pointer border-0 bg-black/75 backdrop-blur-[2px] p-0"
                  onClick={close}
                />

                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
                  <p className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md pointer-events-auto cursor-default">
                    {activeIndex + 1} / {images.length}
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="pointer-events-auto cursor-pointer inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-2 text-sm font-medium text-white hover:bg-black/55 transition-colors backdrop-blur-md"
                    aria-label="Închide galeria"
                  >
                    <X className="h-4 w-4" />
                    Închide
                  </button>
                </div>

                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-3 sm:left-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                      aria-label="Foto anterioară"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-3 sm:right-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                      aria-label="Foto următoare"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                ) : null}

                <motion.div
                  key={active.id}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-fit max-w-[min(100vw-7rem,80rem)]"
                >
                  <MediaImage
                    src={active.url}
                    alt={active.caption ?? 'Foto companie'}
                    className="mx-auto block max-h-[min(78vh,820px)] max-w-full object-contain rounded-2xl shadow-2xl"
                  />
                  {active.caption ? (
                    <p className="mt-4 text-center text-sm text-white/90 leading-relaxed">{active.caption}</p>
                  ) : null}
                </motion.div>

                <p className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-white/55 pointer-events-none">
                  {hasMultiple
                    ? 'Săgeți ← → pentru navigare · click pe fundal pentru închidere'
                    : 'Click pe fundal pentru închidere'}
                </p>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
