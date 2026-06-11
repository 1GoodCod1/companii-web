import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, BuildingsIcon, MapPinIcon, MagnifyingGlassIcon, StarIcon } from '@phosphor-icons/react';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { useCompaniesListQuery } from '@/features/companies/api/useCompanies';

export function LandingCompaniesCatalog() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const highlights = t('landing.catalog.highlights', { returnObjects: true }) as string[];

  const { data, isLoading } = useCompaniesListQuery({ limit: '3' });
  const companies = data?.items || [];

  return (
    <section className="py-24 sm:py-28 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left: header + highlights + CTA */}
          <div className="max-w-xl lg:max-w-none">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
              {t('landing.catalog.eyebrow')}
            </p>
            <h2 className="font-black text-gray-900 tracking-tight">
              {t('landing.catalog.title')}
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {t('landing.catalog.description')}
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-violet-50 text-[10px] font-black text-violet-700">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to={lp('/companies')}
                className="inline-flex items-center gap-2 bg-gray-900 px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-800 whitespace-nowrap"
              >
                <BuildingsIcon className="size-4" />
                {t('landing.catalog.cta')}
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Right: catalog preview */}
          <div className="relative w-full max-w-md lg:max-w-none mx-auto">
            <div className="border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-slate-50/60 px-4 py-3 text-xs text-gray-400 select-none">
                <MagnifyingGlassIcon className="size-4 text-gray-400" />
                <span>Căutare după oraș sau domeniu...</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                </div>
              ) : companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <BuildingsIcon className="size-10 text-gray-300 mb-3" />
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed font-semibold">
                    {t('landing.catalog.emptyState')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {companies.map((card) => (
                    <Link
                      key={card.id}
                      to={lp(`/companies/${card.slug}`)}
                      className="block bg-white p-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {card.logoUrl ? (
                          <img
                            src={card.logoUrl}
                            alt={card.name}
                            className="size-11 shrink-0 object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="flex size-11 shrink-0 items-center justify-center bg-gray-100 text-gray-600">
                            <BuildingsIcon className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-black text-gray-900">{card.name}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                              {Number(card.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-gray-600">
                            {card.category?.name || 'Servicii'}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                            <MapPinIcon className="size-3" />
                            {card.city?.name || 'Moldova'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <p className="border-t border-gray-100 bg-slate-50/60 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t('landing.catalog.previewHint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
