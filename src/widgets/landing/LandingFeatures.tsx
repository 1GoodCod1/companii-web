import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  CalculatorIcon,
  GlobeIcon,
  DeviceMobileIcon,
  SparkleIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

type FeatureItem = { title: string; text: string };

type BentoCell = {
  icon: Icon;
  itemIndex: number;
  span: string;
  wide?: boolean;
};

const BENTO_LAYOUT: BentoCell[] = [
  { icon: UsersIcon, itemIndex: 0, span: 'sm:col-span-2 lg:col-span-2', wide: true },
  { icon: CalendarIcon, itemIndex: 1, span: 'lg:col-span-1' },
  { icon: DeviceMobileIcon, itemIndex: 3, span: 'lg:col-span-1' },
  { icon: CalculatorIcon, itemIndex: 2, span: 'lg:col-span-1' },
  { icon: GlobeIcon, itemIndex: 4, span: 'sm:col-span-2 lg:col-span-2', wide: true },
  { icon: SparkleIcon, itemIndex: 5, span: 'lg:col-span-1' },
];

function FeatureCard({
  icon: FeatureIcon,
  title,
  text,
  wide,
  index,
}: {
  icon: Icon;
  title: string;
  text: string;
  wide?: boolean;
  index: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={[
        'h-full rounded-none border border-gray-200 bg-white p-6 shadow-sm flex flex-col',
        wide ? 'lg:flex-row lg:items-start lg:gap-6' : '',
      ].join(' ')}
    >
      <div
        className={[
          'flex size-12 shrink-0 items-center justify-center rounded-none bg-violet-500/[0.08] text-violet-600 mb-4',
          wide ? 'lg:mb-0' : '',
        ].join(' ')}
      >
        <FeatureIcon className="size-6" />
      </div>
      <div className="min-w-0 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed flex-1">{text}</p>
      </div>
    </m.div>
  );
}

export function LandingFeatures() {
  const { t } = useTranslation();

  const items = t('landing.features.items', { returnObjects: true }) as FeatureItem[];

  if (!Array.isArray(items) || items.length < 6) return null;

  return (
    <section className="py-24 sm:py-28 border-y border-gray-100 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2593f] mb-3">
            {t('landing.features.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight text-3xl sm:text-4xl">
            {t('landing.features.title')}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base">
            {t('landing.features.description')}
          </p>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {BENTO_LAYOUT.map(({ icon, itemIndex, span, wide }, index) => {
            const item = items[itemIndex];
            return (
              <div key={item.title} className={`h-full ${span}`}>
                <FeatureCard
                  icon={icon}
                  title={item.title}
                  text={item.text}
                  wide={wide}
                  index={index}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
