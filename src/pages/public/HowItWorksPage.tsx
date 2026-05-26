import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';
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

export function HowItWorksPage() {
  const { isAuthed, primaryCta } = usePublicAuthCta();
  const [activeRole, setActiveRole] = useState<'company' | 'client'>('company');

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10 px-4 animate-fade-in">
      {/* Dynamic Background Elements */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <section className="text-center space-y-5 relative z-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-violet-750 bg-violet-50 border border-violet-100/80 px-4 py-2 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
          Simplitate · Control · Transparență
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-900">
          Cum funcționează{' '}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Faber Companii
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed text-wrap:pretty">
          O platformă unică creată pentru piața locală din Moldova. Conectăm direct prestatorii de servicii
          și tehnicienii mobili cu beneficiarii finali printr-un portal modern și securizat.
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
          Pentru Prestatori / Companii
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
          Pentru Clienți / Beneficiari
        </button>
      </section>

      {/* Content Area - Roles */}
      <section className="relative z-10">
        {activeRole === 'company' ? (
          <div className="space-y-12 animate-fade-in">
            {/* Introductory Text block */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                Digitalizează prestarea serviciilor în 4 pași simpli
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Treci de la foi imprimate, grupuri de WhatsApp blocate și calcule în Excel la o aplicație performantă. 
                Fără erori de deviz, cu control permanent asupra profitului și tehnicienilor tăi pe teren.
              </p>
            </div>

            {/* Steps Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Step 1 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-violet-50 select-none group-hover:text-violet-100/80 transition-colors">
                  01
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-violet-50 text-violet-750 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    1. Profilul Public & Configurare Tarife
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Te înregistrezi cu IDNO-ul firmei și datele de contact moldovenești. Configurezi pachetele de servicii
                    și prețurile lor de bază. Faber Companii îți generează instant un profil web public modern
                    unde clienții își pot trimite solicitările direct, fără intermediari.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-indigo-50 select-none group-hover:text-indigo-100/80 transition-colors">
                  02
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-750 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    2. Dimensionare Inteligentă & Smetă Smart
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    În loc de desenat pe hârtie, completezi parametrii clădirii (înălțime pereți, arie sol, unghi acoperiș) 
                    și cantitățile de echipamente în configuratorul integrat. Platforma determină automat consumul de materiale, 
                    orele de manoperă și marja de profit dorită, generând devizul (smeta) instantaneu.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-amber-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-amber-50 select-none group-hover:text-amber-100/80 transition-colors">
                  03
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    3. Gestiune Tehnicieni & Dispecerat FSM
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Programezi lucrările în calendarul centralizat și le aloci tehnicienilor mobili din echipă.
                    Fiecare membru al echipei își vede vizitele de pe teren direct în panou, primind detaliile obiectivului,
                    diagnosticul complet, parametrii măsurați de la clienți și statusul intervenției live.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-emerald-50 select-none group-hover:text-emerald-100/80 transition-colors">
                  04
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    4. Facturare Automată & PDF Nativ cu Diacritice
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Din smeta aprobată, platforma generează automat oferta și factura în format PDF premium. Toate documentele sunt exportate 
                    cu diacritice românești (ș, ț, ă, â, î), calcul automat de TVA moldovenesc și IDNO, eliminând birocrația 
                    și oferind rapoarte clare financiare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {/* Client introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                Interacțiune Simplă, Transparentă și Rapidă
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Nu mai trebuie să ții minte parole greoaie sau să cauți fișiere pierdute în chat. Portalul securizat 
                îți oferă control total și vizibilitate live asupra prețurilor și stadiului lucrării tale.
              </p>
            </div>

            {/* Client Steps Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Step 1 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-violet-50 select-none group-hover:text-violet-100/80 transition-colors">
                  01
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-violet-50 text-violet-750 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    1. Portal Securizat Fără Parole
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Autentificarea clienților este extrem de simplă. Prestatorul de servicii te adaugă în baza de date cu 
                    numărul tău de telefon, iar tu primești acces instant la portal. Fără înregistrări uitate sau formulare infinite.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-indigo-50 select-none group-hover:text-indigo-100/80 transition-colors">
                  02
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-750 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    2. Cereri Directe & Transmitere Buget
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Când dorești o intervenție tehnică nouă de la companie, poți crea o solicitare direct din portal. Îți specifici 
                    adresa și bugetul estimativ disponibil. Compania va primi această valoare direct în configuratorul 
                    lor pentru o planificare corectă a devizului.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-amber-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-amber-50 select-none group-hover:text-amber-100/80 transition-colors">
                  03
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    3. Aprobare Live a Devizelor / Smetelor
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Compania îți trimite devizul oficial direct în contul tău de portal. Îl poți deschide, vezi prețul la fiecare punct 
                    de manoperă și material, și îl poți aproba sau refuza printr-un singur click în timp real. Astfel, eviți neînțelegerile.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-premium hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 relative flex flex-col justify-between group">
                <span className="absolute top-4 right-6 font-black text-6xl text-emerald-50 select-none group-hover:text-emerald-100/80 transition-colors">
                  04
                </span>
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl w-13 h-13 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    4. Istoric Clar & Descărcare Facturi PDF
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Toate documentele de la lucrările finalizate sunt stocate într-un mod organizat. Poți oricând să descarci 
                    factura oficială în format PDF direct pe telefon sau calculator, având o siguranță deplină asupra 
                    garanțiilor și lucrărilor efectuate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trust banner */}
      <section className="relative z-10 bg-gradient-to-br from-violet-50/40 via-indigo-50/20 to-slate-50/30 p-8 rounded-3xl border border-violet-100/80 text-center max-w-2xl mx-auto space-y-6 shadow-premium overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
          {isAuthed ? 'Continuă activitatea în cabinet' : 'Pregătit să îți digitalizezi afacerea?'}
        </h3>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-semibold max-w-md mx-auto">
          {isAuthed
            ? 'Profilul tău public, membrii echipei de pe teren, prețurile serviciilor și programările le gestionezi simplu din cabinetul tău Faber Companii.'
            : 'Indiferent dacă ești prestator de servicii ce dorește smete și facturi rapide, sau un client ce dorește transparență maximă — Faber Companii este soluția completă.'}
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
  );
}
