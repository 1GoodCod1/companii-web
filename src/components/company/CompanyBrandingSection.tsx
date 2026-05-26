import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Trash2, Upload, Film } from 'lucide-react';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import {
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
  FormSection,
} from '@/components/cabinet/cabinet-ui';
import type { CompanyGalleryImageDto } from '@/types/companies';
import { MediaImage } from '@/components/ui/MediaImage';
import { validateImageFile } from '@/utils/validateFile';
import { isVideoUrl } from '@/utils/validateFile';

export type PendingGalleryItem = {
  id: string;
  file: File;
  preview: string;
  caption: string;
};

type Props = {
  companyName: string;
  logoUrl: string | null;
  logoPreview: string | null;
  onLogoPick: (file: File | null) => void;
  galleryImages: CompanyGalleryImageDto[];
  pendingGallery: PendingGalleryItem[];
  onGalleryPick: (files: FileList | File[]) => void;
  onPendingGalleryCaptionChange: (id: string, caption: string) => void;
  onPendingGalleryRemove: (id: string) => void;
  onGalleryRemove: (imageId: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'sidebar';
};

export function CompanyBrandingSection({
  companyName,
  logoUrl,
  logoPreview,
  onLogoPick,
  galleryImages,
  pendingGallery,
  onGalleryPick,
  onPendingGalleryCaptionChange,
  onPendingGalleryRemove,
  onGalleryRemove,
  disabled = false,
  variant = 'default',
}: Props) {
  const { t } = useTranslation();
  const isSidebar = variant === 'sidebar';
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const displayLogo = logoPreview ?? logoUrl;

  const handleLogoChange = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setLogoError(
        err === 'files.tooLarge'
          ? t('company.branding.logoTooLarge')
          : t('company.branding.logoInvalidFormat'),
      );
      return;
    }
    setLogoError(null);
    onLogoPick(file);
  };

  const handleGalleryChange = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    onGalleryPick(fileList);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const content = (
    <>
      <div
        className={
          isSidebar
            ? 'flex flex-col items-center gap-4 text-center'
            : 'flex flex-col sm:flex-row sm:items-center gap-4'
        }
      >
        <CompanyLogo
          name={companyName || t('company.branding.companyFallback')}
          logoUrl={displayLogo}
          size={isSidebar ? 'lg' : 'xl'}
          className="shrink-0"
        />
        <div className={`space-y-2 ${isSidebar ? 'w-full' : ''}`}>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled}
            onChange={(e) => handleLogoChange(e.target.files)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => logoInputRef.current?.click()}
            className={`${cabinetBtnSecondary} gap-2 ${isSidebar ? 'w-full justify-center' : ''}`}
          >
            <Upload className="h-4 w-4" />
            {displayLogo ? t('company.branding.changeLogo') : t('company.branding.uploadLogo')}
          </button>
          {displayLogo ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onLogoPick(null)}
              className="block text-xs font-medium text-gray-500 hover:text-red-600"
            >
              {t('company.branding.removeLogo')}
            </button>
          ) : null}
          {logoError ? <p className="text-xs text-red-600">{logoError}</p> : null}
          <p className="text-xs text-gray-400">{t('company.branding.logoHint')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={cabinetLabelClass}>{t('company.branding.galleryTitle')}</label>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
            multiple
            className="hidden"
            disabled={disabled}
            onChange={(e) => handleGalleryChange(e.target.files)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => galleryInputRef.current?.click()}
            className={`${cabinetBtnSecondary} gap-2 ${isSidebar ? 'w-full justify-center' : ''}`}
          >
            <ImagePlus className="h-4 w-4" />
            {t('company.branding.addGallery')}
          </button>
        </div>

        {galleryImages.length === 0 && pendingGallery.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-gray-400">
            {t('company.branding.galleryEmpty')}
            <span className="block text-[11px] text-slate-400 mt-1">
              {t('company.branding.galleryLimits')}
            </span>
          </div>
        ) : (
          <div className={`grid gap-3 ${isSidebar ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
            {galleryImages.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-2xl bg-slate-100 aspect-[4/3]">
                {isVideoUrl(image.url) ? (
                  <div className="relative h-full w-full">
                    <video
                      src={image.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Film className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <MediaImage
                    src={image.url}
                    alt={image.caption ?? t('company.branding.galleryPhotoAlt')}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full bg-slate-200"
                  />
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onGalleryRemove(image.id)}
                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t('company.branding.deletePhoto')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {image.caption ? (
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] text-white">
                    {image.caption}
                  </p>
                ) : null}
              </div>
            ))}

            {pendingGallery.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="group relative overflow-hidden rounded-2xl bg-slate-100 aspect-[4/3]">
                  {item.file.type.startsWith('video/') ? (
                    <div className="relative h-full w-full">
                      <video
                        src={item.preview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <Film className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.preview}
                      alt={t('company.branding.previewAlt')}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPendingGalleryRemove(item.id)}
                    className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white"
                    aria-label={t('company.branding.removeFromList')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.caption}
                  disabled={disabled}
                  onChange={(e) => onPendingGalleryCaptionChange(item.id, e.target.value)}
                  placeholder={t('company.branding.captionPlaceholder')}
                  className={`${cabinetFieldClass} text-xs py-2`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isSidebar) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">{t('company.branding.sectionTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('company.branding.sectionDescription')}</p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <FormSection
      title={t('company.branding.sectionTitle')}
      description={t('company.branding.sectionDescription')}
    >
      {content}
    </FormSection>
  );
}
