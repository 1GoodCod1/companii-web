import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCompanyMeQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  usePublishCompanyMutation,
  useAddGalleryImageMutation,
  useRemoveGalleryImageMutation,
  uploadCompanyLogo,
  useCitiesQuery,
  useCategoriesQuery,
  useLeaveCompanyMutation,
} from '@/features/companies/api/useCompanies';
import {
  PageHero,
  FormSection,
  SoftBadge,
  EmptyState,
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
import type { CatalogOptionDto, OwnedCompanyDto } from '@/features/companies/types';
import { uploadFile, uploadFiles } from '@/api/files';
import { validateImageFile } from '@/utils/validateFile';
import { useMeQuery } from '@/features/auth/api/useAuth';
import toast from 'react-hot-toast';
import { resolveActiveCompany, MANAGER_PROFILE_FIELDS } from '@/features/companies/resolveActiveCompany';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';

type OwnedCompany = OwnedCompanyDto;

const MAX_GALLERY = 12;

function createFormState(
  company: OwnedCompany | null,
  userDefaults?: { email?: string; phone?: string | null },
) {
  return {
    name: company?.name ?? '',
    legalName: company?.legalName ?? '',
    idno: company?.idno ?? '',
    legalAddress: company?.legalAddress ?? '',
    cityId: company?.cityId ?? '',
    categoryId: company?.categoryId ?? '',
    isTvaPayer: company?.isTvaPayer ?? false,
    tvaCode: company?.tvaCode ?? '',
    contactPhone: company?.contactPhone ?? userDefaults?.phone ?? '',
    contactEmail: company?.contactEmail ?? userDefaults?.email ?? '',
    showPublicPhone: company?.showPublicPhone ?? true,
    showPublicEmail: company?.showPublicEmail ?? true,
    description: company?.description ?? '',
    logoUrl: company?.logoUrl ?? null,
  };
}

export function CompanyProfilePage() {
  const { data: authMe } = useMeQuery();
  const { data: companyMe, isLoading: isLoadingMe } = useCompanyMeQuery();
  const { data: cities, isLoading: isLoadingCities } = useCitiesQuery();
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery();
  const { activeCompanyId, isLegalOwner, canEditLegalProfile, canPublishCompany, canRegisterCompany } =
    useCompanyPermissions();

  const { company: activeCompany } = resolveActiveCompany(companyMe, activeCompanyId);
  const userDefaults = {
    email: authMe?.email,
    phone: authMe?.phone ?? null,
  };

  if (isLoadingMe || isLoadingCities || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Se încarcă profilul companiei...
      </div>
    );
  }

  if (!activeCompany && canRegisterCompany) {
    return (
      <CompanyProfileEditor
        key="new"
        ownedCompany={null}
        isLegalOwner={false}
        canRegisterCompany
        canEditLegalProfile
        canPublishCompany={false}
        cities={cities}
        categories={categories}
        userDefaults={userDefaults}
      />
    );
  }

  if (!activeCompany) {
    return (
      <div className="max-w-2xl">
        <EmptyState message="Profilul companiei nu este disponibil. Contactați proprietarul pentru acces." />
      </div>
    );
  }

  return (
    <CompanyProfileEditor
      key={activeCompany.id}
      ownedCompany={activeCompany}
      isLegalOwner={isLegalOwner}
      canEditLegalProfile={canEditLegalProfile}
      canPublishCompany={canPublishCompany}
      cities={cities}
      categories={categories}
      userDefaults={userDefaults}
    />
  );
}

function CompanyProfileEditor({
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
    (fileList: FileList | File[]) => {
      const existingCount = (ownedCompany?.galleryImages?.length ?? 0) + pendingGallery.length;
      const room = MAX_GALLERY - existingCount;
      if (room <= 0) {
        toast.error(`Maximum ${MAX_GALLERY} poze în galerie.`);
        return;
      }

      const next: PendingGalleryItem[] = [];
      for (const file of Array.from(fileList).slice(0, room)) {
        const err = validateImageFile(file);
        if (err) {
          toast.error(err === 'files.tooLarge' ? 'Poză prea mare (max 10 MB)' : 'Format invalid');
          continue;
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
    [ownedCompany?.galleryImages?.length, pendingGallery.length],
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
      toast.success('Poza a fost ștearsă.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut șterge poza.');
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
      files.length === 1 ? [await uploadFile(files[0]!)] : await uploadFiles(files);

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
      toast.error('Doar proprietarul poate crea o companie nouă.');
      return;
    }

    if (!ownedCompany || isLegalOwner) {
      if (!name.trim() || !legalName.trim() || !legalAddress.trim()) {
        toast.error('Vă rugăm să completați toate câmpurile obligatorii.');
        return;
      }

      if (!/^\d{13}$/.test(idno.trim())) {
        toast.error('Codul IDNO trebuie să conțină exact 13 cifre.');
        return;
      }
    }

    if (!cityId) {
      toast.error('Vă rugăm să alegeți un oraș din listă.');
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
        toast.success('Profilul companiei a fost actualizat cu succes!');
      } else {
        const created = (await createCompany.mutateAsync({
          ...payload,
          ...(logoChanged && nextLogoUrl ? { logoUrl: nextLogoUrl } : {}),
        })) as { id: string };
        await savePendingGallery(created.id);
        toast.success('Compania dvs. a fost creată cu succes!');
        navigate('/company', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'A apărut o eroare la salvarea datelor.');
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handlePublish = async () => {
    if (!ownedCompany) return;
    try {
      await publishCompany.mutateAsync(ownedCompany.id);
      toast.success('Compania a fost publicată în catalog!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Nu s-a putut publica compania.');
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
        eyebrow={ownedCompany ? (isLegalOwner ? 'Profil companie' : 'Profil companie · Manager') : 'Onboarding'}
        title={ownedCompany ? 'Profilul companiei' : 'Înregistrare companie nouă'}
        description={
          ownedCompany
            ? isLegalOwner
              ? 'Actualizați detaliile juridice, branding-ul și datele de contact.'
              : 'Actualizați contactul public, descrierea și galeria. Datele juridice sunt gestionate de proprietar.'
            : 'Completați profilul juridic, logo-ul și galeria pentru catalogul public.'
        }
      />

      {ownedCompany && !isLegalOwner ? (
        <p className="text-sm text-violet-900 rounded-2xl bg-violet-50/80 px-4 py-3 border border-violet-100">
          Ca manager puteți edita informațiile vizibile clienților (contact, descriere, logo, galerie).
          IDNO, denumirea juridică și publicarea în catalog rămân la proprietar.
        </p>
      ) : null}

      {ownedCompany && canPublishCompany ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Profil public în catalog</h2>
              <p className="mt-1 text-sm text-gray-500">
                Companiile apar pe pagina /companies doar după verificare de admin și publicare.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
                {ownedCompany.isVerified ? 'Verificată' : 'În așteptare verificare'}
              </SoftBadge>
              <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
                {ownedCompany.isPublished ? 'Publicată' : 'Nepublicată'}
              </SoftBadge>
            </div>
          </div>

          {ownedCompany.isPublished ? (
            <p className="text-sm text-emerald-700">
              Compania este vizibilă în catalogul public
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
                    vezi profilul
                  </a>
                </>
              ) : null}
              .
            </p>
          ) : ownedCompany.isVerified ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50/80 px-4 py-3">
              <p className="text-sm text-violet-900">
                Compania este verificată. Publicați profilul ca să apară în catalog.
              </p>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={publishCompany.isPending}
                className={cabinetBtnPrimary}
              >
                {publishCompany.isPending ? 'Se publică...' : 'Publică în catalog'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-800 rounded-2xl bg-amber-50/80 px-4 py-3">
              După ce administratorul verifică compania, veți putea publica profilul în catalog.
            </p>
          )}
        </section>
      ) : null}

      {ownedCompany && !isLegalOwner ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium space-y-3">
          <div className="flex flex-wrap gap-2">
            <SoftBadge tone={ownedCompany.isVerified ? 'emerald' : 'amber'}>
              {ownedCompany.isVerified ? 'Verificată' : 'În așteptare verificare'}
            </SoftBadge>
            <SoftBadge tone={ownedCompany.isPublished ? 'emerald' : 'gray'}>
              {ownedCompany.isPublished ? 'Publicată' : 'Nepublicată'}
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
                Vezi profilul public
              </a>
            </p>
          ) : null}
        </section>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start"
      >
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium space-y-4">
        <FormSection
          title="Informații juridice"
          description={
            legalReadOnly
              ? 'Doar proprietarul poate modifica datele juridice.'
              : 'Datele oficiale înregistrate la autorități.'
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>Nume comercial *</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder="ex: Faber Servicii"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Denumire juridică completă *</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder="ex: Faber Solutions SRL"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>Cod IDNO (13 cifre) *</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                maxLength={13}
                placeholder="ex: 1012345678901"
                value={idno}
                onChange={(e) => setIdno(e.target.value.replace(/\D/g, ''))}
                className={`${fieldClass(legalReadOnly)} font-semibold tracking-wide`}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Adresă juridică *</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder="ex: str. Albișoara 42, ap. 15"
                value={legalAddress}
                onChange={(e) => setLegalAddress(e.target.value)}
                className={fieldClass(legalReadOnly)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Localizare & domeniu" description="Orașul și categoria principală de servicii.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>Oraș de reședință *</label>
              <select
                required
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!cities?.length}
                className={cabinetSelectClass}
              >
                <option value="">
                  {cities?.length ? 'Alegeți orașul...' : 'Nu există orașe — rulați seed API'}
                </option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={cabinetLabelClass}>Categorie servicii</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!categories?.length}
                className={cabinetSelectClass}
              >
                <option value="">
                  {categories?.length
                    ? 'Alegeți domeniul (opțional)...'
                    : 'Nu există categorii — rulați seed API'}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Regim fiscal"
          description={legalReadOnly ? 'Setări TVA — doar proprietarul.' : 'Setări TVA pentru facturare.'}
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
              Compania este plătitoare de TVA <span className="text-gray-400">(20% / 8% / 0%)</span>
            </span>
          </label>

          {isTvaPayer ? (
            <div className="max-w-sm animate-fade-in">
              <label className={cabinetLabelClass}>Cod plătitor TVA</label>
              <input
                type="text"
                required={!legalReadOnly}
                readOnly={legalReadOnly}
                placeholder="ex: 0601234"
                value={tvaCode}
                onChange={(e) => setTvaCode(e.target.value)}
                className={`${fieldClass(legalReadOnly)} font-semibold`}
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection title="Contact public & descriere" description="Informații vizibile clienților pe profilul public. Telefonul și emailul se completează automat din contul dvs., dacă nu sunt setate deja.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cabinetLabelClass}>Telefon de contact</label>
              <input
                type="text"
                placeholder="ex: +373 68 000 000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={cabinetFieldClass}
              />
            </div>
            <div>
              <label className={cabinetLabelClass}>Email de contact</label>
              <input
                type="email"
                placeholder="ex: office@companie.md"
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
                    Arată telefonul public pe pagina companiei
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
                    Arată emailul public pe pagina companiei
                  </span>
                </label>
              </div>
            ) : null}
          </div>

          <div>
            <label className={cabinetLabelClass}>Descriere scurtă</label>
            <textarea
              placeholder="Spuneți clienților de ce servicii vă ocupați..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${cabinetFieldClass} resize-none`}
            />
          </div>
        </FormSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium">
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

          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium">
            <button
              type="submit"
              disabled={isSaving}
              className={`${cabinetBtnPrimary} w-full justify-center py-3 text-sm`}
            >
              {isSaving
                ? 'Se salvează...'
                : ownedCompany
                  ? 'Salvează modificările'
                  : 'Creează companie'}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Logo-ul și galeria se salvează împreună cu datele companiei.
            </p>
          </div>
        </aside>
      </form>

      {canLeaveCompany ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 shadow-premium space-y-4 border border-red-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Părăsiți echipa</h2>
            <p className="mt-1 text-sm text-gray-500">
              Lucrările active vi se vor dezasigna. Veți pierde accesul la cabinetul acestei companii.
            </p>
          </div>
          <button
            type="button"
            disabled={leaveCompany.isPending}
            onClick={async () => {
              if (!window.confirm('Sigur doriți să părăsiți această companie?')) return;
              try {
                await leaveCompany.mutateAsync();
                toast.success('Ați părăsit compania.');
                navigate('/company/lucrari', { replace: true });
              } catch (err: unknown) {
                toast.error((err as Error).message || 'Nu s-a putut părăsi compania.');
              }
            }}
            className={`${cabinetBtnSecondary} border-red-200 text-red-700 hover:bg-red-50`}
          >
            {leaveCompany.isPending ? 'Se procesează...' : 'Părăsește compania'}
          </button>
        </section>
      ) : null}
    </div>
  );
}
