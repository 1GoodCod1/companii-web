import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
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
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Centered Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            {t('landing.catalog.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            {t('landing.catalog.title')}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            {t('landing.catalog.description')}
          </p>
        </m.div>

        {/* Content Grid */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          {/* Left Column: highlights list + CTA button */}
          <m.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center max-w-xl lg:max-w-none"
          >
            <ul className="space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-none bg-gray-100 text-gray-500">
                    <MagnifyingGlassIcon className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to={lp('/companies')}
                className="inline-flex items-center gap-2 bg-gray-900 px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-800 rounded-none whitespace-nowrap"
              >
                <BuildingsIcon className="size-4" />
                {t('landing.catalog.cta')}
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </m.div>

          {/* Right Column: Mockup search box */}
          <m.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md lg:max-w-none mx-auto"
          >
            <div className="border border-gray-200 bg-gray-50/30 p-5 sm:p-6 rounded-none shadow-sm">
              {/* Search Bar Mockup */}
              <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400 mb-4 rounded-none select-none">
                <MagnifyingGlassIcon className="size-4 text-gray-400" />
                <span>Căutare după oraș sau domeniu...</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                </div>
              ) : companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BuildingsIcon className="size-10 text-gray-300 mb-3 animate-pulse" />
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed font-semibold">
                    {t('landing.catalog.emptyState')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((card, index) => (
                    <m.div
                      key={card.id}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                    >
                      <Link
                        to={lp(`/companies/${card.slug}`)}
                        className="block rounded-none border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-400 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          {card.logoUrl ? (
                            <img
                              src={card.logoUrl}
                              alt={card.name}
                              className="size-11 shrink-0 rounded-none object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-none bg-gray-100 text-gray-600">
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
                    </m.div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t('landing.catalog.previewHint')}
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
