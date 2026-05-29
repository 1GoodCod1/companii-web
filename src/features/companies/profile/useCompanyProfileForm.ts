import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  usePublishCompanyMutation,
  useAddGalleryImageMutation,
  useRemoveGalleryImageMutation,
  uploadCompanyLogo,
  useLeaveCompanyMutation,
} from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { createFormState, MAX_GALLERY } from './profileFormState';
import type { OwnedCompanyDto } from '@/types/companies';
import { uploadFile, uploadFiles } from '@/api/files';
import { MAX_VIDEO_COUNT, MAX_VIDEO_DURATION } from '@/constants/fileMedia.constants';
import { validateMediaFile, isVideoFile, getVideoDuration } from '@/utils/validateFile';
import { getErrorMessage } from '@/utils/errors';
import { MANAGER_PROFILE_FIELDS } from '@/features/companies/resolveActiveCompany';
import type { PendingGalleryItem } from '@/components/company/CompanyBrandingSection';

export interface UseCompanyProfileFormOptions {
  ownedCompany: OwnedCompanyDto | null;
  isLegalOwner: boolean;
  canRegisterCompany?: boolean;
  canEditLegalProfile: boolean;
  canPublishCompany: boolean;
  userDefaults?: { email?: string; phone?: string | null };
}

export function useCompanyProfileForm({
  ownedCompany,
  isLegalOwner,
  canRegisterCompany = false,
  canEditLegalProfile,
  userDefaults,
}: UseCompanyProfileFormOptions) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOwner: isTeamOwner } = useCompanyPermissions();
  const leaveCompany = useLeaveCompanyMutation();
  const canLeaveCompany = !!ownedCompany && !isLegalOwner && !isTeamOwner;
  const initial = createFormState(ownedCompany, userDefaults);

  const createCompany = useCreateCompanyMutation();
  const updateCompany = useUpdateCompanyMutation();
  const publishCompany = usePublishCompanyMutation();
  const addGalleryImage = useAddGalleryImageMutation();
  const removeGalleryImage = useRemoveGalleryImageMutation();

  const [name, setName] = useState(initial.name);
  const [legalName, setLegalName] = useState(initial.legalName);
  const [idno, setIdno] = useState(initial.idno);
  const [legalAddress, setLegalAddress] = useState(initial.legalAddress);
  const [cityId, setCityId] = useState(initial.cityId);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [isTvaPayer, setIsTvaPayer] = useState(initial.isTvaPayer);
  const [tvaCode, setTvaCode] = useState(initial.tvaCode);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [showPublicPhone, setShowPublicPhone] = useState(initial.showPublicPhone);
  const [showPublicEmail, setShowPublicEmail] = useState(initial.showPublicEmail);
  const [description, setDescription] = useState(initial.description);

  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [pendingGallery, setPendingGallery] = useState<PendingGalleryItem[]>([]);
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  const handleLogoPick = useCallback(
    (file: File | null) => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (!file) {
        setLogoFile(null);
        setLogoPreview(null);
        setLogoRemoved(true);
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setLogoRemoved(false);
    },
    [logoPreview],
  );

  const handleGalleryPick = useCallback(
    async (fileList: FileList | File[]) => {
      const existingCount = (ownedCompany?.galleryImages?.length ?? 0) + pendingGallery.length;
      const room = MAX_GALLERY - existingCount;
      if (room <= 0) {
        toast.error(t('company.profileEditor.form.galleryMax', { count: MAX_GALLERY }));
        return;
      }

      const existingVideos =
        (ownedCompany?.galleryImages ?? []).filter((img) => {
          const u = img.url.split('?')[0]?.toLowerCase() ?? '';
          return u.endsWith('.mp4') || u.endsWith('.mov') || u.endsWith('.webm');
        }).length +
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
    [ownedCompany?.galleryImages, pendingGallery, t],
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
    try {
      await removeGalleryImage.mutateAsync({ companyId: ownedCompany.id, imageId });
      toast.success(t('company.profileEditor.form.photoDeleted'));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.profileEditor.form.photoDeleteFailed'));
    }
  };

  const resolveLogoPayload = async (): Promise<string | undefined> => {
    if (logoFile) return uploadCompanyLogo(logoFile);
    if (logoRemoved) return '';
    return undefined;
  };

  const savePendingGallery = async (companyId: string) => {
    if (pendingGallery.length === 0) return;
    const files = pendingGallery.map((item) => item.file);
    const uploaded =
      files.length === 1
        ? [await uploadFile(files[0]!, { visibility: 'PUBLIC' })]
        : await uploadFiles(files, { visibility: 'PUBLIC' });

    for (let i = 0; i < uploaded.length; i += 1) {
      await addGalleryImage.mutateAsync({
        companyId,
        url: uploaded[i]!.url,
        caption: pendingGallery[i]?.caption.trim() || undefined,
      });
    }

    pendingGallery.forEach((item) => URL.revokeObjectURL(item.preview));
    setPendingGallery([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownedCompany && !canRegisterCompany) {
      toast.error(t('company.profileEditor.form.onlyOwnerCreate'));
      return;
    }

    if (!ownedCompany || isLegalOwner) {
      if (!name.trim() || !legalName.trim() || !legalAddress.trim()) {
        toast.error(t('company.profileEditor.form.requiredFields'));
        return;
      }

      if (!/^\d{13}$/.test(idno.trim())) {
        toast.error(t('company.profileEditor.form.idnoInvalid'));
        return;
      }
    }

    if (!cityId) {
      toast.error(t('company.profileEditor.form.cityRequired'));
      return;
    }

    const ownerPayload = {
      name: name.trim(),
      legalName: legalName.trim(),
      idno: idno.trim(),
      legalAddress: legalAddress.trim(),
      cityId,
      categoryId: categoryId || undefined,
      isTvaPayer,
      tvaCode: isTvaPayer ? tvaCode.trim() : undefined,
      contactPhone: contactPhone.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      showPublicPhone,
      showPublicEmail,
      description: description.trim() || undefined,
    };

    const managerPayload = Object.fromEntries(
      MANAGER_PROFILE_FIELDS.filter((field) => field !== 'logoUrl').map((field) => {
        switch (field) {
          case 'cityId':
            return [field, cityId];
          case 'categoryId':
            return [field, categoryId || undefined];
          case 'contactPhone':
            return [field, contactPhone.trim() || undefined];
          case 'contactEmail':
            return [field, contactEmail.trim() || undefined];
          case 'description':
            return [field, description.trim() || undefined];
          default:
            return [field, undefined];
        }
      }),
    );

    const payload = !ownedCompany || isLegalOwner ? ownerPayload : managerPayload;

    setIsSavingMedia(true);
    try {
      const nextLogoUrl = await resolveLogoPayload();
      const logoChanged = nextLogoUrl !== undefined;

      if (ownedCompany) {
        await updateCompany.mutateAsync({
          id: ownedCompany.id,
          ...payload,
          ...(logoChanged ? { logoUrl: nextLogoUrl } : {}),
        });
        await savePendingGallery(ownedCompany.id);
        if (logoChanged && nextLogoUrl === '') setLogoUrl(null);
        else if (logoChanged && nextLogoUrl) setLogoUrl(nextLogoUrl);
        setLogoFile(null);
        setLogoPreview(null);
        setLogoRemoved(false);
        toast.success(t('company.profileEditor.toastUpdated'));
      } else {
        const created = (await createCompany.mutateAsync({
          ...payload,
          ...(logoChanged && nextLogoUrl ? { logoUrl: nextLogoUrl } : {}),
        })) as { id: string };
        await savePendingGallery(created.id);
        toast.success(t('company.profileEditor.toastCreated'));
        navigate('/company', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.profileEditor.form.saveFailed'));
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handlePublish = async () => {
    if (!ownedCompany) return;
    try {
      await publishCompany.mutateAsync(ownedCompany.id);
      toast.success(t('company.profileEditor.toastPublished'));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || t('company.profileEditor.form.publishFailed'));
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm(t('company.profileEditor.form.confirmLeave'))) return;
    try {
      await leaveCompany.mutateAsync();
      toast.success(t('company.profileEditor.toastLeft'));
      navigate('/company/lucrari', { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.profileEditor.form.leaveFailed')));
    }
  };

  const isSaving = createCompany.isPending || updateCompany.isPending || isSavingMedia;
  const legalReadOnly = !!ownedCompany && !canEditLegalProfile;

  return {
    name,
    setName,
    legalName,
    setLegalName,
    idno,
    setIdno,
    legalAddress,
    setLegalAddress,
    cityId,
    setCityId,
    categoryId,
    setCategoryId,
    isTvaPayer,
    setIsTvaPayer,
    tvaCode,
    setTvaCode,
    contactPhone,
    setContactPhone,
    contactEmail,
    setContactEmail,
    showPublicPhone,
    setShowPublicPhone,
    showPublicEmail,
    setShowPublicEmail,
    description,
    setDescription,
    logoUrl,
    logoPreview,
    pendingGallery,
    setPendingGallery,
    isSaving,
    legalReadOnly,
    canLeaveCompany,
    leaveCompanyPending: leaveCompany.isPending,
    publishCompanyPending: publishCompany.isPending,
    handleLogoPick,
    handleGalleryPick,
    handlePendingGalleryRemove,
    handleGalleryRemove,
    handleSubmit,
    handlePublish,
    handleLeaveTeam,
  };
}
