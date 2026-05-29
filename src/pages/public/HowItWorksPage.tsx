import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicAuthCta } from '@/features/auth/hooks/usePublicAuthCta';
import { SEOHead } from '@/components/seo/SEOHead';
import {
  Building2,
  ArrowRight,
  Calculator,
  CalendarDays,
  FileCheck,
  KeyRound,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  ArrowLeftRight,
} from 'lucide-react';

const COMPANY_STEP_ICONS = [Building2, Calculator, CalendarDays, FileCheck] as const;
const CLIENT_STEP_ICONS = [KeyRound, Send, CheckCircle2, ShieldCheck] as const;

type HowItWorksStep = { title: string; description: string };

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

      <div className="max-w-6xl mx-auto space-y-16 py-12 px-4 animate-fade-in">
        {/* Dynamic Background Glow Elements */}
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-violet-200/10 blur-3xl pointer-events-none" />
        <div className="absolute top-48 right-1/4 w-96 h-96 bg-indigo-200/10 blur-3xl pointer-events-none" />

        {/* Hero Header Section */}
        <section className="text-center space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-100/60 px-4 py-2 rounded-none">
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

        {/* ========================================================================= */}
        {/* 1. DESKTOP VIEW: Connected Side-by-Side Connected Pipeline Loop */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid grid-cols-11 gap-y-10 gap-x-6 relative items-center py-6">
          {/* Vertical central pipeline axis line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-violet-200/60 via-indigo-250/50 to-emerald-200/60 -translate-x-1/2 pointer-events-none" />

          {/* Connected Columns Headers */}
          <div className="col-span-11 grid grid-cols-11 gap-6 items-end pb-4 mb-2">
            <div className="col-span-5 text-right space-y-2 border-b border-violet-100/80 pb-3">
              <h2 className="text-base font-black text-violet-700 tracking-wider uppercase">
                {t('howItWorks.roles.company')}
              </h2>
              <p className="text-xs text-slate-400 font-semibold max-w-sm ml-auto">
                {t('howItWorks.company.title')}
              </p>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center self-center">
              <div className="p-2 bg-slate-100 text-slate-400 border border-slate-200/60">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <div className="col-span-5 text-left space-y-2 border-b border-indigo-100/80 pb-3">
              <h2 className="text-base font-black text-indigo-750 tracking-wider uppercase">
                {t('howItWorks.roles.client')}
              </h2>
              <p className="text-xs text-slate-400 font-semibold max-w-sm mr-auto">
                {t('howItWorks.client.title')}
              </p>
            </div>
          </div>

          {/* Loop through matching step pairs */}
          {Array.from({ length: 4 }).map((_, index) => {
            const CompanyIcon = COMPANY_STEP_ICONS[index] ?? Building2;
            const ClientIcon = CLIENT_STEP_ICONS[index] ?? KeyRound;
            const companyStep = companySteps[index] ?? { title: '', description: '' };
            const clientStep = clientSteps[index] ?? { title: '', description: '' };
            const stepNum = index + 1;

            return (
              <div key={index} className="col-span-11 grid grid-cols-11 gap-6 items-stretch relative">

                {/* LEFT: Provider Step Block */}
                <div className="col-span-5 bg-white/70 p-6 border border-slate-100/80 shadow-xs relative flex flex-col justify-between group hover:border-violet-250 hover:bg-white transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-violet-50 text-violet-750 w-10 h-10 flex items-center justify-center">
                        <CompanyIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                        {companyStep.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {companyStep.description}
                    </p>
                  </div>
                </div>

                {/* CENTER: Interactive Step Sync Connection Axis Node */}
                <div className="col-span-1 flex flex-col items-center justify-center relative z-10 self-center">
                  <div className="w-10 h-10 bg-slate-950 text-white font-mono font-bold text-sm flex items-center justify-center border-4 border-slate-50 shadow-sm">
                    0{stepNum}
                  </div>
                </div>

                {/* RIGHT: Client Step Block */}
                <div className="col-span-5 bg-white/70 p-6 border border-slate-100/80 shadow-xs relative flex flex-col justify-between group hover:border-indigo-250 hover:bg-white transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-750 w-10 h-10 flex items-center justify-center">
                        <ClientIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                        {clientStep.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {clientStep.description}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE VIEW: Simplified Responsive Layout with Square Switching Tabs */}
        {/* ========================================================================= */}
        <div className="lg:hidden space-y-8">

          {/* Square Responsive Roles Switcher */}
          <section className="relative z-10 max-w-sm mx-auto bg-slate-100 p-1 border border-slate-200 flex">
            <button
              id="btn-role-company-mob"
              type="button"
              onClick={() => setActiveRole('company')}
              className={`flex-1 py-3 px-4 rounded-none text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${activeRole === 'company'
                  ? 'bg-white text-violet-750 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Building2 className={`w-4 h-4 ${activeRole === 'company' ? 'text-violet-600' : 'text-slate-400'}`} />
              {t('howItWorks.roles.company')}
            </button>
            <button
              id="btn-role-client-mob"
              type="button"
              onClick={() => setActiveRole('client')}
              className={`flex-1 py-3 px-4 rounded-none text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${activeRole === 'client'
                  ? 'bg-white text-indigo-750 shadow-sm'
                  : 'text-slate-550 hover:text-slate-850'
                }`}
            >
              <HeartHandshake className={`w-4 h-4 ${activeRole === 'client' ? 'text-indigo-650' : 'text-slate-400'}`} />
              {t('howItWorks.roles.client')}
            </button>
          </section>

          {/* Active mobile role steps content block */}
          <section className="space-y-8">
            {activeRole === 'company' ? (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    {t('howItWorks.company.title')}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    {t('howItWorks.company.description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companySteps.map((step, idx) => {
                    const CompanyIcon = COMPANY_STEP_ICONS[idx] ?? Building2;
                    return (
                      <div key={idx} className="bg-white p-5 border border-slate-100 space-y-3 relative">
                        <span className="absolute top-4 right-4 font-mono font-bold text-slate-100 text-5xl select-none">
                          0{idx + 1}
                        </span>
                        <div className="p-2.5 bg-violet-50 text-violet-750 w-9 h-9 flex items-center justify-center">
                          <CompanyIcon className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase pt-1">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    {t('howItWorks.client.title')}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    {t('howItWorks.client.description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientSteps.map((step, idx) => {
                    const ClientIcon = CLIENT_STEP_ICONS[idx] ?? KeyRound;
                    return (
                      <div key={idx} className="bg-white p-5 border border-slate-100 space-y-3 relative">
                        <span className="absolute top-4 right-4 font-mono font-bold text-slate-100 text-5xl select-none">
                          0{idx + 1}
                        </span>
                        <div className="p-2.5 bg-indigo-50 text-indigo-750 w-9 h-9 flex items-center justify-center">
                          <ClientIcon className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase pt-1">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="border border-gray-100 rounded-3xl p-8 glass-panel text-center space-y-3">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            {isAuthed ? t('howItWorks.trust.titleAuthed') : t('howItWorks.trust.titleGuest')}
          </h3>
          <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
            {isAuthed
              ? t('howItWorks.trust.descriptionAuthed')
              : t('howItWorks.trust.descriptionGuest')}
          </p>
          <Link
            to={primaryCta.to}
            className="inline-flex items-center gap-2 mt-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
          >
            {primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </>
  );
}
