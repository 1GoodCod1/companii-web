import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { BuildingsIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { CompanyCard } from '@/entities/company/ui/CompanyCard';
import { PublicPageHeader } from '@/shared/ui/PublicPageHeader';
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

  return (
    <>
      <SEOHead
        title={t('companies.seo.title')}
        description={t('companies.seo.description')}
        keywords={t('companies.seo.keywords')}
        hreflang
      />

      <div className="max-w-5xl mx-auto space-y-6 pb-8 animate-fade-in">
        <PublicPageHeader badge={t('companies.hero.badge')} title={t('companies.hero.title')} />

        <section className="border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('companies.searchPlaceholder')}
                aria-label={t('companies.searchPlaceholder')}
                className={`${cabinetFieldClass} pl-10 border-slate-200 bg-white focus:border-violet-400`}
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
          <div className="border border-slate-200 bg-white px-6 py-12 text-center">
            <BuildingsIcon className="size-8 text-slate-300 mx-auto mb-4" weight="light" />
            <p className="text-sm font-medium text-slate-700">
              {isEmptyCatalog ? t('companies.emptyNone') : t('companies.emptyFiltered')}
            </p>
            {isEmptyCatalog && (needsCompanyRegistration || canPublishCompanyProfile) ? (
              <div className="mt-5">
                <Link
                  to={needsCompanyRegistration ? '/company/profile' : cabinetRoute}
                  className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5"
                >
                  {needsCompanyRegistration
                    ? t('companies.emptyCtaGuest')
                    : t('companies.emptyCtaAuthed')}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {filtered.length}{' '}
              {filtered.length === 1 ? t('companies.countOne') : t('companies.countMany')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {filtered.map((company) => (
                <div key={company.id} className="h-full">
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
