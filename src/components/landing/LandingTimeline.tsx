import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, ClipboardCheck, FileSpreadsheet, Users, Wrench } from 'lucide-react';

const STEP_ICONS = [Building2, Users, Wrench, FileSpreadsheet, ClipboardCheck] as const;
const STEP_TONES = [
  'border-violet-200 bg-violet-50/50 text-violet-700',
  'border-indigo-200 bg-indigo-50/50 text-indigo-700',
  'border-amber-200 bg-amber-50/50 text-amber-700',
  'border-blue-200 bg-blue-50/50 text-blue-700',
  'border-emerald-200 bg-emerald-50/50 text-emerald-700',
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LandingTimeline() {
  const { t } = useTranslation();
  const steps = t('landing.timeline.steps', { returnObjects: true }) as Array<{
    step: string;
    title: string;
    description: string;
  }>;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            {t('landing.timeline.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            {t('landing.timeline.title')}{' '}
            <span className="landing-shimmer-text">{t('landing.timeline.titleHighlight')}</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base leading-relaxed">
            {t('landing.timeline.description')}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative"
        >
          <div className="absolute left-[1.65rem] top-4 bottom-4 w-px bg-gradient-to-b from-violet-300 via-indigo-200 to-emerald-300 hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Building2;
              const tone = STEP_TONES[index] ?? STEP_TONES[0];

              return (
                <motion.article
                  key={step.step}
                  variants={item}
                  className="relative md:pl-16"
                >
                  <div
                    className={`hidden md:flex absolute left-0 top-5 h-14 w-14 items-center justify-center rounded-2xl border-2 ${tone} shadow-sm`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="rounded-3xl glass-panel p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 md:hidden">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-300">{step.step}</span>
                      </div>
                      <span className="hidden md:inline text-xs font-bold text-gray-300">{step.step}</span>
                      <h3 className="text-lg font-bold text-gray-900 w-full md:w-auto">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{step.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
