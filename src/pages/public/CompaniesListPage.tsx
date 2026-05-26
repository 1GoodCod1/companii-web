import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { Building2, Search } from 'lucide-react';
import { CompanyCard } from '@/components/public/CompanyCard';
import {
  useCategoriesQuery,
  useCitiesQuery,
  useCompaniesListQuery,
} from '@/features/companies/api/useCompanies';
import type { CatalogOptionDto } from '@/types/companies';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { cabinetFieldClass } from '@/components/cabinet/cabinet-ui';
import {
  getCatalogSearchText,
  getTranslatedCategoryName,
  getTranslatedCityName,
} from '@/utils/translateCityCategory';

export function CompaniesListPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
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
  const { isAuthed, cabinetRoute, cabinetLabel } = usePublicAuthCta();

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

  return (
    <>
      <SEOHead
        title={t('companies.seo.title')}
        description={t('companies.seo.description')}
        keywords={t('companies.seo.keywords')}
        hreflang
      />

      <div className="space-y-8 animate-fade-in pb-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 p-6 sm:p-8 glass-panel">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-2">
              {t('companies.hero.eyebrow')}
            </p>
            <h1 className="font-black text-gray-900 tracking-tight">{t('companies.hero.title')}</h1>
            <p className="mt-3 text-gray-500 leading-relaxed">{t('companies.hero.description')}</p>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('companies.searchPlaceholder')}
                className={`${cabinetFieldClass} pl-10`}
              />
            </div>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={cabinetFieldClass}
            >
              <option value="">{t('companies.allCities')}</option>
              {cities?.map((city: CatalogOptionDto) => (
                <option key={city.id} value={city.id}>
                  {getTranslatedCityName(t, city)}
                </option>
              ))}
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cabinetFieldClass}
            >
              <option value="">{t('companies.allCategories')}</option>
              {categories?.map((cat: CatalogOptionDto) => (
                <option key={cat.id} value={cat.id}>
                  {getTranslatedCategoryName(t, cat)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-100/80 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {t('companies.loadError')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-slate-50/80 px-6 py-16 text-center">
            <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {items.length === 0 ? t('companies.emptyNone') : t('companies.emptyFiltered')}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {filtered.length}{' '}
              {filtered.length === 1 ? t('companies.countOne') : t('companies.countMany')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              {filtered.map((company, index) => (
                <motion.div
                  key={company.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <CompanyCard company={company} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!isLoading && items.length === 0 ? (
          <p className="text-center text-sm text-gray-400">
            {isAuthed ? (
              <>
                {t('companies.emptyHintAuthedPrefix')}{' '}
                <Link
                  to={cabinetRoute}
                  className="font-semibold text-violet-600 hover:text-violet-700"
                >
                  {cabinetLabel}
                </Link>
                .
              </>
            ) : (
              <>
                {t('companies.emptyHintGuestPrefix')}{' '}
                <Link
                  to={lp('/register')}
                  className="font-semibold text-violet-600 hover:text-violet-700"
                >
                  {t('companies.emptyHintGuestLink')}
                </Link>{' '}
                {t('companies.emptyHintGuestSuffix')}
              </>
            )}
          </p>
        ) : null}
      </div>
    </>
  );
}
