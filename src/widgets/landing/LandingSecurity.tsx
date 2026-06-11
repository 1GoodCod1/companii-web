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
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
              {t('landing.security.eyebrow')}
            </p>
            <h2 className="font-black text-gray-900 tracking-tight">
              {t('landing.security.title')}
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              {t('landing.security.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-200 border border-gray-200">
            {items.map((item, index) => {
              const Icon = SECURITY_ICONS[index] ?? ShieldCheckIcon;
              return (
                <div key={item.title} className="bg-white p-6 flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center bg-violet-50 text-violet-600">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
