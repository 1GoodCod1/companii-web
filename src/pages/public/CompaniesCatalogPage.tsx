import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowRightIcon, BuildingsIcon } from '@phosphor-icons/react';
import { SEOHead, SITE_URL } from '@/shared/ui/seo/SEOHead';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { CompanyCard } from '@/entities/company/ui/CompanyCard';
import {
  useCategoriesQuery,
  useCitiesQuery,
  useCompaniesListQuery,
} from '@/features/companies/api/useCompanies';
import { usePublicAuthCta } from '@/features/auth';
import { SkeletonCompanyCard } from '@/widgets/cabinet/cabinet-ui';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import {
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/shared/utils/translateCityCategory';

const RELATED_LIMIT = 12;
const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch';

export function CompaniesCatalogPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { citySlug = '', categorySlug = '' } = useParams();

  const { data: cities, isLoading: citiesLoading } = useCitiesQuery();
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();

  const city = useMemo(() => cities?.find((c) => c.slug === citySlug), [cities, citySlug]);
  const category = useMemo(
    () => categories?.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );

  const { data, isLoading, isError } = useCompaniesListQuery(
    city && category ? { cityId: city.id, categoryId: category.id } : {},
  );
  const { needsCompanyRegistration, canPublishCompanyProfile, cabinetRoute } = usePublicAuthCta();

  const metaLoading = citiesLoading || categoriesLoading;
  const notFound = !metaLoading && (!city || !category);

  const cityName = city ? getTranslatedCityName(t, city) : '';
  const categoryName = category ? getTranslatedCategoryName(t, category) : '';
  const tvars = { category: categoryName, city: cityName };

  const items = data?.items ?? [];
  const showCount = !isLoading && !isError && items.length > 0;
  const isEmpty = !isLoading && !isError && items.length === 0;

  if (metaLoading) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <div className="public-page-header border-b border-gray-200 pb-8 mb-8">
          <div className="h-7 w-64 bg-gray-100 animate-pulse" />
        </div>
        <LoadingStatus label={t('cabinet.common.loading')} className={GRID_CLASS}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCompanyCard key={i} />
          ))}
        </LoadingStatus>
      </div>
    );
  }

  if (notFound) {
    return (
      <>
        <SEOHead title={t('companies.seo.title')} noindex />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center bg-violet-50 text-violet-600">
            <BuildingsIcon className="size-6" weight="light" />
          </span>
          <p className="text-sm font-medium text-gray-700">{t('companies.catalog.notFound')}</p>
          <Link
            to={lp('/companies')}
            className="mt-5 inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-black px-5 py-2.5"
          >
            {t('companies.catalog.backToCatalog')}
          </Link>
        </div>
      </>
    );
  }

  const canonicalPath = lp(`/companies/${citySlug}/${categorySlug}`);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('companies.catalog.breadcrumbCatalog'),
        item: `${SITE_URL}${lp('/companies')}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${categoryName} — ${cityName}`,
        item: `${SITE_URL}${canonicalPath}`,
      },
    ],
  };

  const otherCategories =
    categories?.filter((c) => c.slug !== categorySlug).slice(0, RELATED_LIMIT) ?? [];
  const otherCities =
    cities?.filter((c) => c.slug !== citySlug).slice(0, RELATED_LIMIT) ?? [];

  return (
    <>
      <SEOHead
        title={t('companies.catalog.seoTitle', tvars)}
        description={t('companies.catalog.seoDescription', tvars)}
        keywords={t('companies.catalog.seoKeywords', tvars)}
        hreflang
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
        {/* Header */}
        <section className="public-page-header border-b border-gray-200 pb-8 mb-8">
          <nav className="text-xs text-gray-400 mb-3">
            <Link to={lp('/companies')} className="hover:text-violet-600">
              {t('companies.catalog.breadcrumbCatalog')}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-600">{cityName}</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
                {t('companies.catalog.badge', tvars)}
              </p>
              <h1 className="public-page-header__title text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {t('companies.catalog.h1', tvars)}
              </h1>
            </div>
            {showCount ? (
              <p className="text-sm text-gray-500 shrink-0">
                <span className="font-black text-gray-900">{items.length}</span>{' '}
                {items.length === 1 ? t('companies.countOne') : t('companies.countMany')}
              </p>
            ) : null}
          </div>
          <p className="mt-4 max-w-2xl text-sm text-gray-500 leading-relaxed">
            {t('companies.catalog.intro', tvars)}
          </p>
        </section>

        {/* Companies */}
        {isLoading ? (
          <LoadingStatus label={t('cabinet.common.loading')} className={GRID_CLASS}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCompanyCard key={i} />
            ))}
          </LoadingStatus>
        ) : isError ? (
          <div className="border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
            {t('companies.loadError')}
          </div>
        ) : isEmpty ? (
          <div className="border border-gray-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center bg-violet-50 text-violet-600">
              <BuildingsIcon className="size-6" weight="light" />
            </span>
            <p className="text-sm font-medium text-gray-700">{t('companies.catalog.empty', tvars)}</p>
            {needsCompanyRegistration || canPublishCompanyProfile ? (
              <Link
                to={needsCompanyRegistration ? '/company/profile' : cabinetRoute}
                className="mt-5 inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-black px-5 py-2.5"
              >
                {needsCompanyRegistration
                  ? t('companies.emptyCtaGuest')
                  : t('companies.emptyCtaAuthed')}
              </Link>
            ) : null}
          </div>
        ) : (
          <div className={GRID_CLASS}>
            {items.map((company) => (
              <div key={company.id} className="h-full">
                <CompanyCard company={company} />
              </div>
            ))}
          </div>
        )}

        {/* Interlinking — other categories in this city */}
        {otherCategories.length > 0 ? (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4">
              {t('companies.catalog.otherCategoriesInCity', tvars)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCategories.map((c) => (
                <Link
                  key={c.id}
                  to={lp(`/companies/${citySlug}/${c.slug}`)}
                  className="border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
                >
                  {getTranslatedCategoryName(t, c)}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Interlinking — same category in other cities */}
        {otherCities.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4">
              {t('companies.catalog.sameCategoryOtherCities', tvars)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.id}
                  to={lp(`/companies/${c.slug}/${categorySlug}`)}
                  className="border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
                >
                  {getTranslatedCityName(t, c)}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Full catalog link */}
        <div className="mt-10">
          <Link
            to={lp('/companies')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-800"
          >
            {t('companies.catalog.allCompanies')}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
