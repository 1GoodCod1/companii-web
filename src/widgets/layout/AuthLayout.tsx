import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles, TrendingUp, Calendar, FileText, Users, DollarSign } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/ui/i18n/LanguageSwitcher';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { FaberLogo } from '@/shared/ui/brand/FaberLogo';

const SLIDE_COUNT = 3;

export function AuthLayout() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = useMemo(
    () =>
      Array.from({ length: SLIDE_COUNT }, (_, index) => ({
        badge: t(`auth.layout.slides.${index}.badge`),
        title: t(`auth.layout.slides.${index}.title`),
        description: t(`auth.layout.slides.${index}.description`),
      })),
    [t],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const m = (key: string) => t(`auth.layout.mockup.${key}`);

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(400px,_40%)_1fr] bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      <div className="flex flex-col justify-between w-full p-5 sm:p-8 lg:p-10 xl:p-12 bg-white border-r border-slate-200/80 z-10 overflow-y-auto min-h-screen relative">
        <header className="flex justify-between items-center w-full mb-6 shrink-0">
          <Link
            to={lp('/')}
            className="inline-flex items-center gap-2 group text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="p-2 border border-slate-200 rounded-lg bg-slate-50 group-hover:-translate-x-1 transition-transform duration-200">
              <ArrowLeft className="size-4" />
            </span>
            <span className="hidden sm:inline">{t('auth.layout.backToHome')}</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-100 text-xs font-medium text-violet-700 bg-violet-50/60">
              <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
              {t('auth.layout.saasBadge')}
            </span>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto py-2">
          <div className="mb-6 mx-auto lg:mx-0">
            <FaberLogo size="md" />
          </div>

          <div className="w-full">
            <Outlet />
          </div>
        </main>

        <footer className="mt-6 pt-4 border-t border-slate-100 shrink-0 text-center lg:text-left">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Faber
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('auth.layout.footerSecure')}
          </p>
        </footer>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-50 to-violet-50/30 overflow-hidden flex-col justify-between p-12 xl:p-16 select-none">
        <div className="absolute top-[-10%] right-[-10%] size-[600px] rounded-full bg-gradient-to-br from-violet-100/70 to-indigo-100/0 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[700px] rounded-full bg-gradient-to-tr from-indigo-100/50 to-violet-100/0 blur-[110px] pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center text-slate-500 text-xs font-medium border-b border-slate-200/80 pb-4">
          <span className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-violet-500" />
            {t('auth.layout.interfaceTitle')}
          </span>
          <span className="text-slate-400">{t('auth.layout.version')}</span>
        </div>

        <div className="relative z-10 w-full max-w-[800px] mx-auto py-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex gap-2">
                <span className="size-2.5 rounded-full bg-rose-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="px-4 py-1 rounded-md bg-slate-100 border border-slate-200/50 text-xs text-slate-500 w-64 text-center truncate">
                companii.faber.md/company
              </div>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-[1fr_260px] gap-6 p-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-violet-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      {m('scheduleTitle')}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {m('liveSync')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="border border-slate-100 bg-slate-50/40 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-violet-600 flex items-center justify-center text-[9px] font-bold text-white">AM</div>
                        <span className="text-xs font-semibold text-slate-700">{m('master1Name')}</span>
                      </div>
                      <span className="text-[10px] font-medium text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                        {m('master1Status')}
                      </span>
                    </div>
                    <div className="bg-violet-50/60 border border-violet-100 rounded-lg p-2.5 flex justify-between items-center gap-2">
                      <div>
                        <p className="text-xs font-medium text-violet-900">{m('master1Task')}</p>
                        <p className="text-[11px] text-violet-700/80 mt-0.5">{m('master1Address')}</p>
                      </div>
                      <span className="text-xs font-semibold text-violet-800 shrink-0">{m('master1Time')}</span>
                    </div>
                  </div>

                  <div className="border border-slate-100 bg-slate-50/40 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">VC</div>
                        <span className="text-xs font-semibold text-slate-700">{m('master2Name')}</span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {m('master2Status')}
                      </span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 flex justify-between items-center gap-2">
                      <div>
                        <p className="text-xs font-medium text-emerald-900">{m('master2Task')}</p>
                        <p className="text-[11px] text-emerald-700/80 mt-0.5">{m('master2Address')}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 shrink-0">{m('master2Time')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-slate-100 pl-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      {m('estimateTitle')}
                    </span>
                  </div>

                  <div className="space-y-2 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>{m('colItem')}</span>
                      <span>{m('colAmount')}</span>
                    </div>
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">{m('item1')}</span>
                        <span className="font-semibold text-slate-800">4,500 MDL</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">{m('item2')}</span>
                        <span className="font-semibold text-slate-800">3,900 MDL</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">{m('item3')}</span>
                        <span className="font-semibold text-slate-800">1,200 MDL</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-xs font-medium text-slate-500">{m('total')}</span>
                      <span className="text-sm font-bold text-violet-600">9,600 MDL</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="w-full bg-violet-600 text-white rounded-lg py-2 px-3 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <Check className="size-3" />
                    {m('exportPdf')}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                  <DollarSign className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">{m('statRevenue')}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{m('statRevenueValue')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">{m('statClients')}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{m('statClientsValue')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">{m('statEfficiency')}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{m('statEfficiencyValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-[620px] min-h-[160px] flex flex-col justify-end pt-10 border-t border-slate-200/80">
          <div className="relative w-full h-[120px]">
            {slides.map((slide, index) => {
              const isActive = index === slideIndex;
              return (
                <div
                  key={index}
                  className={`transition-all duration-700 w-full flex flex-col gap-1.5 ${
                    isActive
                      ? 'relative z-10 opacity-100 translate-y-0'
                      : 'absolute bottom-0 left-0 opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <span className="inline-flex max-w-fit items-center px-2.5 py-0.5 rounded-full border border-violet-100 text-xs font-medium text-violet-700 bg-violet-50">
                    {slide.badge}
                  </span>
                  <h2 className="text-xl xl:text-2xl font-semibold tracking-tight text-slate-900 leading-snug">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4 relative z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlideIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === slideIndex ? 'w-6 bg-violet-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
