import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  usePublishCompanyMutation,
  uploadCompanyLogo,
  useLeaveCompanyMutation,
} from '@/features/companies/api/useCompanies';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { createFormState } from './profileFormState';
import type { OwnedCompanyDto } from '@/entities/company/model/companies.types';
import { getErrorMessage } from '@/shared/utils/errors';
import { useCabinetConfirmDialog } from '@/shared/hooks/useCabinetConfirmDialog';
import { MANAGER_PROFILE_FIELDS } from '@/features/companies/resolveActiveCompany';

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
  const { ask, dialog: confirmDialog } = useCabinetConfirmDialog();
  const navigate = useNavigate();
  const { isOwner: isTeamOwner } = useCompanyPermissions();
  const leaveCompany = useLeaveCompanyMutation();
  const canLeaveCompany = !!ownedCompany && !isLegalOwner && !isTeamOwner;
  const initial = createFormState(ownedCompany, userDefaults);

  const createCompany = useCreateCompanyMutation();
  const updateCompany = useUpdateCompanyMutation();
  const publishCompany = usePublishCompanyMutation();

  const [name, setName] = useState(initial.name);
  const [legalName, setLegalName] = useState(initial.legalName);
  const [idno, setIdno] = useState(initial.idno);
  const [legalAddress, setLegalAddress] = useState(initial.legalAddress);
  const [cityId, setCityId] = useState(initial.cityId);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [isTvaPayer, setIsTvaPayer] = useState(initial.isTvaPayer);
  const [tvaCode, setTvaCode] = useState(initial.tvaCode);
  const [contactPhoneInput, setContactPhoneInput] = useState(initial.contactPhone);
  const [contactEmailInput, setContactEmailInput] = useState(initial.contactEmail);
  const [showPublicPhone, setShowPublicPhone] = useState(initial.showPublicPhone);

  const contactPhoneFallback =
    ownedCompany?.contactPhone?.trim() || userDefaults?.phone?.trim() || '';
  const contactEmailFallback =
    ownedCompany?.contactEmail?.trim() || userDefaults?.email?.trim() || '';
  const contactPhone = contactPhoneInput.trim() || contactPhoneFallback;
  const contactEmail = contactEmailInput.trim() || contactEmailFallback;
  const setContactPhone = setContactPhoneInput;
  const setContactEmail = setContactEmailInput;
  const [showPublicEmail, setShowPublicEmail] = useState(initial.showPublicEmail);
  const [description, setDescription] = useState(initial.description);

  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
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

  const resolveLogoPayload = async (): Promise<string | undefined> => {
    if (logoFile) return uploadCompanyLogo(logoFile);
    if (logoRemoved) return '';
    return undefined;
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
      MANAGER_PROFILE_FIELDS.reduce<Array<[string, unknown]>>((acc, field) => {
        if (field !== 'logoUrl') {
          switch (field) {
            case 'cityId':
              acc.push([field, cityId]);
              break;
            case 'categoryId':
              acc.push([field, categoryId || undefined]);
              break;
            case 'contactPhone':
              acc.push([field, contactPhone.trim() || undefined]);
              break;
            case 'contactEmail':
              acc.push([field, contactEmail.trim() || undefined]);
              break;
            case 'description':
              acc.push([field, description.trim() || undefined]);
              break;
            default:
              acc.push([field, undefined]);
              break;
          }
        }
        return acc;
      }, []),
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
        if (logoChanged && nextLogoUrl === '') setLogoUrl(null);
        else if (logoChanged && nextLogoUrl) setLogoUrl(nextLogoUrl);
        setLogoFile(null);
        setLogoPreview(null);
        setLogoRemoved(false);
        toast.success(t('company.profileEditor.toastUpdated'));
      } else {
        await createCompany.mutateAsync({
          ...payload,
          ...(logoChanged && nextLogoUrl ? { logoUrl: nextLogoUrl } : {}),
        });
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

  const handleLeaveTeam = () => {
    ask({
      title: t('cabinet.common.confirmAction'),
      confirmLabel: t('cabinet.common.confirmAction'),
      variant: 'danger',
      message: t('company.profileEditor.form.confirmLeave'),
      onConfirm: async () => {
        try {
          await leaveCompany.mutateAsync();
          toast.success(t('company.profileEditor.toastLeft'));
          navigate('/company/lucrari', { replace: true });
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, t('company.profileEditor.form.leaveFailed')));
        }
      },
    });
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
    isSaving,
    legalReadOnly,
    canLeaveCompany,
    leaveCompanyPending: leaveCompany.isPending,
    publishCompanyPending: publishCompany.isPending,
    handleLogoPick,
    handleSubmit,
    handlePublish,
    handleLeaveTeam,
    confirmDialog,
  };
}
