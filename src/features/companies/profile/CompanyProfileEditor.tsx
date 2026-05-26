import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  usePublishCompanyMutation,
  useAddGalleryImageMutation,
  useRemoveGalleryImageMutation,
  uploadCompanyLogo,
  useLeaveCompanyMutation,
} from '@/features/companies/api/useCompanies';
import {
  PageHero,
  FormSection,
  SoftBadge,
  cabinetLabelClass,
  cabinetFieldClass,
  cabinetSelectClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import {
  CompanyBrandingSection,
  type PendingGalleryItem,
} from '@/components/company/CompanyBrandingSection';
import type { CatalogOptionDto, OwnedCompanyDto } from '@/types/companies';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/utils/translateCityCategory';
import { uploadFile, uploadFiles } from '@/api/files';
import { MAX_VIDEO_COUNT, MAX_VIDEO_DURATION } from '@/constants/fileMedia.constants';
import { validateMediaFile, isVideoFile, getVideoDuration } from '@/utils/validateFile';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';
import { MANAGER_PROFILE_FIELDS } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { createFormState, MAX_GALLERY } from './profileFormState';

type OwnedCompany = OwnedCompanyDto;

export function CompanyProfileEditor({
  ownedCompany,
  isLegalOwner,
  canRegisterCompany = false,
  canEditLegalProfile,
  canPublishCompany,
  cities,
  categories,
  userDefaults,
}: {
  ownedCompany: OwnedCompany | null;
  isLegalOwner: boolean;
  canRegisterCompany?: boolean;
  canEditLegalProfile: boolean;
  canPublishCompany: boolean;
  cities: CatalogOptionDto[] | undefined;
  categories: CatalogOptionDto[] | undefined;
  userDefaults?: { email?: string; phone?: string | null };
}) {
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

  const isSaving =
    createCompany.isPending || updateCompany.isPending || isSavingMedia;

  const legalReadOnly = !!ownedCompany && !canEditLegalProfile;
  const fieldClass = (readOnly: boolean) =>
    readOnly ? `${cabinetFieldClass} bg-gray-50 text-gray-600 cursor-not-allowed` : cabinetFieldClass;

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      <PageHero
        eyebrow={
          ownedCompany
            ? isLegalOwner
              ? t('company.profileEditor.eyebrowProfile')
              : t('company.profileEditor.eyebrowManager')
            : t('company.profileEditor.eyebrowOnboarding')
        }
        title={ownedCompany ? t('company.profileEditor.titleExisting') : t('company.profileEditor.titleNew')}
        description={
          ownedCompany
            ? isLegalOwner
              ? t('company.profileEditor.descOwner')
              : t('company.profileEditor.descManager')
            : t('company.profileEditor.descNew')
        }
      />

      {ownedCompany && !isLegalOwner ? (
        <p className="text-sm text-violet-900 rounded-2xl bg-violet-50/80 px-4 py-3 border border-violet-100">
          {t('company.profileEditor.form.managerHint')}
        </p>
      ) : null}

      {ownedCompany && canPublishCompany ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {t('company.profileEditor.form.publicCatalogTitle')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('company.profileEditor.form.publicCatalogDescription')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
                {ownedCompany.isVerified
                  ? t('company.profileEditor.verified')
                  : t('company.profileEditor.pendingVerification')}
              </SoftBadge>
              <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
                {ownedCompany.isPublished
                  ? t('company.profileEditor.published')
                  : t('company.profileEditor.unpublished')}
              </SoftBadge>
            </div>
          </div>

          {ownedCompany.isPublished ? (
            <p className="text-sm text-emerald-700">
              {t('company.profileEditor.form.visibleInCatalog')}
              {ownedCompany.slug ? (
                <>
                  {' '}
                  —{' '}
                  <a
                    href={`/companies/${ownedCompany.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    {t('company.profileEditor.form.viewProfile')}
                  </a>
                </>
              ) : null}
              .
            </p>
          ) : ownedCompany.isVerified ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50/80 px-4 py-3">
              <p className="text-sm text-violet-900">
                {t('company.profileEditor.form.verifiedReadyPublish')}
              </p>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={publishCompany.isPending}
                className={cabinetBtnPrimary}
              >
                {publishCompany.isPending
                  ? t('company.profileEditor.publishing')
                  : t('company.profileEditor.publishCatalog')}
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-800 rounded-2xl bg-amber-50/80 px-4 py-3">
              {t('company.profileEditor.form.pendingAdminVerification')}
            </p>
          )}
        </section>
      ) : null}

      {ownedCompany && !isLegalOwner ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6  space-y-3">
          <div className="flex flex-wrap gap-2">
            <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
              {ownedCompany.isVerified
                ? t('company.profileEditor.verified')
                : t('company.profileEditor.pendingVerification')}
            </SoftBadge>
            <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
              {ownedCompany.isPublished
                ? t('company.profileEditor.published')
                : t('company.profileEditor.unpublished')}
            </SoftBadge>
          </div>
          {ownedCompany.isPublished && ownedCompany.slug ? (
            <p className="text-sm text-gray-600">
              <a
                href={`/companies/${ownedCompany.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violet-700 underline underline-offset-2"
              >
                {t('company.profileEditor.form.viewPublicProfile')}
              </a>
            </p>
          ) : null}
        </section>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start"
      >
        <div className="glass-panel rounded-3xl p-5 sm:p-6  space-y-4">
        <FormSection
          title={t('company.profileEditor.form.legalTitle')}
          description={
            legalReadOnly
              ? t('company.profileEditor.form.legalDescReadOnly')
              : t('company.profileEditor.form.legalDesc')
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.tradeName')}</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder={t('company.profileEditor.form.tradeNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.legalName')}</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder={t('company.profileEditor.form.legalNamePlaceholder')}
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.idno')}</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                maxLength={13}
                placeholder={t('company.profileEditor.form.idnoPlaceholder')}
                value={idno}
                onChange={(e) => setIdno(e.target.value.replace(/\D/g, ''))}
                className={`${fieldClass(legalReadOnly)} font-semibold tracking-wide`}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.legalAddress')}</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder={t('company.profileEditor.form.legalAddressPlaceholder')}
                value={legalAddress}
                onChange={(e) => setLegalAddress(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title={t('company.profileEditor.form.locationTitle')}
          description={t('company.profileEditor.form.locationDesc')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.city')}</label>
              <select
                required
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!cities?.length}
                className={cabinetSelectClass}
              >
                <option value="">
                  {cities?.length
                    ? t('company.profileEditor.form.cityPlaceholder')
                    : t('company.profileEditor.form.cityEmpty')}
                </option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getTranslatedCityName(t, c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!categories?.length}
                className={cabinetSelectClass}
              >
                <option value="">
                  {categories?.length
                    ? t('company.profileEditor.form.categoryPlaceholder')
                    : t('company.profileEditor.form.categoryEmpty')}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getTranslatedCategoryName(t, cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title={t('company.profileEditor.form.fiscalTitle')}
          description={
            legalReadOnly
              ? t('company.profileEditor.form.fiscalDescReadOnly')
              : t('company.profileEditor.form.fiscalDesc')
          }
        >
          <label
            className={`flex items-start gap-3 rounded-xl bg-slate-50/80 px-3.5 py-3 ${
              legalReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              disabled={legalReadOnly}
              className="mt-0.5 rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              checked={isTvaPayer}
              onChange={(e) => setIsTvaPayer(e.target.checked)}
            />
            <span className="text-sm text-gray-700 leading-snug">
              {t('company.profileEditor.form.tvaPayer')}
            </span>
          </label>

          {isTvaPayer ? (
            <div className="max-w-sm animate-fade-in">
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.tvaCode')}</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder={t('company.profileEditor.form.tvaCodePlaceholder')}
                value={tvaCode}
                onChange={(e) => setTvaCode(e.target.value)}
                className={`${fieldClass(legalReadOnly)} font-semibold`}
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection
          title={t('company.profileEditor.form.contactTitle')}
          description={t('company.profileEditor.form.contactDesc')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.contactPhone')}</label>
              <input
                type="text"
                placeholder={t('company.profileEditor.form.contactPhonePlaceholder')}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={cabinetFieldClass}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>{t('company.profileEditor.form.contactEmail')}</label>
              <input
                type="email"
                placeholder={t('company.profileEditor.form.contactEmailPlaceholder')}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={cabinetFieldClass}
              />
            </div>

            {isLegalOwner ? (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer"
                    checked={showPublicPhone}
                    onChange={(e) => setShowPublicPhone(e.target.checked)}
                  />
                  <span className="text-xs font-semibold text-slate-700 leading-none select-none">
                    {t('company.profileEditor.form.showPublicPhone')}
                  </span>
                </label>
                <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/60 hover:bg-slate-100/80 transition-colors border border-slate-100 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer"
                    checked={showPublicEmail}
                    onChange={(e) => setShowPublicEmail(e.target.checked)}
                  />
                  <span className="text-xs font-semibold text-slate-700 leading-none select-none">
                    {t('company.profileEditor.form.showPublicEmail')}
                  </span>
                </label>
              </div>
            ) : null}
          </div>

          <div>
            <label className={cabinetLabelClass}>{t('company.profileEditor.form.description')}</label>
            <textarea
              placeholder={t('company.profileEditor.form.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${cabinetFieldClass} resize-none`}
            />
          </div>
        </FormSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 ">
            <CompanyBrandingSection
              variant="sidebar"
              companyName={name}
              logoUrl={logoUrl}
              logoPreview={logoPreview}
              onLogoPick={handleLogoPick}
              galleryImages={ownedCompany?.galleryImages ?? []}
              pendingGallery={pendingGallery}
              onGalleryPick={handleGalleryPick}
              onPendingGalleryCaptionChange={(id, caption) =>
                setPendingGallery((prev) =>
                  prev.map((item) => (item.id === id ? { ...item, caption } : item)),
                )
              }
              onPendingGalleryRemove={handlePendingGalleryRemove}
              onGalleryRemove={(imageId) => void handleGalleryRemove(imageId)}
              disabled={isSaving}
            />
          </div>

          <div className="glass-panel rounded-3xl p-5 sm:p-6 ">
            <button
              type="submit"
              disabled={isSaving}
              className={`${cabinetBtnPrimary} w-full justify-center py-3 text-sm`}
            >
              {isSaving
                ? t('cabinet.common.saving')
                : ownedCompany
                  ? t('company.profileEditor.saveChanges')
                  : t('company.profileEditor.createCompany')}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              {t('company.profileEditor.form.mediaHint')}
            </p>
          </div>
        </aside>
      </form>

      {canLeaveCompany ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6  space-y-4 border border-red-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {t('company.profileEditor.form.leaveTeamTitle')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('company.profileEditor.form.leaveTeamDesc')}
            </p>
          </div>
          <button
            type="button"
            disabled={leaveCompany.isPending}
            onClick={async () => {
              if (!window.confirm(t('company.profileEditor.form.confirmLeave'))) return;
              try {
                await leaveCompany.mutateAsync();
                toast.success(t('company.profileEditor.toastLeft'));
                navigate('/company/lucrari', { replace: true });
              } catch (err: unknown) {
                toast.error(getErrorMessage(err, t('company.profileEditor.form.leaveFailed')));
              }
            }}
            className={`${cabinetBtnSecondary} border-red-200 text-red-700 hover:bg-red-50`}
          >
            {leaveCompany.isPending ? t('company.profileEditor.leaving') : t('company.profileEditor.leaveCompany')}
          </button>
        </section>
      ) : null}
    </div>
  );
}
