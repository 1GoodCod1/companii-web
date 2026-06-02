import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile, uploadFile } from '@/shared/api/files';
import {
  useAddInterventionPhotosMutation,
  useDeleteInterventionPhotoMutation,
} from '@/features/fsm';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';

type WorksheetPhoto = {
  id: string;
  fileKey: string;
};

type Props = {
  interventionId: string;
  photos: WorksheetPhoto[];
  readOnly?: boolean;
};

export function WorksheetPhotos({ interventionId, photos, readOnly }: Props) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const addPhotos = useAddInterventionPhotosMutation(interventionId);
  const deletePhoto = useDeleteInterventionPhotoMutation(interventionId);
  const { ask, dialog } = useCabinetConfirmDialog();

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(Array.from(files, (file) => uploadFile(file)));
      const fileKeys = uploads.map((uploaded) => uploaded.id);
      await addPhotos.mutateAsync(fileKeys);
      toast.success(t('company.workSheetPage.photoUploadedCount', { count: fileKeys.length }));
    } catch (err) {
      toast.error(getErrorMessage(err, t('company.workSheetPage.photoUploadFailed')));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photoId: string) => {
    ask({
      title: t('cabinet.common.delete'),
      message: t('company.workSheetPage.confirmDeletePhoto'),
      onConfirm: async () => {
        try {
          await deletePhoto.mutateAsync(photoId);
          toast.success(t('company.workSheetPage.photoDeleted'));
        } catch (err) {
          toast.error(getErrorMessage(err, t('company.workSheetPage.photoDeleteFailed')));
        }
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
          <Camera className="size-3.5" /> {t('company.workSheetPage.photos')}
          <span className="ml-1 text-gray-300">({photos.length})</span>
        </p>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition-colors">
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              {t('company.workSheetPage.takePhoto')}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              <ImagePlus className="size-3.5" />
              {t('company.workSheetPage.attachPhoto')}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">
          {t('company.workSheetPage.photosEmpty')}
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl border border-gray-100 bg-gray-50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  downloadFile(photo.fileKey, `Foto-${photo.id.slice(0, 8)}.jpg`)
                }
                className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800 hover:text-violet-700 transition-colors"
              >
                <Camera className="size-6" />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1 right-1 rounded-md bg-white/90 border border-red-100 p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t('company.workSheetPage.photoDelete')}
                >
                  <Trash2 className="size-3" />
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
