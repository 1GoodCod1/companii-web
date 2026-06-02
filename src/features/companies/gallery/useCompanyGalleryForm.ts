import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addGalleryImageApi,
  removeGalleryImageApi,
} from '@/features/companies/api/useCompaniesManagement';
import type { OwnedCompanyDto } from '@/entities/company/model/companies.types';
import type { PendingGalleryItem } from '@/entities/company/ui/companyGallery.types';
import { MAX_GALLERY } from '@/features/companies/profile/profileFormState';
import { uploadFile, uploadFiles } from '@/shared/api/files';
import { MAX_VIDEO_COUNT, MAX_VIDEO_DURATION } from '@/shared/constants/fileMedia.constants';
import {
  isVideoFile,
  isVideoUrl,
  validateMediaFile,
  getVideoDuration,
} from '@/shared/utils/validateFile';
import {
  appendGalleryImagesToCache,
  removeGalleryImageFromCache,
  setGalleryImagesInCache,
} from '@/features/companies/gallery/companyGalleryCache';

export function useCompanyGalleryForm(ownedCompany: OwnedCompanyDto | null) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [pendingGallery, setPendingGallery] = useState<PendingGalleryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleGalleryPick = useCallback(
    async (fileList: FileList | File[]) => {
      if (!ownedCompany) return;

      const existingCount = (ownedCompany.galleryImages?.length ?? 0) + pendingGallery.length;
      const room = MAX_GALLERY - existingCount;
      if (room <= 0) {
        toast.error(t('company.profileEditor.form.galleryMax', { count: MAX_GALLERY }));
        return;
      }

      const existingVideos =
        (ownedCompany.galleryImages ?? []).filter((img) => isVideoUrl(img.url)).length +
        pendingGallery.filter((p) => isVideoFile(p.file)).length;

      let videoCount = existingVideos;
      const next: PendingGalleryItem[] = [];

      for (const file of Array.from(fileList).slice(0, room)) {
        const err = validateMediaFile(file);
        if (err) {
          toast.error(
            err === 'files.tooLarge'
              ? t('company.profileEditor.form.fileTooLarge', {
                  max: isVideoFile(file) ? '150' : '10',
                })
              : t('company.profileEditor.form.invalidFormat'),
          );
          continue;
        }

        if (isVideoFile(file)) {
          if (videoCount >= MAX_VIDEO_COUNT) {
            toast.error(t('company.profileEditor.form.videoMax', { count: MAX_VIDEO_COUNT }));
            continue;
          }
          try {
            const duration = await getVideoDuration(file);
            if (duration > MAX_VIDEO_DURATION) {
              toast.error(
                t('company.profileEditor.form.videoDurationMax', {
                  minutes: MAX_VIDEO_DURATION / 60,
                }),
              );
              continue;
            }
          } catch {
            toast.error(t('company.profileEditor.form.videoDurationCheckFailed'));
            continue;
          }
          videoCount += 1;
        }

        next.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          caption: '',
        });
      }

      if (next.length > 0) setPendingGallery((prev) => [...prev, ...next]);
    },
    [ownedCompany, pendingGallery, t],
  );

  const handlePendingGalleryRemove = useCallback((id: string) => {
    setPendingGallery((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const handleGalleryRemove = async (imageId: string) => {
    if (!ownedCompany) return;

    const previousImages = ownedCompany.galleryImages ?? [];
    removeGalleryImageFromCache(queryClient, ownedCompany.id, imageId);

    try {
      await removeGalleryImageApi(ownedCompany.id, imageId);
      toast.success(t('company.profileEditor.form.photoDeleted'));
    } catch (err: unknown) {
      setGalleryImagesInCache(queryClient, ownedCompany.id, previousImages);
      const error = err as Error;
      toast.error(error.message || t('company.profileEditor.form.photoDeleteFailed'));
    }
  };

  const handleSave = async () => {
    if (!ownedCompany || pendingGallery.length === 0) return;

    setIsSaving(true);
    const snapshot = [...pendingGallery];

    try {
      const files = snapshot.map((item) => item.file);
      const uploaded =
        files.length === 1
          ? [await uploadFile(files[0]!, { visibility: 'PUBLIC' })]
          : await uploadFiles(files, { visibility: 'PUBLIC' });

      for (let i = 0; i < uploaded.length; i += 1) {
        const pendingItem = snapshot[i];
        if (!pendingItem) continue;

        const image = await addGalleryImageApi(ownedCompany.id, {
          url: uploaded[i]!.url,
          caption: pendingItem.caption.trim() || undefined,
        });

        appendGalleryImagesToCache(queryClient, ownedCompany.id, [image]);
        URL.revokeObjectURL(pendingItem.preview);
        setPendingGallery((prev) => prev.filter((item) => item.id !== pendingItem.id));
      }

      toast.success(t('company.galleryPage.toastSaved'));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.profileEditor.form.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    pendingGallery,
    setPendingGallery,
    isSaving,
    handleGalleryPick,
    handlePendingGalleryRemove,
    handleGalleryRemove,
    handleSave,
    hasPendingChanges: pendingGallery.length > 0,
  };
}
