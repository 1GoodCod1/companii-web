import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles, TrendingUp, Calendar, FileText, Users, DollarSign } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { FaberLogo } from '@/components/brand/FaberLogo';

export function AuthLayout() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();

  // Value Proposition Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      badge: 'FSM & CRM Экосистема',
      title: 'Вся операционная деятельность — на одном экране',
      description: 'Координируйте работу диспетчеров, сотрудников на выезде и клиентов. Faber Companii заменяет десятки разрозненных чатов в мессенджерах и Excel-таблиц единым профессиональным решением.',
    },
    {
      badge: 'Smart Deviz',
      title: 'Умные сметы и автоматические PDF-счета с НДС',
      description: 'Задавайте параметры помещений и диагностические чек-листы. Платформа мгновенно рассчитает количество материалов, трудозатраты и налоги, формируя официальный PDF с румынскими диакритиками за секунды.',
    },
    {
      badge: 'Портал Клиента',
      title: 'Полная прозрачность и лояльность ваших заказчиков',
      description: 'Клиенты одобряют сметы, видят live-статус выполнения работ и скачивают счета-фактуры в своем защищенном кабинете. Доверие клиентов — залог долгосрочного успеха компании.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(400px,_40%)_1fr] bg-[#fafbfc] font-sans selection:bg-violet-100 selection:text-violet-900 transition-colors duration-500 overflow-x-hidden">
      {/* LEFT COLUMN: AUTH FORMS & LOCALIZATION (LIGHT THEME - SHADES OF WHITE) */}
      <div className="flex flex-col justify-between w-full p-5 sm:p-8 lg:p-10 xl:p-12 bg-white border-r border-slate-100 shadow-xl lg:shadow-none z-10 overflow-y-auto min-h-screen relative">
        {/* Header bar */}
        <header className="flex justify-between items-center w-full mb-6 shrink-0">
          <Link
            to={lp('/')}
            className="inline-flex items-center gap-2 group text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-all duration-300"
          >
            <span className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 group-hover:-translate-x-1.5 transition-transform duration-300">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span className="hidden sm:inline font-semibold">{t('auth.registerPage.backToLogin', 'Pe pagina principală')}</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-100 text-[10px] font-black tracking-widest text-violet-650 bg-violet-50/20 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              SaaS Operational
            </span>
            <LanguageSwitcher />
          </div>
        </header>

        {/* Form Outlet */}
        <main className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto py-2">
          <div className="mb-4 sm:mb-5 mx-auto lg:mx-0">
            <FaberLogo size="md" />
          </div>

          <div className="w-full">
            <Outlet />
          </div>
        </main>

        {/* B2B Footer */}
        <footer className="mt-6 pt-4 border-t border-slate-100 shrink-0 text-center lg:text-left">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} Faber Companii.
          </p>
          <p className="text-[9px] text-slate-400 mt-1">
            Secured Enterprise Operational Platform · Republica Moldova
          </p>
        </footer>
      </div>

      {/* RIGHT COLUMN: LUXURY LIGHT SAAS PRESENTATION (SHADES OF WHITE & PASTEL SHIFTS) */}
      <div className="hidden lg:flex flex-1 relative bg-[#f8fafc] overflow-hidden flex-col justify-between p-12 xl:p-16 select-none transition-colors duration-500">
        
        {/* Soft fluid light-themed pastel radial blobs (shades of white with gentle ambient glows) */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-100/70 to-indigo-100/0 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-100/50 to-violet-100/0 blur-[110px] animate-pulse pointer-events-none" style={{ animationDuration: '14s' }} />
        <div className="absolute top-[30%] left-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-rose-50/50 to-transparent blur-[90px] pointer-events-none" />

        {/* Elegant top row indicators */}
        <div className="relative z-10 flex justify-between items-center text-slate-400 text-[9px] font-bold uppercase tracking-widest border-b border-slate-100 pb-4">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-spin-slow" />
            Интерфейс управления Faber Companii
          </span>
          <span>Enterprise Secure v0.1.0</span>
        </div>

        {/* ULTRA-PREMIUM MINI SAAS DASHBOARD MOCKUP (LIGHT MODE LUXURY CARD) */}
        <div className="relative z-10 w-full max-w-[800px] mx-auto py-6">
          <div className="rounded-[24px] border border-slate-200 bg-white/80 backdrop-blur-2xl shadow-[0_30px_70px_-15px_rgba(15,23,42,0.06)] overflow-hidden">
            {/* Window chrome header */}
            <div className="flex justify-between items-center px-6 py-3.5 border-b border-slate-100/80 bg-slate-50/50">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-450/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-450/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-450/70" />
              </div>
              <div className="px-4 py-1 rounded-lg bg-slate-100 border border-slate-200/50 text-[10px] font-medium text-slate-400 w-64 text-center truncate">
                companii.faber.md/company
              </div>
              <div className="w-10" />
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-[1fr_260px] gap-6 p-6">
              {/* Left Section: Live Field Operations Grid */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      График мастеров · Сегодня
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 animate-pulse">
                    Live Sync
                  </span>
                </div>

                {/* Translucent timeline blocks */}
                <div className="space-y-3">
                  {/* Master 1 */}
                  <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[9px] font-black text-white">AM</div>
                        <span className="text-[10px] font-extrabold text-slate-700">Andrei M. (Техник-Электрик)</span>
                      </div>
                      <span className="text-[8px] font-bold text-violet-700 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                        В пути
                      </span>
                    </div>
                    <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-[9.5px] font-bold text-violet-900">Диагностика щитовой B2B</p>
                        <p className="text-[8px] text-violet-700/80 mt-0.5">бул. Дечебал 82, Кишинёв</p>
                      </div>
                      <span className="text-[9px] font-extrabold text-violet-850">14:00 - 15:30</span>
                    </div>
                  </div>

                  {/* Master 2 */}
                  <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-black text-white">VC</div>
                        <span className="text-[10px] font-extrabold text-slate-700">Vlad C. (Слесарь-Сантехник)</span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        На объекте
                      </span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-[9.5px] font-bold text-emerald-900">Монтаж системы отопления</p>
                        <p className="text-[8px] text-emerald-700/80 mt-0.5">ул. Михай Витязул 12, Кишинёв</p>
                      </div>
                      <span className="text-[9px] font-extrabold text-emerald-850">09:00 - 18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Smart Estimate Widget */}
              <div className="border-l border-slate-100 pl-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Умная смета
                    </span>
                  </div>

                  {/* Pricing parameters display */}
                  <div className="space-y-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5">
                    <div className="flex justify-between text-[9px] text-slate-400 uppercase font-black tracking-widest">
                      <span>Позиция</span>
                      <span>Сумма</span>
                    </div>
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600">Монтаж котла (1 шт)</span>
                        <span className="font-bold text-slate-800">4,500 MDL</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600">Труба медная 15мм (20м)</span>
                        <span className="font-bold text-slate-800">3,900 MDL</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600">Фитинги & краны (комплект)</span>
                        <span className="font-bold text-slate-800">1,200 MDL</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Итого</span>
                      <span className="text-sm font-extrabold text-violet-600">9,600 MDL</span>
                    </div>
                  </div>
                </div>

                {/* Custom glowing CTA button in UI mock */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="w-full bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-750 hover:to-indigo-750 text-white rounded-xl py-2 px-3 text-[9px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 cursor-pointer">
                    <Check className="w-3 h-3" />
                    Экспорт в PDF сметы
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mini Stats footer */}
            <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Поступления</p>
                  <p className="text-xs font-black text-slate-800 mt-1">84,200 MDL</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Клиенты</p>
                  <p className="text-xs font-black text-slate-800 mt-1">142 компании</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Эффективность</p>
                  <p className="text-xs font-black text-slate-800 mt-1">98.4% SLA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HIGH-END CYCLING VALUE-PROPOSITION SLIDESHOW (LIGHT THEME - NO OVERLAP BUG) */}
        <div className="relative z-10 max-w-[620px] min-h-[160px] flex flex-col justify-end pt-10 border-t border-slate-100">
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
                  <span className="inline-flex max-w-fit items-center gap-1.5 px-3 py-1 rounded-full border border-violet-100 text-[9px] font-black tracking-widest text-violet-750 bg-violet-50 uppercase mb-1">
                    {slide.badge}
                  </span>
                  <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
                    {slide.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2.5 mt-4 relative z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === slideIndex ? 'w-6 bg-violet-600' : 'w-1.5 bg-slate-200 hover:bg-slate-350'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
