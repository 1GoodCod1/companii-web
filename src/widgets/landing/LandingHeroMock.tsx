import { useTranslation } from 'react-i18next';
import { ArrowUpRightIcon, SealCheckIcon, CalendarIcon, TrayIcon, LayoutIcon, ReceiptIcon, UsersIcon, WrenchIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV_ICONS = [LayoutIcon, UsersIcon, TrayIcon, WrenchIcon, CalendarIcon] as const;

const KPI_ACCENTS = [
  { iconClass: 'bg-blue-50 text-blue-600', hintClass: 'text-blue-600' },
  { iconClass: 'bg-amber-50 text-amber-600', hintClass: 'text-amber-600' },
  { iconClass: 'bg-violet-50 text-violet-600', hintClass: 'text-violet-600' },
  { iconClass: 'bg-emerald-50 text-emerald-600', hintClass: 'text-emerald-600' },
] as const;

const KPI_ICONS = [UsersIcon, WrenchIcon, ReceiptIcon, SealCheckIcon] as const;

const STATUS_TONES: Record<string, string> = {
  'În lucru': 'bg-blue-50 text-blue-700',
  'Programat': 'bg-violet-50 text-violet-700',
  'В работе': 'bg-blue-50 text-blue-700',
  'Запланировано': 'bg-violet-50 text-violet-700',
};

export function LandingHeroMock() {
  const { t } = useTranslation();
  const kpis = t('landingMocks.hero.kpis', { returnObjects: true }) as Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  const interventions = t('landingMocks.hero.interventions', { returnObjects: true }) as {
    title: string;
    viewAll: string;
    items: Array<{ number: string; type: string; client: string; status: string; time: string }>;
  };
  const leads = t('landingMocks.hero.leads', { returnObjects: true }) as {
    title: string;
    viewAll: string;
    items: Array<{ name: string; phone: string; service: string }>;
  };

  return (
    <div className="relative w-full">
      <div className="border border-gray-200 bg-white shadow-lg">
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-5 shrink-0 items-center justify-center bg-violet-600 text-[9px] font-black text-white">
              F
            </span>
            <span className="text-[10px] font-semibold text-gray-500 truncate">
              {t('landingMocks.hero.windowTitle')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="size-2 border border-gray-300" />
            <span className="size-2 border border-gray-300" />
            <span className="size-2 bg-gray-300" />
          </div>
        </div>

        {/* Navigation strip */}
        <div className="hidden sm:flex items-center gap-1 border-b border-gray-100 bg-slate-50/60 px-3 py-1.5">
          {NAV_ICONS.map((Icon, i) => (
            <span
              key={Icon.displayName}
              className={cn(
                'flex size-7 items-center justify-center',
                i === 0
                  ? 'border border-gray-200 bg-white text-violet-600'
                  : 'text-gray-400',
              )}
            >
              <Icon className="size-3.5" weight="light" />
            </span>
          ))}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* Greeting */}
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-600/80">
                {t('landingMocks.hero.eyebrow')}
              </p>
              <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight mt-0.5 truncate">
                {t('landingMocks.hero.greeting')}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
              {t('landingMocks.hero.planBadge')}
            </span>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100">
            {kpis.map((kpi, i) => {
              const accent = KPI_ACCENTS[i];
              const Icon = KPI_ICONS[i];
              return (
                <article key={kpi.label} className="bg-white p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-400 leading-tight">
                      {kpi.label}
                    </span>
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center',
                        accent.iconClass,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                  </div>
                  <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-gray-900">
                    {kpi.value}
                  </p>
                  <p className={cn('text-[9px] font-bold mt-0.5', accent.hintClass)}>{kpi.hint}</p>
                </article>
              );
            })}
          </div>

          {/* Lists */}
          <div className="grid sm:grid-cols-2 gap-3">
            <section className="border border-gray-100">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-slate-50/60 px-3 py-2">
                <p className="text-[11px] font-semibold text-gray-900">{interventions.title}</p>
                <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                  {interventions.viewAll}
                  <ArrowUpRightIcon className="size-2.5" />
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {interventions.items.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-800 truncate">{item.type}</p>
                      <p className="text-[9px] text-gray-500 truncate">{item.client}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 text-[8px] font-semibold',
                          STATUS_TONES[item.status] ?? 'bg-slate-100 text-gray-600',
                        )}
                      >
                        {item.status}
                      </span>
                      <p className="text-[8px] text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-gray-100">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-slate-50/60 px-3 py-2">
                <p className="text-[11px] font-semibold text-gray-900">{leads.title}</p>
                <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                  {leads.viewAll}
                  <ArrowUpRightIcon className="size-2.5" />
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {leads.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[9px] text-gray-500 truncate">{item.service}</p>
                    </div>
                    <span className="shrink-0 text-[8px] font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5">
                      {t('landingMocks.hero.newBadge') || 'Nou'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Static status callout */}
      <div className="absolute -right-2 sm:-right-5 bottom-10 hidden md:block border border-gray-200 border-l-4 border-l-emerald-500 bg-white px-3 py-2.5 shadow-md">
        <p className="text-[9px] text-gray-400">{t('landingMocks.hero.statusUpdated')}</p>
        <p className="text-[11px] font-bold text-emerald-600">{t('landingMocks.hero.statusExample')}</p>
      </div>
    </div>
  );
}
