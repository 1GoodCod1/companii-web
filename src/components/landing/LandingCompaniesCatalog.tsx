import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, MapPin, Search, Star } from 'lucide-react';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

export function LandingCompaniesCatalog() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const highlights = t('landing.catalog.highlights', { returnObjects: true }) as string[];
  const previewCards = t('landing.catalog.previewCards', { returnObjects: true }) as Array<{
    name: string;
    category: string;
    city: string;
    rating: string;
  }>;

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-violet-100/80 bg-gradient-to-br from-white via-violet-50/50 to-indigo-50/40 p-8 sm:p-10 lg:p-12 glass-panel"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
                {t('landing.catalog.eyebrow')}
              </p>
              <h2 className="font-black text-gray-900 tracking-tight text-balance">
                {t('landing.catalog.title')}
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                {t('landing.catalog.description')}
              </p>

              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Search className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to={lp('/companies')}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-800"
              >
                <Building2 className="h-4 w-4" />
                {t('landing.catalog.cta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="space-y-3">
                {previewCards.map((card, index) => (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-violet-500/5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-black text-gray-900">{card.name}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {card.rating}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-violet-700">{card.category}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {card.city}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t('landing.catalog.previewHint')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
