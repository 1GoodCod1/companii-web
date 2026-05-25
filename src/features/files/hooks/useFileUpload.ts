import { useCallback, useRef, useState } from 'react';
import { uploadFile, uploadFiles } from '@/api/files';
import type { FileDto } from '@/types/file';
import {
  validateDocumentFile,
  validateImageFile,
  type FileErrorKey,
} from '@/utils/validateFile';

type Validator = (file: File) => FileErrorKey | null;

type Options = {
  maxFiles?: number;
  mode?: 'image' | 'document';
};

export function useFileUpload(options: Options = {}) {
  const { maxFiles = 10, mode = 'image' } = options;
  const validator: Validator =
    mode === 'document' ? validateDocumentFile : validateImageFile;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeAll = (urls: string[]) => {
    urls.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* noop */
      }
    });
  };

  const pickFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      const accepted: File[] = [];
      const errors = new Set<FileErrorKey>();

      for (const file of incoming) {
        const err = validator(file);
        if (err) errors.add(err);
        else accepted.push(file);
      }

      if (errors.size > 0) {
        setError([...errors].join(', '));
        return;
      }
      setError(null);

      setFiles((prev) => {
        const room = maxFiles - prev.length;
        if (room <= 0) return prev;
        const next = [...prev, ...accepted.slice(0, room)];
        const newPreviews = accepted
          .slice(0, room)
          .filter((f) => f.type.startsWith('image/'))
          .map((f) => URL.createObjectURL(f));
        if (newPreviews.length > 0) {
          setPreviews((p) => {
            const merged = [...p, ...newPreviews];
            previewsRef.current = merged;
            return merged;
          });
        }
        return next;
      });
    },
    [maxFiles, validator],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* noop */
        }
      }
      const next = prev.filter((_, i) => i !== index);
      previewsRef.current = next;
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    revokeAll(previewsRef.current);
    previewsRef.current = [];
    setFiles([]);
    setPreviews([]);
    setError(null);
  }, []);

  const upload = useCallback(async (): Promise<FileDto[] | null> => {
    if (files.length === 0) return null;
    setIsUploading(true);
    setError(null);
    try {
      if (files.length === 1) {
        const one = await uploadFile(files[0]!);
        return [one];
      }
      return await uploadFiles(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  return {
    files,
    previews,
    isUploading,
    error,
    pickFiles,
    upload,
    removeFile,
    clear,
  };
}
