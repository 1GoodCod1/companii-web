import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageSquareIcon, PlayIcon, TrashIcon } from '@phosphor-icons/react';
import {
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyGalleryImageDto } from '@/entities/company/model/companies.types';
import type { PendingGalleryItem } from '@/entities/company/ui/companyGallery.types';
import { MediaImage } from '@/shared/ui/MediaImage';
import { MediaVideo } from '@/shared/ui/MediaVideo';
import { isVideoFile, isVideoUrl } from '@/shared/utils/validateFile';
import { MediaLightbox, useGallerySlideshow } from '@/shared/ui/media';
import type { MediaThumbItem } from '@/shared/ui/media/MediaThumb';

type Props = {
  galleryImages: CompanyGalleryImageDto[];
  pendingGallery: PendingGalleryItem[];
  onGalleryPick: (files: FileList | File[]) => void;
  onPendingGalleryCaptionChange: (id: string, caption: string) => void;
  onPendingGalleryRemove: (id: string) => void;
  onGalleryRemove: (imageId: string) => void;
  disabled?: boolean;
  layout?: 'compact' | 'page';
};

function toPreviewItem(
  image: CompanyGalleryImageDto,
  video: boolean,
): MediaThumbItem {
  return {
    id: image.id,
    url: image.url,
    caption: image.caption,
    kind: video ? 'video' : 'image',
  };
}

export function CompanyGallerySection({
  galleryImages,
  pendingGallery,
  onGalleryPick,
  onPendingGalleryCaptionChange,
  onPendingGalleryRemove,
  onGalleryRemove,
  disabled = false,
  layout = 'page',
}: Props) {
  const { t } = useTranslation();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isPage = layout === 'page';
  const g = 'company.galleryPage';

  const previewItems = useMemo<MediaThumbItem[]>(
    () => [
      ...galleryImages.map((image) => toPreviewItem(image, isVideoUrl(image.url))),
      ...pendingGallery.map((item) => ({
        id: item.id,
        url: item.preview,
        caption: item.caption,
        kind: isVideoFile(item.file) ? ('video' as const) : ('image' as const),
      })),
    ],
    [galleryImages, pendingGallery],
  );

  const gallery = useGallerySlideshow({ items: previewItems });

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

  const handleGalleryChange = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    onGalleryPick(fileList);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const openPreview = (itemId: string) => {
    const index = previewItems.findIndex((item) => item.id === itemId);
    if (index >= 0) gallery.openLightbox(index);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div>
          <label className={cabinetLabelClass}>{t('company.branding.galleryTitle')}</label>
          <p className="mt-1 text-xs text-gray-400">{t('company.branding.galleryLimits')}</p>
        </div>
        <div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
            multiple
            className="hidden"
            disabled={disabled}
            onChange={(e) => handleGalleryChange(e.target.files)}
            aria-label={t('company.branding.addGallery')}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => galleryInputRef.current?.click()}
            className={`${cabinetBtnSecondary} gap-2`}
          >
            <ImageSquareIcon className="size-4" />
            {t('company.branding.addGallery')}
          </button>
        </div>
      </div>

      {galleryImages.length === 0 && pendingGallery.length === 0 ? (
        <div className="border border-dashed border-[var(--dashboard-divider)] px-4 py-12 text-center text-sm text-gray-400">
          {t('company.branding.galleryEmpty')}
        </div>
      ) : (
        <div
          className={`grid justify-center gap-3 ${
            isPage ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2'
          }`}
        >
          {galleryImages.map((image) => {
            const isVideo = isVideoUrl(image.url);
            return (
              <div
                key={image.id}
                className="group relative aspect-[4/3] w-full overflow-hidden border border-[var(--dashboard-divider)] bg-gray-50"
              >
                <button
                  type="button"
                  className="relative size-full cursor-pointer"
                  onClick={() => openPreview(image.id)}
                  aria-label={t(`${g}.viewMedia`)}
                >
                  {isVideo ? (
                    <div className="relative size-full">
                      <MediaVideo
                        src={image.url}
                        className="size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="size-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <PlayIcon className="size-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <MediaImage
                      src={image.url}
                      alt={image.caption ?? t('company.branding.galleryPhotoAlt')}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      fallbackClassName="size-full bg-slate-200"
                    />
                  )}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGalleryRemove(image.id);
                  }}
                  className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t('company.branding.deletePhoto')}
                >
                  <TrashIcon className="size-4" />
                </button>
                {image.caption ? (
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] text-white pointer-events-none">
                    {image.caption}
                  </p>
                ) : null}
              </div>
            );
          })}

          {pendingGallery.map((item) => {
            const isVideo = isVideoFile(item.file);
            return (
              <div key={item.id} className="space-y-2">
                <div className="group relative aspect-[4/3] w-full overflow-hidden border border-[var(--dashboard-divider)] bg-gray-50">
                  <button
                    type="button"
                    className="relative size-full cursor-pointer"
                    onClick={() => openPreview(item.id)}
                    aria-label={t(`${g}.viewMedia`)}
                  >
                    {isVideo ? (
                      <div className="relative size-full">
                        <MediaVideo
                          src={item.preview}
                          className="size-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="size-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <PlayIcon className="size-5 text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.preview}
                        alt={t('company.branding.previewAlt')}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPendingGalleryRemove(item.id);
                    }}
                    className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white"
                    aria-label={t('company.branding.removeFromList')}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.caption}
                  disabled={disabled}
                  onChange={(e) => onPendingGalleryCaptionChange(item.id, e.target.value)}
                  placeholder={t('company.branding.captionPlaceholder')}
                  aria-label={t('company.branding.captionPlaceholder')}
                  className={`${cabinetFieldClass} text-xs py-2`}
                />
              </div>
            );
          })}
        </div>
      )}

      <MediaLightbox
        item={gallery.lightboxActive}
        index={gallery.lightboxIndex}
        total={previewItems.length}
        hasMultiple={gallery.hasMultiple}
        isPlaying={gallery.lightboxPlaying}
        videoRef={gallery.lightboxVideoRef}
        onPlayToggle={gallery.handleLightboxPlayToggle}
        onPrev={gallery.lightboxPrev}
        onNext={gallery.lightboxNext}
        onClose={gallery.closeLightbox}
        labels={lightboxLabels}
      />
    </div>
  );
}
