import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, CalculatorIcon, GlobeIcon, DeviceMobileIcon, SparkleIcon, UsersIcon } from '@phosphor-icons/react';

const FEATURE_ICONS = [
  UsersIcon,
  CalendarIcon,
  CalculatorIcon,
  DeviceMobileIcon,
  GlobeIcon,
  SparkleIcon,
] as const;

export function LandingFeatures() {
  const { t } = useTranslation();
  const items = t('landing.features.items', { returnObjects: true }) as Array<{
    title: string;
    text: string;
  }>;

  return (
    <section className="py-24 sm:py-28 border-y border-gray-100 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            {t('landing.features.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            {t('landing.features.title')}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            {t('landing.features.description')}
          </p>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? SparkleIcon;
            return (
              <m.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="rounded-none border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-none bg-violet-500/[0.08] text-violet-600 mb-4">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.text}</p>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
