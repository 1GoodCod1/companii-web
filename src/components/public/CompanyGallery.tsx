import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Film } from 'lucide-react';
import type { CompanyGalleryImageDto } from '@/types/companies';
import { MediaImage } from '@/components/ui/MediaImage';
import { isVideoUrl } from '@/utils/validateFile';

/* ─────────────────── Constants ─────────────────── */
const MAX_VISIBLE_THUMBS = 5;

/* ─────────────────── Helpers ─────────────────── */
function MediaThumb({
  item,
  isActive,
  onClick,
  index,
}: {
  item: CompanyGalleryImageDto;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  const isVideo = isVideoUrl(item.url);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Media ${index + 1}`}
      className={`relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 shrink-0 cursor-pointer ${
        isActive
          ? 'border-violet-500 ring-2 ring-violet-500/20 scale-[1.02] shadow-lg shadow-violet-500/10'
          : 'border-transparent hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {isVideo ? (
        <>
          <video
            src={item.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Film className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </>
      ) : (
        <MediaImage
          src={item.url}
          alt={item.caption ?? `Foto ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          fallbackClassName="h-full w-full bg-slate-200"
        />
      )}
    </button>
  );
}

function ActiveMediaView({
  item,
  videoRef,
  onPlayToggle,
  isPlaying,
}: {
  item: CompanyGalleryImageDto;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPlayToggle: () => void;
  isPlaying: boolean;
}) {
  const isVideo = isVideoUrl(item.url);

  if (isVideo) {
    return (
      <div className="relative w-full h-full group cursor-pointer" onClick={onPlayToggle}>
        <video
          ref={videoRef}
          src={item.url}
          className="h-full w-full object-cover rounded-2xl"
          playsInline
          preload="metadata"
          loop
        />
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-violet-600/30 transition-transform hover:scale-110">
                <Play className="h-7 w-7 text-white ml-1" fill="white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <MediaImage
      src={item.url}
      alt={item.caption ?? 'Foto companie'}
      className="h-full w-full object-cover rounded-2xl"
    />
  );
}

/* ─────────────────── Filter type ─────────────────── */
type MediaFilter = 'all' | 'photo' | 'video';

/* ─────────────────── Main Component ─────────────────── */
export function CompanyGallery({ images }: { images: CompanyGalleryImageDto[] }) {
  const [filter] = useState<MediaFilter>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxPlaying, setLightboxPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  // Derived filtered list
  const filteredImages =
    filter === 'all'
      ? images
      : filter === 'video'
        ? images.filter((img) => isVideoUrl(img.url))
        : images.filter((img) => !isVideoUrl(img.url));

  const hasMultiple = filteredImages.length > 1;
  const active = filteredImages[activeIndex] ?? filteredImages[0];
  const lightboxActive = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  const selectSlide = useCallback((index: number) => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setActiveIndex(index);
  }, []);

  const openLightbox = useCallback((index: number | null) => {
    lightboxVideoRef.current?.pause();
    setLightboxPlaying(false);
    setLightboxIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    selectSlide(activeIndex === 0 ? filteredImages.length - 1 : activeIndex - 1);
  }, [activeIndex, filteredImages.length, selectSlide]);

  const goNext = useCallback(() => {
    selectSlide(activeIndex === filteredImages.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, filteredImages.length, selectSlide]);

  const lightboxPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    openLightbox(lightboxIndex === 0 ? filteredImages.length - 1 : lightboxIndex - 1);
  }, [lightboxIndex, filteredImages.length, openLightbox]);

  const lightboxNext = useCallback(() => {
    if (lightboxIndex === null) return;
    openLightbox(lightboxIndex === filteredImages.length - 1 ? 0 : lightboxIndex + 1);
  }, [lightboxIndex, filteredImages.length, openLightbox]);

  const closeLightbox = useCallback(() => {
    openLightbox(null);
  }, [openLightbox]);

  const handlePlayToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleLightboxPlayToggle = useCallback(() => {
    if (!lightboxVideoRef.current) return;
    if (lightboxPlaying) {
      lightboxVideoRef.current.pause();
      setLightboxPlaying(false);
    } else {
      lightboxVideoRef.current.play();
      setLightboxPlaying(true);
    }
  }, [lightboxPlaying]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, lightboxPrev, lightboxNext]);

  /* ───── Empty state ───── */
  if (!images.length) {
    return (
      <div className="rounded-3xl bg-slate-50/80 px-6 py-16 text-center text-sm text-gray-400">
        Galeria foto va fi disponibilă în curând.
      </div>
    );
  }

  /* ───── Single image — simple display ───── */
  if (images.length === 1) {
    const solo = images[0]!;
    const isSoloVideo = isVideoUrl(solo.url);
    return (
      <>
        <div
          className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10] cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          {isSoloVideo ? (
            <div className="relative w-full h-full">
              <video src={solo.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>
          ) : (
            <MediaImage
              src={solo.url}
              alt={solo.caption ?? 'Foto companie'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="h-full w-full bg-slate-200"
            />
          )}
        </div>
        {renderLightbox()}
      </>
    );
  }

  /* ─── Visible thumbnails slice ─── */
  const thumbs = images.slice(0, MAX_VISIBLE_THUMBS);
  const extraCount = images.length - MAX_VISIBLE_THUMBS;

  /* ───── Slideshow Layout ───── */
  function renderLightbox() {
    return typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {lightboxActive && lightboxIndex !== null ? (
              <motion.div
                key="gallery-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
                role="dialog"
                aria-modal="true"
                aria-label="Galerie media"
              >
                <button
                  type="button"
                  aria-label="Închide galeria"
                  className="absolute inset-0 cursor-pointer border-0 bg-black/80 backdrop-blur-md p-0"
                  onClick={closeLightbox}
                />

                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
                  <p className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md pointer-events-auto cursor-default">
                    {lightboxIndex + 1} / {images.length}
                  </p>
                  <button
                    type="button"
                    onClick={closeLightbox}
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
                      onClick={lightboxPrev}
                      className="absolute left-3 sm:left-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                      aria-label="Anterioară"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={lightboxNext}
                      className="absolute right-3 sm:right-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                      aria-label="Următoare"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                ) : null}

                <motion.div
                  key={lightboxActive.id}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-fit max-w-[min(100vw-7rem,80rem)]"
                >
                  {isVideoUrl(lightboxActive.url) ? (
                    <div
                      className="relative cursor-pointer mx-auto"
                      onClick={handleLightboxPlayToggle}
                    >
                      <video
                        ref={lightboxVideoRef}
                        src={lightboxActive.url}
                        className="mx-auto block max-h-[min(78vh,820px)] max-w-full rounded-2xl shadow-2xl"
                        playsInline
                        loop
                      />
                      <AnimatePresence>
                        {!lightboxPlaying && (
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
                      src={lightboxActive.url}
                      alt={lightboxActive.caption ?? 'Foto companie'}
                      className="mx-auto block max-h-[min(78vh,820px)] max-w-full object-contain rounded-2xl shadow-2xl"
                    />
                  )}
                  {lightboxActive.caption ? (
                    <p className="mt-4 text-center text-sm text-white/90 leading-relaxed">
                      {lightboxActive.caption}
                    </p>
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
      : null;
  }

  return (
    <>
      {/* ─── SLIDESHOW GRID ─── */}
      <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[80px_1fr] md:grid-cols-[88px_1fr] gap-3 sm:gap-4 min-h-[320px] sm:min-h-[400px] md:min-h-[440px]">
        {/* ── Left: Vertical Thumbnails Column ── */}
        <div className="flex flex-col gap-2 sm:gap-2.5 overflow-hidden">
          {thumbs.map((item, i) => {
            const isLast = i === MAX_VISIBLE_THUMBS - 1 && extraCount > 0;
            return (
              <div key={item.id} className="relative">
                <MediaThumb
                  item={item}
                  isActive={i === activeIndex}
                  onClick={() => selectSlide(i)}
                  index={i}
                />
                {isLast && (
                  <button
                    type="button"
                    onClick={() => openLightbox(i)}
                    className="absolute inset-0 rounded-2xl bg-black/55 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-colors hover:bg-black/65"
                  >
                    <span className="text-sm font-bold text-white">
                      Încă {extraCount} foto
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Center: Active Media Preview ── */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 cursor-pointer group"
          onClick={() => {
            if (!isVideoUrl(active!.url)) {
              openLightbox(activeIndex);
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active!.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full"
            >
              <ActiveMediaView
                item={active!}
                videoRef={videoRef}
                onPlayToggle={handlePlayToggle}
                isPlaying={isPlaying}
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption overlay */}
          {active!.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 pb-4 pt-8 pointer-events-none">
              <p className="text-sm font-medium text-white/90 leading-relaxed">
                {active!.caption}
              </p>
            </div>
          )}

          {/* Counter badge */}
          <div className="absolute top-3 left-3 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90 pointer-events-none">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Inline nav chevrons on hover (desktop) */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
                aria-label="Anterioară"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
                aria-label="Următoare"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Dot indicators for mobile ── */}
      {hasMultiple && images.length <= 8 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => selectSlide(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === activeIndex ? 'w-6 bg-violet-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Lightbox Portal ── */}
      {renderLightbox()}
    </>
  );
}
