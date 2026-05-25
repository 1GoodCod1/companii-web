import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useCompanyBySlugQuery } from '@/features/companies/api/useCompanies';
import { CompanyLogo } from '@/components/public/CompanyLogo';
import { CompanyGallery } from '@/components/public/CompanyGallery';
import { CompanyReviewsSection } from '@/components/reviews/CompanyReviewsSection';

export function CompanyDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useCompanyBySlugQuery(slug);

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

        {/* Hero Header Banner */}
        <div className="relative rounded-[32px] overflow-hidden shadow-premium bg-slate-900 border border-white/10">
          {/* Ambient Glowing Blobs behind Card */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/25 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/20 blur-[130px] pointer-events-none" />

          {/* Premium Abstract Gradient Backdrop */}
          <div className="h-40 sm:h-52 md:h-60 w-full bg-gradient-to-br from-[oklch(0.55_0.24_286.96)] via-[oklch(0.48_0.22_295.0)] to-[oklch(0.35_0.20_310.0)] relative opacity-95">
            {/* Polka Dot texture overlap */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          {/* Overlapping Info Card */}
          <div className="glass-panel relative rounded-b-[32px] px-6 sm:px-10 pb-8 pt-0 -mt-16 sm:-mt-20 border-t-0 border-x-0 border-b-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Logo Frame */}
              <div className="shrink-0 -mt-10 sm:-mt-14 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition-opacity" />
                <CompanyLogo
                  name={company.name}
                  logoUrl={company.logoUrl}
                  size="xl"
                  className="relative shrink-0 rounded-3xl border-4 border-white shadow-xl bg-white"
                />
              </div>

              {/* Identity details */}
              <div className="flex-1 min-w-0 pt-2 sm:pt-4">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none text-wrap:balance">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-sm animate-pulse-slow">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verificată
                  </span>
                </div>

                {company.category ? (
                  <p className="text-sm font-bold text-violet-600 tracking-wide uppercase mb-3">
                    {company.category.name}
                  </p>
                ) : null}

                {/* Micro tags */}
                <div className="flex flex-wrap gap-x-4 gap-y-2.5 text-sm text-slate-500">
                  {company.city ? (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {company.city.name}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Users className="h-4 w-4 text-slate-400" />
                    {company.teamSize} tehnicieni
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
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
                  Galerie foto
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Lucrări realizate și imagini de pe teren. Faceți click pe poză pentru mărire.
                </p>
              </div>
              <CompanyGallery images={gallery} />
            </section>

            {/* Service Packages */}
            {(company.packages?.length ?? 0) > 0 ? (
              <section className="glass-panel rounded-[28px] p-6 sm:p-8 shadow-premium border border-white/40">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-violet-600" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Pachete de servicii
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {company.packages?.map((pkg) => (
                    <article
                      key={pkg.id}
                      className="group flex flex-col justify-between rounded-2xl bg-slate-50/70 p-5 border border-slate-100 hover:border-violet-100 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-premium"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight text-wrap:pretty">
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed text-wrap:pretty">
                          {pkg.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-sm">
                        <span className="font-extrabold text-violet-600 tabular-nums">
                          {Number(pkg.price).toLocaleString('ro-MD')} {pkg.currency ?? 'MDL'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Clock className="h-3 w-3" />
                          {pkg.durationMinutes} min
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Reviews Container */}
            <div className="glass-panel rounded-[28px] p-6 sm:p-8 shadow-premium border border-white/40">
              <CompanyReviewsSection
                slug={company.slug}
                rating={rating}
                totalReviews={company.totalReviews}
              />
            </div>
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
                    Puteți plasa o cerere directă utilizând pachetele de servicii publicate.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

