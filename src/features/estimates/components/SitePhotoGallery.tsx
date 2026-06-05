import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraIcon, TrashIcon, UploadIcon } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { uploadFiles } from '@/shared/api/files';
import { fileDownloadPath } from '@/shared/api/files';
import {
  useAddEstimateProjectPhotosMutation,
  useDeleteEstimateProjectPhotoMutation,
  useUpdateEstimateProjectPhotoCaptionMutation,
} from '@/features/estimates/api/useEstimates';
import type { EstimateProjectPhotoDto } from '@/entities/estimate/model/estimates';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

type Props = {
  projectId: string;
  photos: EstimateProjectPhotoDto[];
  readOnly?: boolean;
};

export function SitePhotoGallery({ projectId, photos, readOnly }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<{ id: string; value: string } | null>(null);

  const addPhotos = useAddEstimateProjectPhotosMutation();
  const updateCaption = useUpdateEstimateProjectPhotoCaptionMutation();
  const deletePhoto = useDeleteEstimateProjectPhotoMutation();
  const { ask, dialog } = useCabinetConfirmDialog();
  const editingCaptionId = editingCaption?.id;

  useEffect(() => {
    if (!editingCaptionId) return;
    captionInputRef.current?.focus();
  }, [editingCaptionId]);

  const handlePick = () => fileInputRef.current?.click();

  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(Array.from(filesList), { visibility: 'PRIVATE' });
      const fileKeys = uploaded.map((f) => f.id);
      await addPhotos.mutateAsync({ projectId, fileKeys });
      toast.success(t('company.estimateWizard.sitePhotos.uploaded', { count: fileKeys.length }));
    } catch (err) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.sitePhotos.uploadFailed')));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (photoId: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('company.estimateWizard.sitePhotos.confirmDelete'),
      onConfirm: async () => {
        try {
          await deletePhoto.mutateAsync({ projectId, photoId });
        } catch (err) {
          toast.error(getErrorMessage(err, t('company.estimateWizard.sitePhotos.deleteFailed')));
        }
      },
    });
  };

  const handleCaptionSave = async () => {
    if (!editingCaption) return;
    try {
      await updateCaption.mutateAsync({
        projectId,
        photoId: editingCaption.id,
        caption: editingCaption.value.trim() || null,
      });
      setEditingCaption(null);
    } catch (err) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.sitePhotos.captionFailed')));
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <CameraIcon className="size-4 text-slate-500" />
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            {t('company.estimateWizard.sitePhotos.title')}
          </h3>
          <span className="text-[10px] font-bold text-slate-400">({photos.length})</span>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <UploadIcon className="size-3.5" />
            {uploading
              ? t('company.estimateWizard.sitePhotos.uploading')
              : t('company.estimateWizard.sitePhotos.upload')}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
          aria-label={t('company.estimateWizard.sitePhotos.upload')}
        />
      </div>

      {photos.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 font-semibold">
          {t('company.estimateWizard.sitePhotos.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square"
            >
              <img
                src={fileDownloadPath(photo.fileKey)}
                alt={photo.caption ?? ''}
                className="size-full object-cover"
                loading="lazy"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                  title={t('company.estimateWizard.sitePhotos.delete')}
                >
                  <TrashIcon className="size-3.5" />
                </button>
              )}

              {editingCaption?.id === photo.id ? (
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-2">
                  <input
                    ref={captionInputRef}
                    type="text"
                    aria-label={t('company.estimateWizard.sitePhotos.captionLabel', {
                      defaultValue: 'Descriere fotografie',
                    })}
                    value={editingCaption.value}
                    onChange={(e) =>
                      setEditingCaption({ id: photo.id, value: e.target.value })
                    }
                    onBlur={() => void handleCaptionSave()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleCaptionSave();
                      if (e.key === 'Escape') setEditingCaption(null);
                    }}
                    placeholder={t('company.estimateWizard.sitePhotos.captionPlaceholder')}
                    className="w-full text-[11px] font-semibold rounded-md border border-indigo-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    !readOnly && setEditingCaption({ id: photo.id, value: photo.caption ?? '' })
                  }
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 text-[11px] font-semibold text-white text-left cursor-text"
                  disabled={readOnly}
                >
                  {photo.caption || (
                    <span className="text-white/50 italic">
                      {readOnly
                        ? ''
                        : t('company.estimateWizard.sitePhotos.captionEmpty')}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}
