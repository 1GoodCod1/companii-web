import { CaretLeftIcon, CaretRightIcon, PlayIcon } from '@phosphor-icons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { CompanyGalleryImageDto } from '@/entities/company/model/companies.types';
import { MediaImage } from '@/shared/ui/MediaImage';
import { MediaVideo } from '@/shared/ui/MediaVideo';
import { isVideoUrl } from '@/shared/utils/validateFile';
import {
  MediaThumb,
  ActiveMediaView,
  MediaLightbox,
  useGallerySlideshow,
} from '@/shared/ui/media';

const MAX_VISIBLE_THUMBS = 5;

export function CompanyGallery({ images }: { images: CompanyGalleryImageDto[] }) {
  const { t } = useTranslation();
  const g = 'companyDetail.gallery';

  const gallery = useGallerySlideshow({ items: images });

  const lightboxLabels = {
    lightboxAria: t(`${g}.lightboxAria`),
    closeGallery: t(`${g}.closeGallery`),
    close: t(`${g}.close`),
    prev: t(`${g}.prev`),
    next: t(`${g}.next`),
    photoAlt: t(`${g}.photoAlt`),
    hintMultiple: t(`${g}.hintMultiple`),
    hintSingle: t(`${g}.hintSingle`),
  };

  if (!images.length) {
    return (
      <div className="rounded-3xl bg-slate-50/80 px-6 py-16 text-center text-sm text-gray-400">
        {t(`${g}.empty`)}
      </div>
    );
  }

  if (images.length === 1) {
    const solo = images[0]!;
    const isSoloVideo = isVideoUrl(solo.url);
    return (
      <>
        <button
          type="button"
          className="relative block w-full rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10] cursor-pointer group border-0 p-0 text-left"
          onClick={() => gallery.openLightbox(0)}
        >
          {isSoloVideo ? (
            <div className="relative size-full">
              <MediaVideo src={solo.url} className="size-full object-cover" muted playsInline preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-14 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                  <PlayIcon className="size-6 text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>
          ) : (
            <MediaImage
              src={solo.url}
              alt={solo.caption ?? t(`${g}.photoAlt`)}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="size-full bg-slate-200"
            />
          )}
        </button>
        <MediaLightbox
          item={gallery.lightboxActive}
          index={gallery.lightboxIndex}
          total={images.length}
          hasMultiple={gallery.hasMultiple}
          isPlaying={gallery.lightboxPlaying}
          videoRef={gallery.lightboxVideoRef}
          onPlayToggle={gallery.handleLightboxPlayToggle}
          onPrev={gallery.lightboxPrev}
          onNext={gallery.lightboxNext}
          onClose={gallery.closeLightbox}
          labels={lightboxLabels}
        />
      </>
    );
  }

  const thumbs = images.slice(0, MAX_VISIBLE_THUMBS);
  const extraCount = images.length - MAX_VISIBLE_THUMBS;

  return (
    <>
      <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[80px_1fr] md:grid-cols-[88px_1fr] gap-3 sm:gap-4 min-h-[320px] sm:min-h-[400px] md:min-h-[440px]">
        <div className="flex flex-col gap-2 sm:gap-2.5 overflow-hidden">
          {thumbs.map((item, i) => {
            const isLast = i === MAX_VISIBLE_THUMBS - 1 && extraCount > 0;
            return (
              <div key={item.id} className="relative">
                <MediaThumb
                  item={item}
                  isActive={i === gallery.activeIndex}
                  onClick={() => gallery.selectSlide(i)}
                  index={i}
                />
                {isLast && (
                  <button
                    type="button"
                    onClick={() => gallery.openLightbox(i)}
                    className="absolute inset-0 rounded-2xl bg-black/55 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-colors hover:bg-black/65"
                  >
                    <span className="text-sm font-bold text-white">
                      {t(`${g}.morePhotos`, { count: extraCount })}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 group min-h-[320px] sm:min-h-[400px] md:min-h-[440px]">
          {isVideoUrl(gallery.active!.url) ? (
            <div className="relative size-full">
              <AnimatePresence mode="wait">
                <m.div
                  key={gallery.active!.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="size-full"
                >
                  <ActiveMediaView
                    item={gallery.active!}
                    videoRef={gallery.videoRef}
                    onPlayToggle={gallery.handlePlayToggle}
                    isPlaying={gallery.isPlaying}
                    photoAlt={t(`${g}.photoAlt`)}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              className="relative block size-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-2xl sm:rounded-3xl"
              onClick={() => gallery.openLightbox(gallery.activeIndex)}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={gallery.active!.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="size-full"
                >
                  <ActiveMediaView
                    item={gallery.active!}
                    videoRef={gallery.videoRef}
                    onPlayToggle={gallery.handlePlayToggle}
                    isPlaying={gallery.isPlaying}
                    photoAlt={t(`${g}.photoAlt`)}
                  />
                </m.div>
              </AnimatePresence>
            </button>
          )}

          {gallery.active!.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 pb-4 pt-8 pointer-events-none">
              <p className="text-sm font-medium text-white/90 leading-relaxed">
                {gallery.active!.caption}
              </p>
            </div>
          )}

          <div className="absolute top-3 left-3 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90 pointer-events-none">
            {gallery.activeIndex + 1} / {images.length}
          </div>

          {gallery.hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); gallery.goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
                aria-label={t(`${g}.prev`)}
              >
                <CaretLeftIcon className="size-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); gallery.goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
                aria-label={t(`${g}.next`)}
              >
                <CaretRightIcon className="size-5 text-slate-700" />
              </button>
            </>
          )}
        </div>
      </div>

      {gallery.hasMultiple && images.length <= 8 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => gallery.selectSlide(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === gallery.activeIndex ? 'w-6 bg-violet-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <MediaLightbox
        item={gallery.lightboxActive}
        index={gallery.lightboxIndex}
        total={images.length}
        hasMultiple={gallery.hasMultiple}
        isPlaying={gallery.lightboxPlaying}
        videoRef={gallery.lightboxVideoRef}
        onPlayToggle={gallery.handleLightboxPlayToggle}
        onPrev={gallery.lightboxPrev}
        onNext={gallery.lightboxNext}
        onClose={gallery.closeLightbox}
        labels={lightboxLabels}
      />
    </>
  );
}
