import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  MessageSquare,
  HardHat,
} from 'lucide-react';
import {
  useCompanyBySlugQuery,
  useRequestPublicServiceMutation,
  useRequestPublicProjectMutation,
} from '@/features/companies/api/useCompanies';
import { AppModal } from '@/components/ui/AppModal';
import {
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/components/cabinet/cabinet-ui';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import { CompanyGallery } from '@/components/public/CompanyGallery';
import { CompanyReviewsSection } from '@/components/reviews/CompanyReviewsSection';
import { formatServiceDuration } from '@/utils/serviceDuration';
import { useAuthStore } from '@/stores/authStore';
import { formatPersonName } from '@/utils/person';
import { useMeQuery } from '@/features/auth/api/useAuth';
import { getErrorMessage } from '@/utils/errors';

function ClientProfileSummary({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs space-y-1">
      <p className="font-bold text-violet-800 uppercase tracking-wide text-[10px]">Datele tale</p>
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-600">{phone}</p>
      <p className="text-slate-600">{email}</p>
    </div>
  );
}

export function CompanyDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = !!user && !!accessToken;
  const isEndClient = user?.accountKind === 'END_CLIENT';
  const showRequestActions = !isAuthenticated || isEndClient;
  const { data: me } = useMeQuery(isAuthenticated && isEndClient);
  const { data, isLoading, isError } = useCompanyBySlugQuery(slug);
  const requestService = useRequestPublicServiceMutation(slug);
  const requestProject = useRequestPublicProjectMutation(slug);
  const [requestModal, setRequestModal] = useState<{ serviceId: string; serviceName: string } | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectCategoryId, setProjectCategoryId] = useState('');
  const [projectEstimatedBudget, setProjectEstimatedBudget] = useState('');
  const [projectMessage, setProjectMessage] = useState('');

  const profileName =
    formatPersonName(
      { firstName: me?.firstName, lastName: me?.lastName, email: me?.email },
      me?.email?.split('@')[0] ?? '',
    );
  const profilePhone = me?.phone?.trim() ?? '';
  const profileEmail = me?.email ?? '';

  const requireClientAuth = useCallback(() => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
      return false;
    }
    if (!isEndClient) {
      toast.error('Doar conturile de client pot trimite cereri.');
      return false;
    }
    if (!profilePhone) {
      toast.error('Completați telefonul în contul de client înainte de a trimite cereri.');
      navigate('/register?kind=END_CLIENT');
      return false;
    }
    return true;
  }, [isAuthenticated, isEndClient, location.pathname, navigate, profilePhone]);

  const openServiceRequest = (serviceId: string, serviceName: string) => {
    if (!requireClientAuth()) return;
    setMessage('');
    setRequestModal({ serviceId, serviceName });
  };

  const openProjectRequest = () => {
    if (!requireClientAuth()) return;
    setProjectTitle('');
    setProjectAddress(me?.portalCustomer?.address || '');
    setProjectCategoryId(data?.category?.id ?? '');
    setProjectEstimatedBudget('');
    setProjectMessage('');
    setProjectModalOpen(true);
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestModal) return;
    try {
      await requestService.mutateAsync({
        serviceId: requestModal.serviceId,
        message: message.trim() || undefined,
      });
      toast.success('Cererea a fost trimisă! Compania vă va contacta.');
      setRequestModal(null);
      setMessage('');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut trimite cererea.'));
    }
  };

  const resetProjectForm = () => {
    setProjectTitle('');
    setProjectAddress('');
    setProjectCategoryId('');
    setProjectEstimatedBudget('');
    setProjectMessage('');
  };

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectMessage.trim()) {
      toast.error('Completați descrierea lucrării.');
      return;
    }
    const budgetValue = projectEstimatedBudget.trim()
      ? Number(projectEstimatedBudget.replace(/\s/g, '').replace(',', '.'))
      : undefined;
    if (budgetValue != null && (Number.isNaN(budgetValue) || budgetValue < 0)) {
      toast.error('Bugetul estimativ trebuie să fie un număr valid.');
      return;
    }
    try {
      await requestProject.mutateAsync({
        message: projectMessage.trim(),
        address: projectAddress.trim() || undefined,
        categoryId: projectCategoryId || data?.category?.id || undefined,
        projectTitle: projectTitle.trim() || undefined,
        estimatedBudget: budgetValue,
      });
      toast.success('Cererea de proiect a fost trimisă! Compania vă va contacta.');
      setProjectModalOpen(false);
      resetProjectForm();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nu s-a putut trimite cererea.'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pb-12 max-w-6xl mx-auto">
        <div className="h-60 rounded-3xl bg-slate-200/80" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="h-48 rounded-3xl bg-slate-200/80" />
            <div className="h-64 rounded-3xl bg-slate-200/80" />
          </div>
          <div className="h-80 rounded-3xl bg-slate-200/80" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center">
        <div className="glass-panel rounded-3xl p-12 border-red-100 shadow-premium">
          <p className="text-base font-semibold text-red-600 mb-6">
            Compania nu a fost găsită sau profilul nu este public.
          </p>
          <Link
            to="/companies"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-premium hover:opacity-95 transition-all"
          >
            ← Înapoi la catalog
          </Link>
        </div>
      </div>
    );
  }

  const company = data;
  const rating = Number(company.rating);
  const gallery = company.galleryImages ?? [];

  // Determine if contact options are available
  const hasPublicContact = !!(company.contactPhone || company.contactEmail);

  return (
    <>
      <Helmet>
        <title>{company.name} — Faber Companii</title>
        <meta name="description" content={company.description ?? `Profil public ${company.name}`} />
      </Helmet>

      <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          to="/companies"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Toate companiile
        </Link>

        {/* Premium Unified Hero Card */}
        <div className="relative rounded-[32px] overflow-hidden border border-slate-200/60 bg-white shadow-premium transition-all duration-300 hover:shadow-xl">
          {/* Deep corporate backdrop */}
          <div className="absolute top-0 inset-x-0 h-44 sm:h-52" style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #1e3a5f 70%, #0f172a 100%)'
          }} />
          
          {/* Subtle warm accent glow */}
          <div className="absolute top-0 inset-x-0 h-44 sm:h-52 opacity-30" style={{
            backgroundImage: 'radial-gradient(ellipse at 70% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(51, 65, 85, 0.3) 0%, transparent 50%)'
          }} />
          
          {/* Fine grid lines for blueprint feel */}
          <div className="absolute top-0 inset-x-0 h-44 sm:h-52 opacity-[0.06]" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
          
          {/* Decorative glass accents */}
          <div className="absolute top-10 right-12 w-32 h-16 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hidden md:block" />
          <div className="absolute top-24 right-28 w-12 h-12 rounded-full bg-white/[0.04] backdrop-blur-lg border border-white/[0.06] hidden md:block" />

          {/* Hero Content Section */}
          <div className="relative pt-24 sm:pt-32 px-6 sm:px-10 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              {/* Logo Frame with Double Gradient Glow */}
              <div className="shrink-0 -mt-14 relative group self-start md:self-auto">
                <div className="absolute -inset-1 bg-gradient-to-tr from-slate-600 to-indigo-500 rounded-[30px] blur opacity-30 group-hover:opacity-55 transition-opacity duration-500" />
                <div className="relative p-1 bg-white rounded-[30px] shadow-2xl">
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logoUrl}
                    size="xl"
                    className="shrink-0 rounded-[26px] border border-slate-100 bg-white"
                  />
                </div>
              </div>

              {/* Identity details with Premium Tags */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none text-wrap:balance">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-xs">
                    <BadgeCheck className="h-3.5 w-3.5 fill-emerald-100" />
                    Verificată
                  </span>
                </div>

                {company.category ? (
                  <span className="inline-block rounded-xl bg-violet-50 border border-violet-100 px-3.5 py-1 text-xs font-bold text-violet-700 tracking-wide uppercase mb-4">
                    {company.category.name}
                  </span>
                ) : null}

                {/* Refined modern info tags */}
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 pt-2 border-t border-slate-100">
                  {company.city ? (
                    <span className="inline-flex items-center gap-2 font-medium">
                      <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      {company.city.name}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2 font-medium">
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                      <Users className="h-4 w-4" />
                    </div>
                    {company.teamSize} membri în echipă
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <div className="p-1 rounded-lg bg-amber-50 text-amber-500 border border-amber-100/50">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="font-extrabold text-slate-800">{rating.toFixed(1)}</span>
                    <span className="text-slate-400">· {company.totalReviews} recenzii</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Content Column */}
          <div className="space-y-8 min-w-0">
            {/* Description Block */}
            {company.description ? (
              <section className="glass-panel rounded-[28px] p-6 sm:p-8 shadow-premium border border-white/40">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Despre companie
                  </h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-wrap:pretty whitespace-pre-line">
                  {company.description}
                </p>
              </section>
            ) : null}

            {/* Photo Gallery Frame (gallery remains unmodified, but wrapper is premium) */}
            <section className="glass-panel rounded-[28px] p-6 sm:p-8 shadow-premium border border-white/40">
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Galerie media
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Lucrări realizate, imagini și videoclipuri de pe teren.
                </p>
              </div>
              <CompanyGallery images={gallery} />
            </section>

            {(company.services?.length ?? 0) > 0 ? (
              <section className="glass-panel rounded-[28px] p-6 sm:p-8 shadow-premium border border-white/40">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-violet-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Servicii & prețuri
                  </h2>
                </div>
                {!isAuthenticated ? (
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Pentru a solicita un serviciu,{' '}
                    <Link to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} className="font-semibold text-violet-600 hover:underline">
                      autentificați-vă
                    </Link>{' '}
                    cu un cont de client sau{' '}
                    <Link to="/register?kind=END_CLIENT" className="font-semibold text-violet-600 hover:underline">
                      creați unul
                    </Link>
                    .
                  </p>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.services?.map((service) => {
                    const durationLabel = formatServiceDuration(service.durationMinutes);
                    return (
                    <article
                      key={service.id}
                      className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-100 hover:border-violet-200/80 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.08)] hover:-translate-y-1 p-6"
                    >
                      {/* Premium Top Glow Bar on Hover */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight text-wrap:pretty text-base">
                            {service.name}
                          </h3>
                          
                          {/* Price in a glowing badge */}
                          <span className="shrink-0 inline-flex items-center bg-violet-50 text-violet-700 font-extrabold text-sm px-3.5 py-1.5 rounded-2xl border border-violet-100/50 tabular-nums">
                            {Number(service.defaultPrice).toLocaleString('ro-MD')}{' '}
                            {service.currency ?? 'MDL'}
                          </span>
                        </div>
                        
                        {service.description ? (
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed text-wrap:pretty font-medium">
                            {service.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-300 italic leading-relaxed font-medium">
                            Nicio descriere adăugată pentru acest serviciu.
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-100/60 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                            Disponibilitate serviciu
                          </span>
                          {durationLabel ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-xl">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {durationLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-400 rounded-xl">
                              <Clock className="h-3 w-3 text-slate-300" />
                              Durată variabilă
                            </span>
                          )}
                        </div>
                        
                        {showRequestActions ? (
                          <button
                            type="button"
                            onClick={() => openServiceRequest(service.id, service.name)}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                          >
                            Solicită serviciul
                          </button>
                        ) : null}
                      </div>
                    </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {showRequestActions ? (
              <section className="relative rounded-[32px] overflow-hidden border border-violet-100/60 bg-gradient-to-br from-violet-50/50 via-indigo-50/20 to-white p-6 sm:p-8 shadow-premium transition-all duration-300 hover:shadow-xl">
                {/* Visual Glow Decorators */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
                
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0">
                        <HardHat className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Cerere proiect / lucrare complexă
                      </h2>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
                      Descrieți lucrarea dorită — renovări, instalații, proiecte pe termen lung. Compania
                      vă va contacta pentru evaluare și smetă.{!isAuthenticated && ' Necesită cont de client autentificat.'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={openProjectRequest}
                    className="shrink-0 inline-flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-violet-500/10 hover:shadow-xl hover:shadow-violet-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Trimite cerere proiect
                  </button>
                </div>
              </section>
            ) : null}

            {/* Reviews */}
            <CompanyReviewsSection
              slug={company.slug}
              rating={rating}
              totalReviews={company.totalReviews}
            />
          </div>

          {/* Sticky Sidebar Column */}
          <aside className="space-y-6 lg:sticky lg:top-8">
            {/* Structural metrics & Quick Info Widget */}
            <div className="glass-panel rounded-[28px] p-6 shadow-premium border border-white/40 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                  Specificații Companie
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Oraș</span>
                  <span className="font-extrabold text-slate-800 text-right">
                    {company.city?.name ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Categorie</span>
                  <span className="font-extrabold text-violet-600 text-right">
                    {company.category?.name ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Tehnicieni</span>
                  <span className="font-extrabold text-slate-800 text-right">
                    {company.teamSize} membri activi
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">TVA</span>
                  <span className="font-extrabold text-slate-800 text-right">
                    {company.isTvaPayer ? 'Plătitor de TVA' : 'Neplătitor de TVA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Contact Widget */}
            <div className="glass-panel rounded-[28px] p-6 shadow-premium border border-white/40 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="h-5 w-5 text-violet-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                  Contact public
                </h3>
              </div>

              {hasPublicContact ? (
                <div className="flex flex-col gap-3">
                  {company.contactPhone ? (
                    <a
                      href={`tel:${company.contactPhone.replace(/\s/g, '')}`}
                      className="group flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-premium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Phone className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      Apelează compania
                    </a>
                  ) : null}

                  {company.contactEmail ? (
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="group flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-violet-600 transition-colors" />
                      Trimite email
                    </a>
                  ) : null}

                  {/* Settings status indicator (subtle hint) */}
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium text-center">
                    <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                    Canale oficiale asigurate de platformă
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed text-wrap:pretty">
                    Informațiile de contact direct au fost ascunse de către proprietarul companiei.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal text-wrap:pretty">
                    Puteți plasa o cerere directă din catalogul de servicii publicat.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <AppModal
        open={requestModal !== null}
        onClose={() => setRequestModal(null)}
        title={requestModal ? `Solicită: ${requestModal.serviceName}` : 'Solicită serviciul'}
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <ClientProfileSummary name={profileName} phone={profilePhone} email={profileEmail} />
          <div>
            <label className={cabinetLabelClass} htmlFor="req-msg">
              Mesaj
            </label>
            <textarea
              id="req-msg"
              className={cabinetFieldClass}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button type="submit" className={cabinetBtnPrimary} disabled={requestService.isPending}>
            {requestService.isPending ? 'Se trimite…' : 'Trimite cererea'}
          </button>
        </form>
      </AppModal>

      <AppModal
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          resetProjectForm();
        }}
        title="Cerere proiect / lucrare complexă"
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <ClientProfileSummary name={profileName} phone={profilePhone} email={profileEmail} />
          <div>
            <label className={cabinetLabelClass} htmlFor="proj-title">
              Titlu proiect
            </label>
            <input
              id="proj-title"
              className={cabinetFieldClass}
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Ex: Renovare apartament 2 camere"
            />
          </div>
          <div>
            <label className={cabinetLabelClass} htmlFor="proj-category">
              Tip lucrare
            </label>
            {data?.category ? (
              <input
                id="proj-category"
                className={`${cabinetFieldClass} bg-slate-50 text-slate-700`}
                value={data.category.name}
                readOnly
              />
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Compania nu are categorie setată în profil. Cererea va fi trimisă fără tip lucrare.
              </p>
            )}
          </div>
          <div>
            <label className={cabinetLabelClass} htmlFor="proj-budget">
              Buget estimativ (MDL)
            </label>
            <input
              id="proj-budget"
              type="number"
              min={0}
              step={100}
              className={cabinetFieldClass}
              value={projectEstimatedBudget}
              onChange={(e) => setProjectEstimatedBudget(e.target.value)}
              placeholder="Ex: 25000"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Opțional — suma aproximativă pe care o aveți în vedere pentru proiect.
            </p>
          </div>
          <div>
            <label className={cabinetLabelClass} htmlFor="proj-address">
              Adresă / locație
            </label>
            <input
              id="proj-address"
              className={cabinetFieldClass}
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
            />
          </div>
          <div>
            <label className={cabinetLabelClass} htmlFor="proj-msg">
              Descriere lucrare *
            </label>
            <textarea
              id="proj-msg"
              className={cabinetFieldClass}
              rows={4}
              value={projectMessage}
              onChange={(e) => setProjectMessage(e.target.value)}
              placeholder="Detaliați ce doriți realizat, termenul dorit, suprafața etc."
              required
            />
          </div>
          <button type="submit" className={cabinetBtnPrimary} disabled={requestProject.isPending}>
            {requestProject.isPending ? 'Se trimite…' : 'Trimite cererea'}
          </button>
        </form>
      </AppModal>
    </>
  );
}

