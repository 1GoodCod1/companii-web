import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, BuildingsIcon, PlayCircleIcon } from '@phosphor-icons/react';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth';
import { LandingHeroMock } from '@/widgets/landing/LandingHeroMock';
import { DecorBackdrop } from '@/widgets/cabinet/DecorBackdrop';
import { LandingFinanceMock } from '@/widgets/landing/LandingFinanceMock';
import { LandingStats } from '@/widgets/landing/LandingStats';
import { LandingTimeline } from '@/widgets/landing/LandingTimeline';
import { LandingFeatures } from '@/widgets/landing/LandingFeatures';
import { LandingSecurity } from '@/widgets/landing/LandingSecurity';
import { LandingCta } from '@/widgets/landing/LandingCta';
import { LandingCompaniesCatalog } from '@/widgets/landing/LandingCompaniesCatalog';
import { FaberSplashScreen } from '@/shared/ui/brand/FaberSplashScreen';

export function LandingPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { primaryCta } = usePublicAuthCta();

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('faber_splash_played');
    }
    return true;
  });

  return (
    <>
      {showSplash && (
        <FaberSplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <SEOHead
        title={t('landing.seo.title')}
        description={t('landing.seo.description')}
        keywords={t('landing.seo.keywords')}
        hreflang
      />

      {/* Hero — editorial, full-width, mock below the copy */}
      <section className="relative bg-white border-b border-gray-100 overflow-hidden">
        <DecorBackdrop />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 mb-8">
            <span className="size-1.5 bg-violet-600" />
            {t('landing.hero.badge')}
          </span>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-end">
            <h1 className="font-black text-gray-900 tracking-tight leading-[1.05]">
              {t('landing.hero.title')}{' '}
              <span className="landing-shimmer-text">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <div className="lg:border-l lg:border-gray-200 lg:pl-8">
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed text-wrap:pretty">
                {t('landing.hero.subtitle')}
              </p>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                {t('landing.hero.description')}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <Link
              to={primaryCta.to}
              className="inline-flex justify-center items-center gap-2 border border-transparent bg-gray-900 hover:bg-gray-800 px-6 py-3 text-sm font-black text-white transition-colors w-full sm:w-auto whitespace-nowrap"
            >
              {primaryCta.label}
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to={lp('/companies')}
              className="inline-flex justify-center items-center gap-2 border border-violet-200 bg-violet-50 px-6 py-3 text-sm font-black text-violet-800 transition-colors hover:bg-violet-100 w-full sm:w-auto whitespace-nowrap"
            >
              <BuildingsIcon className="size-4" />
              {t('landing.hero.browseCatalogLink')}
            </Link>
            <Link
              to={lp('/how-it-works')}
              className="inline-flex justify-center items-center gap-2 border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto whitespace-nowrap"
            >
              <PlayCircleIcon className="size-4 text-violet-600" />
              {t('landing.hero.howItWorksLink')}
            </Link>
          </div>

          <div className="mt-14 sm:mt-16 max-w-5xl mx-auto">
            <LandingHeroMock />
          </div>
        </div>
      </section>

      <LandingStats />
      <LandingCompaniesCatalog />

      {/* Product preview — split layout: copy left, mock right */}
      <section className="py-24 sm:py-28 border-y border-gray-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
                {t('landing.finance.eyebrow')}
              </p>
              <h2 className="font-black text-gray-900 tracking-tight">
                {t('landing.finance.title')}
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                {t('landing.finance.description')}
              </p>
            </div>

            <LandingFinanceMock />
          </div>
        </div>
      </section>

      <LandingTimeline />
      <LandingFeatures />
      <LandingSecurity />
      <LandingCta />
    </>
  );
}
