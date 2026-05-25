import { useMutation } from '@tanstack/react-query';
import {
  deleteFile,
  downloadFile,
  uploadFile,
  uploadFiles,
} from '@/api/files';

export function useUploadFileMutation() {
  return useMutation({ mutationFn: (file: File) => uploadFile(file) });
}

export function useUploadFilesMutation() {
  return useMutation({ mutationFn: (files: File[]) => uploadFiles(files) });
}

export function useDownloadFileMutation() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      downloadFile(id, filename),
  });
}

export function useDeleteFileMutation() {
  return useMutation({ mutationFn: (id: string) => deleteFile(id) });
}
