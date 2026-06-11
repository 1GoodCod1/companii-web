import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { BuildingsIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { CompanyCard } from '@/entities/company/ui/CompanyCard';
import {
  useCategoriesQuery,
  useCitiesQuery,
  useCompaniesListQuery,
} from '@/features/companies/api/useCompanies';
import type { CatalogOptionDto } from '@/entities/company/model/companies.types';
import { usePublicAuthCta } from '@/features/auth';
import { AppSelect, SkeletonCompanyCard, cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';
import {
  getCatalogSearchText,
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/shared/utils/translateCityCategory';

export function CompaniesListPage() {
  const { t } = useTranslation();
  const [cityId, setCityId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const filters = useMemo(
    () => ({
      cityId: cityId || undefined,
      categoryId: categoryId || undefined,
    }),
    [cityId, categoryId],
  );

  const { data, isLoading, isError } = useCompaniesListQuery(filters);
  const { data: cities } = useCitiesQuery();
  const { data: categories } = useCategoriesQuery();
  const { needsCompanyRegistration, canPublishCompanyProfile, cabinetRoute } = usePublicAuthCta();

  const items = data?.items ?? [];

  const filtered = items.filter((company) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      company.name.toLowerCase().includes(q) ||
      company.description?.toLowerCase().includes(q) ||
      getCatalogSearchText(t, company.category, 'category').includes(q) ||
      getCatalogSearchText(t, company.city, 'city').includes(q)
    );
  });

  const cityOptions = useMemo(
    () => [
      { value: '', label: t('companies.allCities') },
      ...(cities?.map((city: CatalogOptionDto) => ({
        value: city.id,
        label: getTranslatedCityName(t, city),
      })) ?? []),
    ],
    [cities, t],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('companies.allCategories') },
      ...(categories?.map((cat: CatalogOptionDto) => ({
        value: cat.id,
        label: getTranslatedCategoryName(t, cat),
      })) ?? []),
    ],
    [categories, t],
  );

  const isEmptyCatalog = !isLoading && !isError && items.length === 0;
  const isEmptyFiltered = !isLoading && !isError && items.length > 0 && filtered.length === 0;
  const showCount = !isLoading && !isError && filtered.length > 0;

  return (
    <>
      <SEOHead
        title={t('companies.seo.title')}
        description={t('companies.seo.description')}
        keywords={t('companies.seo.keywords')}
        hreflang
      />

      <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
        {/* Editorial header */}
        <section className="public-page-header border-b border-gray-200 pb-8 mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
                {t('companies.hero.badge')}
              </p>
              <h1 className="public-page-header__title text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {t('companies.hero.title')}
              </h1>
            </div>
            {showCount ? (
              <p className="text-sm text-gray-500 shrink-0">
                <span className="font-black text-gray-900">{filtered.length}</span>{' '}
                {filtered.length === 1 ? t('companies.countOne') : t('companies.countMany')}
              </p>
            ) : null}
          </div>
        </section>

        {/* Filter toolbar */}
        <section className="border border-gray-200 bg-white p-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('companies.searchPlaceholder')}
                aria-label={t('companies.searchPlaceholder')}
                className={`${cabinetFieldClass} pl-10`}
              />
            </div>
            <AppSelect
              value={cityId}
              onChange={setCityId}
              options={cityOptions}
              aria-label={t('companies.allCities')}
              maxVisibleItems={5}
            />
            <AppSelect
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              aria-label={t('companies.allCategories')}
              maxVisibleItems={5}
            />
          </div>
        </section>

        {isLoading ? (
          <LoadingStatus
            label={t('cabinet.common.loading')}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCompanyCard key={i} />
            ))}
          </LoadingStatus>
        ) : isError ? (
          <div className="border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
            {t('companies.loadError')}
          </div>
        ) : isEmptyCatalog || isEmptyFiltered ? (
          <div className="border border-gray-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center bg-violet-50 text-violet-600">
              <BuildingsIcon className="size-6" weight="light" />
            </span>
            <p className="text-sm font-medium text-gray-700">
              {isEmptyCatalog ? t('companies.emptyNone') : t('companies.emptyFiltered')}
            </p>
            {isEmptyCatalog && (needsCompanyRegistration || canPublishCompanyProfile) ? (
              <div className="mt-5">
                <Link
                  to={needsCompanyRegistration ? '/company/profile' : cabinetRoute}
                  className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-black px-5 py-2.5"
                >
                  {needsCompanyRegistration
                    ? t('companies.emptyCtaGuest')
                    : t('companies.emptyCtaAuthed')}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {filtered.map((company) => (
              <div key={company.id} className="h-full">
                <CompanyCard company={company} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
