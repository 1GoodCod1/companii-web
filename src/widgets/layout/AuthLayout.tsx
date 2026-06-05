import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, SparkleIcon } from '@phosphor-icons/react';
import { LanguageSwitcher } from '@/shared/ui/i18n/LanguageSwitcher';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { FaberLogo } from '@/shared/ui/brand/FaberLogo';
import { m } from 'framer-motion';

const SLIDE_COUNT = 3;
const CURRENT_YEAR = new Date().getFullYear();

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

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(400px,_40%)_1fr] bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      <div className="flex flex-col justify-between w-full p-5 sm:p-8 lg:p-10 xl:p-12 bg-white border-r border-slate-200/80 z-10 overflow-y-auto min-h-screen relative">
        <header className="flex justify-between items-center w-full mb-6 shrink-0">
          <Link
            to={lp('/')}
            className="inline-flex items-center gap-2 group text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="p-2 border border-slate-200 rounded-lg bg-slate-50 group-hover:-translate-x-1 transition-transform duration-200">
              <ArrowLeftIcon className="size-4" />
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
            © {CURRENT_YEAR} Faber
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
            <SparkleIcon className="size-3.5 text-violet-500" />
            {t('auth.layout.interfaceTitle')}
          </span>
          <span className="text-slate-400">{t('auth.layout.version')}</span>
        </div>

        <div className="relative z-10 w-full max-w-[760px] mx-auto py-4">
          <m.svg
            viewBox="0 0 800 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto select-none"
            initial="hidden"
            animate="visible"
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="auth-grid-large" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                <circle cx="20" cy="20" r="1" fill="#E2E8F0" />
              </pattern>
              
              {/* Glowing gradients */}
              <radialGradient id="glow-violet" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-emerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid backdrop */}
            <rect width="800" height="520" rx="16" fill="url(#auth-grid-large)" />
            <rect width="800" height="520" rx="16" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Colored ambient glows */}
            <circle cx="250" cy="260" r="300" fill="url(#glow-violet)" />
            <circle cx="600" cy="200" r="250" fill="url(#glow-emerald)" />

            {/* Section 1: CALENDAR & SCHEDULING (PLANIFICATOR CALENDAR) */}
            <g transform="translate(40, 30)">
              <rect width="360" height="230" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Header */}
              <rect width="360" height="40" rx="12" fill="#F8FAFC" />
              <circle cx="20" cy="20" r="4" fill="#8B5CF6" />
              <text x="32" y="24" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.scheduleTitle')}</text>
              <rect x="270" y="10" width="75" height="20" rx="4" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="1" />
              <text x="307" y="22" fill="#7C3AED" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">{t('auth.layout.mockup.synchronized')}</text>

              {/* Time grid headers */}
              <g transform="translate(90, 52)">
                <text x="0" y="12" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">09:00</text>
                <text x="80" y="12" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">12:00</text>
                <text x="160" y="12" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">15:00</text>
                <text x="240" y="12" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">18:00</text>
                
                {/* Vertical grid lines */}
                <line x1="0" y1="20" x2="0" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="80" y1="20" x2="80" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="160" y1="20" x2="160" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="240" y1="20" x2="240" y2="155" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 2" />
              </g>

              {/* Roster rows */}
              <g transform="translate(16, 75)">
                {/* Tech 1 Row */}
                <g transform="translate(0, 0)">
                  <circle cx="12" cy="18" r="12" fill="#8B5CF6" />
                  <text x="8" y="21" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AM</text>
                  <text x="30" y="16" fill="#1E293B" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Andrei M.</text>
                  <text x="30" y="27" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.tech1Role')}</text>
                  
                  {/* Task block 1 */}
                  <rect x="74" y="6" width="110" height="24" rx="6" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="1" />
                  <text x="84" y="20" fill="#5B21B6" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.tech1Task')}</text>
                </g>

                {/* Tech 2 Row */}
                <g transform="translate(0, 50)">
                  <circle cx="12" cy="18" r="12" fill="#10B981" />
                  <text x="8" y="21" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">VC</text>
                  <text x="30" y="16" fill="#1E293B" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Vlad C.</text>
                  <text x="30" y="27" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.tech2Role')}</text>
                  
                  {/* Task block 2 */}
                  <rect x="114" y="6" width="130" height="24" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
                  <text x="124" y="20" fill="#065F46" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.tech2Task')}</text>
                </g>

                {/* Tech 3 Row */}
                <g transform="translate(0, 100)">
                  <circle cx="12" cy="18" r="12" fill="#F59E0B" />
                  <text x="9" y="21" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">IP</text>
                  <text x="30" y="16" fill="#1E293B" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Igor P.</text>
                  <text x="30" y="27" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.tech3Role')}</text>
                  
                  {/* Task block 3 */}
                  <rect x="154" y="6" width="100" height="24" rx="6" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                  <text x="164" y="20" fill="#92400E" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.tech3Task')}</text>
                </g>
              </g>
            </g>

            {/* Section 2: CLIENT DATABASE (BAZĂ DE CLIENȚI) */}
            <g transform="translate(40, 280)">
              <rect width="360" height="210" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Header */}
              <rect width="360" height="40" rx="12" fill="#F8FAFC" />
              <circle cx="20" cy="20" r="4" fill="#10B981" />
              <text x="32" y="24" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.clientsTitle')}</text>
              <text x="340" y="24" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.clientsCount')}</text>

              {/* Roster database list */}
              <g transform="translate(16, 52)">
                {/* Client row 1 */}
                <g transform="translate(0, 0)">
                  <text x="0" y="16" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SC ProConstruct SRL</text>
                  <text x="0" y="28" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.client1Desc')}</text>
                  <rect x="250" y="4" width="80" height="18" rx="9" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
                  <text x="290" y="16" fill="#4F46E5" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">{t('auth.layout.mockup.client1Status')}</text>
                </g>
                <line x1="0" y1="38" x2="328" y2="38" stroke="#F1F5F9" strokeWidth="1" />

                {/* Client row 2 */}
                <g transform="translate(0, 48)">
                  <text x="0" y="16" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Elena Ciobanu</text>
                  <text x="0" y="28" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.client2Desc')}</text>
                  <rect x="250" y="4" width="80" height="18" rx="9" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
                  <text x="290" y="16" fill="#059669" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">{t('auth.layout.mockup.client2Status')}</text>
                </g>
                <line x1="0" y1="86" x2="328" y2="86" stroke="#F1F5F9" strokeWidth="1" />

                {/* Client row 3 */}
                <g transform="translate(0, 96)">
                  <text x="0" y="16" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Ion Popescu</text>
                  <text x="0" y="28" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.client3Desc')}</text>
                  <rect x="250" y="4" width="80" height="18" rx="9" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                  <text x="290" y="16" fill="#D97706" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">{t('auth.layout.mockup.client3Status')}</text>
                </g>
              </g>
            </g>

            {/* Section 3: CRM / PIPELINE LOGIC (RIGHT SIDE PANEL - CRM & INVOICES) */}
            <g transform="translate(430, 30)">
              <rect width="330" height="460" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Header */}
              <rect width="330" height="40" rx="12" fill="#F8FAFC" />
              <text x="16" y="24" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.workflowTitle')}</text>
              
              {/* Process Step 1: Customer Lead */}
              <g transform="translate(16, 55)">
                <rect width="298" height="68" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <rect x="12" y="12" width="8" height="8" rx="4" fill="#6366F1" />
                <text x="26" y="20" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step1Title')}</text>
                <text x="282" y="20" fill="#475569" fontSize="8" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.step1Source')}</text>
                
                <text x="26" y="38" fill="#475569" fontSize="9" fontWeight="medium" fontFamily="sans-serif">{t('auth.layout.mockup.step1Client')}</text>
                <text x="26" y="52" fill="#8B5CF6" fontSize="9" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step1Service')}</text>
              </g>

              {/* Arrow Connector 1 */}
              <path d="M 165 123 L 165 133" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

              {/* Process Step 2: Live Cost Estimate Document */}
              <g transform="translate(16, 137)">
                <rect width="298" height="152" rx="8" fill="#FFF" stroke="#E2E8F0" strokeWidth="1" />
                <rect x="12" y="12" width="8" height="8" rx="4" fill="#8B5CF6" />
                <text x="26" y="20" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step2Title')}</text>
                
                {/* Table representation */}
                <g transform="translate(12, 36)">
                  {/* Header Row */}
                  <text x="0" y="10" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step2ColItem')}</text>
                  <text x="274" y="10" fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.step2ColAmount')}</text>
                  <line x1="0" y1="16" x2="274" y2="16" stroke="#F1F5F9" strokeWidth="1" />

                  {/* Row 1 */}
                  <text x="0" y="28" fill="#475569" fontSize="9" fontFamily="sans-serif">{t('auth.layout.mockup.step2Item1')}</text>
                  <text x="274" y="28" fill="#1E293B" fontSize="9" fontWeight="semibold" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.step2Amount1')}</text>
                  
                  {/* Row 2 */}
                  <text x="0" y="42" fill="#475569" fontSize="9" fontFamily="sans-serif">{t('auth.layout.mockup.step2Item2')}</text>
                  <text x="274" y="42" fill="#1E293B" fontSize="9" fontWeight="semibold" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.step2Amount2')}</text>
                  
                  {/* Row 3 */}
                  <text x="0" y="56" fill="#475569" fontSize="9" fontFamily="sans-serif">{t('auth.layout.mockup.step2Item3')}</text>
                  <text x="274" y="56" fill="#1E293B" fontSize="9" fontWeight="semibold" fontFamily="sans-serif" textAnchor="end">{t('auth.layout.mockup.step2Amount3')}</text>

                  <line x1="0" y1="64" x2="274" y2="64" stroke="#E2E8F0" strokeWidth="1" />
                  
                  {/* Total and automatic VAT */}
                  <text x="0" y="78" fill="#64748B" fontSize="8" fontFamily="sans-serif">{t('auth.layout.mockup.step2Vat')}</text>
                  <text x="274" y="78" fill="#475569" fontSize="8" textAnchor="end" fontFamily="sans-serif">{t('auth.layout.mockup.step2VatIncluded')}</text>

                  <text x="0" y="94" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step2Total')}</text>
                  <text x="274" y="94" fill="#7C3AED" fontSize="11" fontWeight="extrabold" textAnchor="end" fontFamily="sans-serif">{t('auth.layout.mockup.step2TotalAmount')}</text>
                </g>
              </g>

              {/* Arrow Connector 2 */}
              <path d="M 165 289 L 165 299" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

              {/* Process Step 3: PDF Generation & Client Portal Success */}
              <g transform="translate(16, 303)">
                <rect width="298" height="68" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
                <rect x="12" y="12" width="8" height="8" rx="4" fill="#10B981" />
                <text x="26" y="20" fill="#065F46" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.step3Title')}</text>
                
                <text x="26" y="38" fill="#047857" fontSize="9" fontWeight="semibold" fontFamily="sans-serif">{t('auth.layout.mockup.step3Status1')}</text>
                <text x="26" y="52" fill="#065F46" fontSize="9" fontWeight="medium" fontFamily="sans-serif">{t('auth.layout.mockup.step3Status2')}</text>
              </g>

              {/* Financial growth stats at the very bottom of CRM flow */}
              <g transform="translate(16, 386)">
                <rect width="298" height="58" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                
                <g transform="translate(16, 12)">
                  <text x="0" y="12" fill="#64748B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.statEfficiencyTitle')}</text>
                  <text x="0" y="32" fill="#10B981" fontSize="16" fontWeight="extrabold" fontFamily="sans-serif">{t('auth.layout.mockup.statEfficiencyValue')}</text>
                </g>

                <g transform="translate(145, 12)">
                  <text x="0" y="12" fill="#64748B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">{t('auth.layout.mockup.statRevenueTitle')}</text>
                  <text x="0" y="32" fill="#1E293B" fontSize="15" fontWeight="extrabold" fontFamily="sans-serif">{t('auth.layout.mockup.statRevenueValue')}</text>
                </g>

                {/* Up-trend arrow */}
                <path d="M 268 28 L 274 22 L 278 26 L 284 20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          </m.svg>
        </div>

        <div className="relative z-10 max-w-[620px] min-h-[160px] flex flex-col justify-end pt-10 border-t border-slate-200/80">
          <div className="relative w-full h-[120px]">
            {slides.map((slide, index) => {
              const isActive = index === slideIndex;
              return (
                <div
                  key={slide.badge}
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
            {slides.map((slide, index) => (
              <button
                key={slide.badge}
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
