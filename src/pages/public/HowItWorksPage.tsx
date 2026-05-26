import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
import { SEOHead } from '@/components/seo/SEOHead';
import {
  Building2,
  ArrowRight,
  Calculator,
  CalendarDays,
  FileCheck,
  KeyRound,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';

const COMPANY_STEP_ICONS = [Building2, Calculator, CalendarDays, FileCheck] as const;
const CLIENT_STEP_ICONS = [KeyRound, Send, CheckCircle2, ShieldCheck] as const;
const STEP_CARD_TONES = [
  'border-slate-100',
  'border-slate-100',
  'border-slate-100',
  'border-slate-100',
] as const;
const STEP_ICON_TONES = [
  'bg-violet-50 text-violet-750',
  'bg-indigo-50 text-indigo-750',
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
] as const;
const STEP_NUMBER_TONES = [
  'text-violet-50 group-hover:text-violet-100/80',
  'text-indigo-50 group-hover:text-indigo-100/80',
  'text-amber-50 group-hover:text-amber-100/80',
  'text-emerald-50 group-hover:text-emerald-100/80',
] as const;

type HowItWorksStep = { title: string; description: string };

function RoleSteps({
  steps,
  icons,
}: {
  steps: HowItWorksStep[];
  icons: readonly (typeof COMPANY_STEP_ICONS)[number][];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {steps.map((step, index) => {
        const Icon = icons[index] ?? Building2;
        const stepNumber = String(index + 1).padStart(2, '0');

        return (
          <div
            key={step.title}
            className={`bg-white p-6 rounded-3xl border border-slate-100 ${STEP_CARD_TONES[index] ?? STEP_CARD_TONES[0]} relative flex flex-col justify-between group`}
          >
            <span
              className={`absolute top-4 right-6 font-black text-6xl select-none transition-colors ${STEP_NUMBER_TONES[index] ?? STEP_NUMBER_TONES[0]}`}
            >
              {stepNumber}
            </span>
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs ${STEP_ICON_TONES[index] ?? STEP_ICON_TONES[0]}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HowItWorksPage() {
  const { t } = useTranslation();
  const { isAuthed, primaryCta } = usePublicAuthCta();
  const [activeRole, setActiveRole] = useState<'company' | 'client'>('company');

  const companySteps = t('howItWorks.company.steps', { returnObjects: true }) as HowItWorksStep[];
  const clientSteps = t('howItWorks.client.steps', { returnObjects: true }) as HowItWorksStep[];

  const seoTitle = `${t('howItWorks.title')} ${t('howItWorks.titleHighlight')}`;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={t('howItWorks.subtitle')}
        hreflang
      />

      <div className="max-w-5xl mx-auto space-y-16 py-10 px-4 animate-fade-in">
        {/* Dynamic Background Elements */}
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header */}
        <section className="text-center space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-violet-750 bg-violet-50 border border-violet-100/80 px-4 py-2 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            {t('howItWorks.badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-900">
            {t('howItWorks.title')}{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {t('howItWorks.titleHighlight')}
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed text-wrap:pretty">
            {t('howItWorks.subtitle')}
          </p>
        </section>

        {/* Interactive Role Switcher Tab Section */}
        <section className="relative z-10 max-w-lg mx-auto bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 flex shadow-sm">
          <button
            id="btn-role-company"
            type="button"
            onClick={() => setActiveRole('company')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeRole === 'company'
                ? 'bg-white text-violet-750 shadow-md scale-102 border-b border-violet-100'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <Building2 className={`w-4 h-4 transition-colors ${activeRole === 'company' ? 'text-violet-650' : 'text-slate-450'}`} />
            {t('howItWorks.roles.company')}
          </button>
          <button
            id="btn-role-client"
            type="button"
            onClick={() => setActiveRole('client')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeRole === 'client'
                ? 'bg-white text-indigo-750 shadow-md scale-102 border-b border-indigo-100'
                : 'text-slate-550 hover:text-slate-850'
            }`}
          >
            <HeartHandshake className={`w-4 h-4 transition-colors ${activeRole === 'client' ? 'text-indigo-600' : 'text-slate-450'}`} />
            {t('howItWorks.roles.client')}
          </button>
        </section>

        {/* Content Area - Roles */}
        <section className="relative z-10">
          {activeRole === 'company' ? (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                  {t('howItWorks.company.title')}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                  {t('howItWorks.company.description')}
                </p>
              </div>

              <RoleSteps steps={companySteps} icons={COMPANY_STEP_ICONS} />
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                  {t('howItWorks.client.title')}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                  {t('howItWorks.client.description')}
                </p>
              </div>

              <RoleSteps steps={clientSteps} icons={CLIENT_STEP_ICONS} />
            </div>
          )}
        </section>

        {/* Trust banner */}
        <section className="relative z-10 bg-gradient-to-br from-violet-50/40 via-indigo-50/20 to-slate-50/30 p-8 rounded-3xl border border-violet-100/80 text-center max-w-2xl mx-auto space-y-6 glass-panel overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
            {isAuthed ? t('howItWorks.trust.titleAuthed') : t('howItWorks.trust.titleGuest')}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-semibold max-w-md mx-auto">
            {isAuthed
              ? t('howItWorks.trust.descriptionAuthed')
              : t('howItWorks.trust.descriptionGuest')}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to={primaryCta.to}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              {primaryCta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
