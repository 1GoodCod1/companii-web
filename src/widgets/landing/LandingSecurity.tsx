import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, KeyIcon, ClockCounterClockwiseIcon, DatabaseIcon } from '@phosphor-icons/react';

const SECURITY_ICONS = [ShieldCheckIcon, KeyIcon, ClockCounterClockwiseIcon, DatabaseIcon] as const;

type SecurityItem = { title: string; text: string };

export function LandingSecurity() {
  const { t } = useTranslation();
  const items = t('landing.security.items', { returnObjects: true }) as SecurityItem[];

  return (
    <section className="py-24 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <m.div
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
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item, index) => {
            const Icon = SECURITY_ICONS[index] ?? ShieldCheckIcon;
            return (
              <m.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="rounded-none border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-none bg-violet-500/[0.08] text-violet-600 mb-4">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
