import { Link } from 'react-router-dom';
import { m, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, BuildingsIcon, PlayCircleIcon } from '@phosphor-icons/react';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth';
import { LandingHeroMock } from '@/widgets/landing/LandingHeroMock';
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
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);

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

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-8 pb-16 sm:pb-24 bg-white"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[8%] right-[-8%] size-[520px] rounded-full bg-violet-400/[0.09] blur-[100px] lg:top-[12%] lg:right-[2%]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <m.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 mb-6"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-violet-600" />
                </span>
                {t('landing.hero.badge')}
              </m.span>

              <h1 className="font-black text-gray-900 tracking-tight leading-[1.05]">
                {t('landing.hero.title')}{' '}
                <span className="landing-shimmer-text">{t('landing.hero.titleHighlight')}</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl text-wrap:pretty">
                {t('landing.hero.subtitle')}
              </p>

              <p className="mt-4 text-sm text-gray-400 max-w-lg leading-relaxed">
                {t('landing.hero.description')}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <Link
                  to={primaryCta.to}
                  className="inline-flex justify-center items-center gap-2 border border-transparent bg-gray-900 hover:bg-gray-800 px-5 py-3 text-sm font-black text-white transition-colors w-full sm:w-auto whitespace-nowrap"
                >
                  {primaryCta.label}
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  to={lp('/companies')}
                  className="inline-flex justify-center items-center gap-2 border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-black text-violet-800 transition-colors hover:bg-violet-100 w-full sm:w-auto whitespace-nowrap"
                >
                  <BuildingsIcon className="size-4" />
                  {t('landing.hero.browseCatalogLink')}
                </Link>
                <Link
                  to={lp('/how-it-works')}
                  className="inline-flex justify-center items-center gap-2 border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto whitespace-nowrap"
                >
                  <PlayCircleIcon className="size-4 text-violet-600" />
                  {t('landing.hero.howItWorksLink')}
                </Link>
              </div>
            </m.div>

            <m.div
              style={{ y: dashboardY, opacity: dashboardOpacity }}
              className="landing-perspective lg:mt-0 mt-4"
            >
              <LandingHeroMock />
            </m.div>
          </div>
        </div>
      </section>

      <LandingStats />
      <LandingCompaniesCatalog />

      {/* Product preview section */}
      <section className="py-24 sm:py-32 border-y border-gray-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
              {t('landing.finance.eyebrow')}
            </p>
            <h2 className="font-black text-gray-900 tracking-tight">
              {t('landing.finance.title')}
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {t('landing.finance.description')}
            </p>
          </m.div>

          <div className="landing-perspective">
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
