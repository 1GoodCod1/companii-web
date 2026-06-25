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
import { cn } from '@/lib/utils';

type FeatureItem = { title: string; text: string };

const FEATURE_ICONS: Icon[] = [
  UsersIcon,
  CalendarIcon,
  CalculatorIcon,
  DeviceMobileIcon,
  GlobeIcon,
  SparkleIcon,
];

export function LandingFeatures() {
  const { t } = useTranslation();

  const items = t('landing.features.items', { returnObjects: true }) as FeatureItem[];

  if (!Array.isArray(items) || items.length < 6) return null;

  const [featured, ...rest] = items;
  const FeaturedIcon = FEATURE_ICONS[0];

  return (
    <section className="py-24 sm:py-28 border-y border-gray-100 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            {t('landing.features.eyebrow')}
          </p>
          <h2 className="font-black text-gray-900 tracking-tight text-3xl sm:text-4xl">
            {t('landing.features.title')}
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base">
            {t('landing.features.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[2fr_3fr] gap-6 items-stretch">
          {/* Featured: dark cover card with a photo of someone working in the system */}
          <article className="relative overflow-hidden bg-gray-900 p-8 sm:p-10 flex flex-col justify-between min-h-[340px]">
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center [filter:saturate(0.95)]"
              style={{ backgroundImage: "url('/marketing/feature-working.webp')" }}
            />
            {/* Dark wash so the title and icon stay readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/85 to-gray-900/40" />

            <span className="relative flex size-12 items-center justify-center bg-white/10 text-violet-400 backdrop-blur-sm">
              <FeaturedIcon className="size-6" />
            </span>
            <div className="relative mt-12">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight text-balance">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">{featured.text}</p>
            </div>
          </article>

          {/* Rest: compact hairline cells */}
          <div className="grid sm:grid-cols-2 gap-px bg-gray-200 border border-gray-200">
            {rest.map((item, i) => {
              const FeatureIcon = FEATURE_ICONS[i + 1] ?? SparkleIcon;
              return (
                <div
                  key={item.title}
                  className={cn('bg-white p-6', i === rest.length - 1 && 'sm:col-span-2')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex size-9 shrink-0 items-center justify-center bg-violet-50 text-violet-600">
                      <FeatureIcon className="size-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
