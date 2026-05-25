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
      <div className="space-y-6 animate-pulse pb-10">
        <div className="h-48 rounded-3xl bg-slate-100" />
        <div className="h-64 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl bg-red-50 px-6 py-16 text-center">
        <p className="text-sm text-red-600 mb-4">Compania nu a fost găsită sau nu este publică.</p>
        <Link to="/companies" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          ← Înapoi la catalog
        </Link>
      </div>
    );
  }

  const company = data;
  const rating = Number(company.rating);
  const gallery = company.galleryImages ?? [];

  return (
    <>
      <Helmet>
        <title>{company.name} — Faber Companii</title>
        <meta name="description" content={company.description ?? `Profil public ${company.name}`} />
      </Helmet>

      <div className="space-y-8 animate-fade-in pb-10">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Toate companiile
        </Link>

        <section className="glass-panel rounded-3xl overflow-hidden shadow-premium">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700" />
          <div className="px-5 sm:px-8 pb-8 -mt-14 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="xl" className="shrink-0" />

              <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verificată
                  </span>
                </div>
                {company.category ? (
                  <p className="text-sm font-medium text-violet-600">{company.category.name}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  {company.city ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {company.city.name}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {rating.toFixed(1)} · {company.totalReviews} recenzii
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    {company.teamSize} tehnicieni
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:text-right shrink-0">
                {company.contactPhone ? (
                  <a
                    href={`tel:${company.contactPhone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-violet-600"
                  >
                    <Phone className="h-4 w-4" />
                    {company.contactPhone}
                  </a>
                ) : null}
                {company.contactEmail ? (
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600"
                  >
                    <Mail className="h-4 w-4" />
                    {company.contactEmail}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {company.description ? (
          <section className="glass-panel rounded-3xl p-6 sm:p-8 shadow-premium">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Despre companie</h2>
            <p className="text-gray-600 leading-relaxed">{company.description}</p>
          </section>
        ) : null}

        <section>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Galerie foto</h2>
            <p className="text-sm text-gray-500 mt-1">
              Lucrări realizate și echipa pe teren — click pe poză pentru mărire.
            </p>
          </div>
          <CompanyGallery images={gallery} />
        </section>

        <CompanyReviewsSection
          slug={company.slug}
          rating={rating}
          totalReviews={company.totalReviews}
        />

        {(company.packages?.length ?? 0) > 0 ? (
          <section className="glass-panel rounded-3xl p-6 sm:p-8 shadow-premium">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pachete servicii</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.packages?.map((pkg) => (
                <article
                  key={pkg.id}
                  className="rounded-2xl bg-slate-50/80 p-5 border border-white/60"
                >
                  <h3 className="font-semibold text-gray-900">{pkg.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pkg.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-bold text-violet-700">
                      {Number(pkg.price).toLocaleString('ro-MD')} {pkg.currency ?? 'MDL'}
                    </span>
                    <span className="text-gray-400">{pkg.durationMinutes} min</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
