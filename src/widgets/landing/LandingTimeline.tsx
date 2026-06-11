import { useTranslation } from 'react-i18next';
import { BuildingsIcon, ClipboardTextIcon, FileXlsIcon, UsersIcon, WrenchIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const STEP_ICONS = [BuildingsIcon, UsersIcon, WrenchIcon, FileXlsIcon, ClipboardTextIcon] as const;
const STEP_TONES = [
  'bg-violet-50 text-violet-700',
  'bg-indigo-100 text-indigo-700',
  'bg-amber-50 text-amber-700',
  'bg-blue-50 text-blue-700',
  'bg-emerald-50 text-emerald-700',
] as const;

export function LandingTimeline() {
  const { t } = useTranslation();
  const steps = t('landing.timeline.steps', { returnObjects: true }) as Array<{
    step: string;
    title: string;
    description: string;
  }>;

  return (
    <section className="py-24 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
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
        </div>

        <div className="border-t border-gray-200">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? BuildingsIcon;
            const tone = STEP_TONES[index] ?? STEP_TONES[0];

            return (
              <article
                key={step.step}
                className="group grid grid-cols-[72px_1fr] sm:grid-cols-[110px_1fr_44px] lg:grid-cols-[130px_1fr_1.2fr_44px] gap-x-5 sm:gap-x-8 items-center border-b border-gray-200 px-2 sm:px-5 py-7 sm:py-8 transition-colors hover:bg-slate-50/70"
              >
                <span
                  aria-hidden
                  className="font-display text-4xl sm:text-6xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#d1d5db] group-hover:[-webkit-text-stroke:1.5px_#c2593f]"
                >
                  {step.step}
                </span>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed lg:hidden">
                    {step.description}
                  </p>
                </div>

                <p className="hidden lg:block text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>

                <span
                  className={cn(
                    'hidden sm:flex size-11 shrink-0 items-center justify-center',
                    tone,
                  )}
                >
                  <Icon className="size-5" />
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
