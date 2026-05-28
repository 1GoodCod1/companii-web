import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, KeyRound, History, Database } from 'lucide-react';

const SECURITY_ICONS = [ShieldCheck, KeyRound, History, Database] as const;

type SecurityItem = { title: string; text: string };

export function LandingSecurity() {
  const { t } = useTranslation();
  const items = t('landing.security.items', { returnObjects: true }) as SecurityItem[];

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
            {t('landing.security.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            {t('landing.security.title')}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            {t('landing.security.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item, index) => {
            const Icon = SECURITY_ICONS[index] ?? ShieldCheck;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="rounded-3xl glass-panel p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
