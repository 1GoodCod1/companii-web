import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { LandingHeroMock } from '@/components/landing/LandingHeroMock';
import { LandingFinanceMock } from '@/components/landing/LandingFinanceMock';
import { LandingTimeline } from '@/components/landing/LandingTimeline';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingCta } from '@/components/landing/LandingCta';

const stats = [
  { value: '5', label: 'module FSM integrate' },
  { value: '10 min', label: 'setup inițial' },
  { value: '0 MDL', label: 'plan Free permanent' },
  { value: '100%', label: 'cloud, fără instalare' },
];

export function LandingPage() {
  const { primaryCta } = usePublicAuthCta();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);

  return (
    <>
      <SEOHead
        title="CRM & FSM pentru companii de servicii din Moldova"
        description="Echipă, clienți, lucrări, oferte și facturi într-un singur loc. CRM complet pentru field service — fără haos în WhatsApp."
        keywords="CRM Moldova, FSM, field service, gestionare companie, facturare, oferte, lucrări"
      />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-8 pb-16 sm:pb-24"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-br from-violet-400/20 via-indigo-300/10 to-fuchsia-400/15 blur-3xl landing-glow" />
          <div className="absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
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
                CRM & Field Service Management
              </motion.span>

              <h1 className="font-black text-gray-900 tracking-tight leading-[1.05]">
                Tot business-ul tău de servicii,{' '}
                <span className="landing-shimmer-text">într-un singur panou</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl text-wrap:pretty">
                Calcul automat de smete, CRM clienți, calendar pe teren, dimensionare încăperi, oferte și facturi PDF cu diacritice românești — fără Excel și fără grupuri WhatsApp.
              </p>

              <p className="mt-4 text-sm text-gray-400 max-w-lg leading-relaxed">
                Faber Companii este platforma FSM creată pentru instalatori, electricieni, firme de
                curățenie și orice companie cu tehnicieni mobili din Republica Moldova.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl glass-panel px-7 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
                >
                  <PlayCircle className="h-4 w-4 text-violet-600" />
                  Vezi cum funcționează
                </Link>
              </div>
            </motion.div>

            <motion.div
              style={{ y: dashboardY, opacity: dashboardOpacity }}
              className="lg:mt-0 mt-4"
            >
              <LandingHeroMock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-100/80 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="text-center lg:text-left"
              >
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Control financiar
            </p>
            <h2 className="font-black text-gray-900 tracking-tight">
              Facturi, TVA și încasări — calculate automat
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Lucrarea finalizată devine factură cu un click. Vezi plățile, restanțele și raportul
              lunar fără Excel sau contabil separat pentru fiecare deviz.
            </p>
          </motion.div>

          <LandingFinanceMock />
        </div>
      </section>

      <LandingTimeline />
      <LandingFeatures />
      <LandingCta />
    </>
  );
}
