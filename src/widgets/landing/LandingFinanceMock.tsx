import { useTranslation } from 'react-i18next';
import { ArrowUpRightIcon, CalendarIcon, DownloadIcon, FileTextIcon, LayoutIcon, ReceiptIcon, TrendUpIcon, UsersIcon, WrenchIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV_ICONS = [LayoutIcon, UsersIcon, WrenchIcon, FileTextIcon, ReceiptIcon, CalendarIcon] as const;
const ACTIVE_NAV_INDEX = 4;

const INVOICE_NUMBERS = ['FAC-2026-089', 'FAC-2026-088', 'FAC-2026-087'];
const INVOICE_AMOUNTS = ['4.850', '12.400', '2.100'];
const INVOICE_DATES = ['28 mai', '26 mai', '24 mai'];
const INVOICE_WORKS = ['LUC-1039', 'LUC-1042', 'LUC-1045'];
const STATUS_TONES = [
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
];
const BARS = [42, 68, 55, 82, 74, 91, 88];

const SUMMARY_ACCENTS = [
  { valueClass: 'text-gray-900', hintClass: 'text-emerald-600' },
  { valueClass: 'text-emerald-700', hintClass: 'text-gray-400' },
  { valueClass: 'text-amber-700', hintClass: 'text-gray-400' },
] as const;

export function LandingFinanceMock({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const invoices = t('landingMocks.finance.invoices', { returnObjects: true }) as Array<{
    client: string;
    status: string;
  }>;
  const summaryCards = t('landingMocks.finance.summaryCards', { returnObjects: true }) as Array<{
    label: string;
    value: string;
    hint: string;
  }>;

  return (
    <div className={cn('relative w-full', className)}>
      <div className="border border-gray-200 bg-white shadow-lg">
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-5 shrink-0 items-center justify-center bg-violet-600 text-[9px] font-black text-white">
              F
            </span>
            <span className="text-[10px] font-semibold text-gray-500 truncate">
              {t('landingMocks.finance.windowTitle')}
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
                i === ACTIVE_NAV_INDEX
                  ? 'border border-gray-200 bg-white text-violet-600'
                  : 'text-gray-400',
              )}
            >
              <Icon className="size-3.5" weight="light" />
            </span>
          ))}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* Page header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                {t('landingMocks.finance.pageTitle')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-sm">
                {t('landingMocks.finance.pageDescription')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="border border-gray-200 bg-white px-2 py-1 text-[9px] font-bold text-gray-600">
                {t('landingMocks.finance.filterAll')}
              </span>
              <span className="inline-flex items-center gap-1 border border-gray-200 bg-slate-50 px-2 py-1 text-[9px] font-semibold text-gray-600">
                <DownloadIcon className="size-3" />
                {t('landingMocks.finance.exportBtn')}
              </span>
              <span className="bg-gray-900 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                {t('landingMocks.finance.generateBtn')}
              </span>
            </div>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            {summaryCards.map((card, i) => {
              const accent = SUMMARY_ACCENTS[i];
              return (
                <article key={card.label} className="bg-white p-2.5 sm:p-3">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-400">
                    {card.label}
                  </p>
                  <p className={cn('mt-1.5 text-base sm:text-lg font-black tracking-tight', accent.valueClass)}>
                    {card.value}
                  </p>
                  <p className={cn('text-[9px] font-semibold mt-0.5 flex items-center gap-0.5', accent.hintClass)}>
                    {i === 0 ? <TrendUpIcon className="size-3 shrink-0" /> : null}
                    {card.hint}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Invoices table */}
          <section className="border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/60">
                    {(
                      t('landingMocks.finance.columns', { returnObjects: true }) as string[]
                    ).map((col) => (
                      <th
                        key={col}
                        className="px-2.5 py-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv, i) => (
                    <tr key={INVOICE_NUMBERS[i]}>
                      <td className="px-2.5 py-2">
                        <p className="text-[10px] font-bold text-gray-800">{INVOICE_NUMBERS[i]}</p>
                        <p className="text-[8px] font-semibold uppercase text-gray-400 mt-0.5">
                          {INVOICE_DATES[i]}
                        </p>
                      </td>
                      <td className="px-2.5 py-2">
                        <p className="text-[10px] font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {inv.client}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{INVOICE_WORKS[i]}</p>
                      </td>
                      <td className="px-2.5 py-2">
                        <p className="text-[10px] sm:text-xs font-black text-gray-950 whitespace-nowrap">
                          {INVOICE_AMOUNTS[i]} MDL
                        </p>
                      </td>
                      <td className="px-2.5 py-2">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide',
                            STATUS_TONES[i],
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Weekly chart */}
          <section className="border border-gray-100 p-3">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {t('landingMocks.finance.weeklyTitle')}
              </p>
              <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                {t('landingMocks.finance.viewAll')}
                <ArrowUpRightIcon className="size-2.5" />
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-16 sm:h-20">
              {BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-500/80"
                  style={{ height: `${h}%`, opacity: 0.45 + (h / 100) * 0.55 }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Static VAT callout */}
      <div className="absolute -right-2 sm:-right-5 top-16 hidden md:block border border-gray-200 border-l-4 border-l-emerald-500 bg-white px-3 py-2.5 shadow-md">
        <p className="text-[9px] text-gray-400">{t('landingMocks.finance.vatBadge')}</p>
        <p className="text-[11px] font-bold text-gray-800">{t('landingMocks.finance.vatValue')}</p>
      </div>
    </div>
  );
}
