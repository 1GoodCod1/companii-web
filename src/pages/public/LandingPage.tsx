import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth/hooks/usePublicAuthCta';
import { LandingHeroMock } from '@/components/landing/LandingHeroMock';
import { LandingFinanceMock } from '@/components/landing/LandingFinanceMock';
import { LandingStats } from '@/components/landing/LandingStats';
import { LandingTimeline } from '@/components/landing/LandingTimeline';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingSecurity } from '@/components/landing/LandingSecurity';
import { LandingCta } from '@/components/landing/LandingCta';
import { FaberSplashScreen } from '@/components/brand/FaberSplashScreen';

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
        className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-8 pb-16 sm:pb-24"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[8%] right-[-8%] h-[520px] w-[520px] rounded-full bg-violet-400/[0.09] blur-[100px] lg:top-[12%] lg:right-[2%]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
                </span>
                {t('landing.hero.badge')}
              </motion.span>

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

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 px-7 py-3.5 text-sm font-black text-white transition-colors"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={lp('/how-it-works')}
                  className="inline-flex items-center gap-2 rounded-xl glass-panel px-7 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
                >
                  <PlayCircle className="h-4 w-4 text-violet-600" />
                  {t('landing.hero.howItWorksLink')}
                </Link>
              </div>
            </motion.div>

            <motion.div
              style={{ y: dashboardY, opacity: dashboardOpacity }}
              className="landing-perspective lg:mt-0 mt-4"
            >
              <LandingHeroMock />
            </motion.div>
          </div>
        </div>
      </section>

      <LandingStats />

      {/* Product preview section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
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
          </motion.div>

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
