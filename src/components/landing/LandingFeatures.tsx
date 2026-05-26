import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CalendarRange,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const FEATURE_ICONS = [
  UsersRound,
  CalendarRange,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Sparkles,
] as const;

export function LandingFeatures() {
  const { t } = useTranslation();
  const items = t('landing.features.items', { returnObjects: true }) as Array<{
    title: string;
    text: string;
  }>;

  return (
    <section className="py-24 sm:py-28 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Sparkles;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group rounded-3xl glass-panel p-6 shadow-premium hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
