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

/** Blueprint-style artwork for the featured card: client → schedule → job → paid invoice. */
function FeaturedArtwork() {
  return (
    <svg
      viewBox="0 0 400 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="lf-flow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#e1977e" />
          <stop offset="1" stopColor="#dfa135" />
        </linearGradient>
        <radialGradient id="lf-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d27357" stopOpacity="0.22" />
          <stop offset="1" stopColor="#d27357" stopOpacity="0" />
        </radialGradient>
        <pattern id="lf-dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" opacity="0.05" />
        </pattern>
      </defs>

      <rect width="400" height="460" fill="url(#lf-dots)" />
      <circle cx="320" cy="110" r="170" fill="url(#lf-glow)" />

      {/* flow path */}
      <path
        d="M52 388 C130 360 130 290 196 262 C268 230 250 160 332 116"
        fill="none"
        stroke="url(#lf-flow)"
        strokeWidth="1.5"
        strokeDasharray="5 7"
        opacity="0.85"
      />

      {/* node: client */}
      <circle cx="52" cy="388" r="14" fill="none" stroke="#ffffff" strokeOpacity="0.14" />
      <circle cx="52" cy="388" r="4" fill="url(#lf-flow)" />

      {/* node: schedule + ui card */}
      <circle cx="196" cy="262" r="14" fill="none" stroke="#ffffff" strokeOpacity="0.14" />
      <circle cx="196" cy="262" r="4" fill="url(#lf-flow)" />
      <rect x="222" y="276" width="84" height="42" fill="none" stroke="#ffffff" strokeOpacity="0.12" />
      <line x1="232" y1="290" x2="284" y2="290" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" />
      <line x1="232" y1="302" x2="266" y2="302" stroke="#e1977e" strokeOpacity="0.5" strokeWidth="3" />

      {/* node: job in progress */}
      <circle cx="120" cy="320" r="3" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="262" cy="196" r="3" fill="#ffffff" fillOpacity="0.25" />

      {/* node: paid invoice with check */}
      <circle cx="332" cy="116" r="20" fill="none" stroke="url(#lf-flow)" strokeWidth="1.5" />
      <circle cx="332" cy="116" r="34" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
      <circle cx="332" cy="116" r="48" fill="none" stroke="#ffffff" strokeOpacity="0.04" />
      <path
        d="M323 116 l6 7 l13 -14"
        fill="none"
        stroke="url(#lf-flow)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* invoice ui card */}
      <rect x="64" y="120" width="92" height="58" fill="none" stroke="#ffffff" strokeOpacity="0.1" />
      <line x1="76" y1="138" x2="144" y2="138" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="3" />
      <line x1="76" y1="152" x2="120" y2="152" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="3" />
      <line x1="76" y1="164" x2="104" y2="164" stroke="#dfa135" strokeOpacity="0.55" strokeWidth="3" />

      {/* plus marks */}
      <path d="M310 250 h12 M316 244 v12" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d="M90 240 h10 M95 235 v10" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" />
      <path d="M226 90 h10 M231 85 v10" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" />
    </svg>
  );
}

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
          {/* Featured: dark cover card */}
          <article className="relative overflow-hidden bg-gray-900 p-8 sm:p-10 flex flex-col justify-between min-h-[340px]">
            <FeaturedArtwork />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

            <span className="relative flex size-12 items-center justify-center bg-white/10 text-violet-400">
              <FeaturedIcon className="size-6" />
            </span>
            <div className="relative mt-12">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight text-balance">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">{featured.text}</p>
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
