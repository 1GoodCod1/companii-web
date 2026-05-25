import { Link } from 'react-router-dom';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';

export function HowItWorksPage() {
  const { isAuthed, primaryCta } = usePublicAuthCta();

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-10 animate-fade-in">
      {/* Hero Header */}
      <section className="text-center space-y-4">
        <span className="inline-block text-xs font-black uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full shadow-xs">
          Simplitate & Eficiență
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-gray-900">
          Cum funcționează <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Faber Companii</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Trecerea de la WhatsApp, tabele Excel și carnețele de hârtie la un flux digital complet durează mai puțin de 10 minute. Iată cei 3 pași simpli:
        </p>
      </section>

      {/* Step Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-premium relative flex flex-col justify-between">
          <span className="absolute top-4 right-6 font-black text-6xl text-violet-100 select-none">01</span>
          <div className="space-y-4 pt-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-xs">
              🏢
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Configurează contul</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Îți înregistrezi compania în platformă, îți configurezi profilul public și adaugi pachetele de servicii pe care le oferi. Totul este 100% personalizabil.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-premium relative flex flex-col justify-between">
          <span className="absolute top-4 right-6 font-black text-6xl text-indigo-100 select-none">02</span>
          <div className="space-y-4 pt-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-xs">
              👥
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Echipă & Clienți</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Îți adaugi colegii sau tehnicienii de teren în echipă și înregistrezi clienții. Aceștia vor avea acces automat la propriul lor portal securizat prin link unic.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-premium relative flex flex-col justify-between">
          <span className="absolute top-4 right-6 font-black text-6xl text-emerald-100 select-none">03</span>
          <div className="space-y-4 pt-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-xs">
              🛠️
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Lucrări & Facturi</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Aloci comenzi de lucru, planifici vizite în calendar și trimiți oferte comerciale. Odată lucrarea finalizată de tehnician, factura se generează automat, cu tot cu calculul TVA.
            </p>
          </div>
        </div>
      </section>

      {/* Trust banner */}
      <section className="bg-violet-50/40 p-8 rounded-3xl border border-violet-100 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {isAuthed ? 'Continuă configurarea în cabinet' : 'Pregătit să îți optimizezi afacerea?'}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-md mx-auto">
          {isAuthed
            ? 'Profilul, echipa și fluxurile de lucru le gestionezi direct din cabinetul tău Faber Companii.'
            : 'Faber Companii îți oferă control total și transparență. Clienții tăi vor fi mai mulțumiți, iar echipa ta va lucra fără erori.'}
        </p>
        <Link
          to={primaryCta.to}
          className="inline-block mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-xs hover:shadow-sm"
        >
          {primaryCta.label}
        </Link>
      </section>
    </div>
  );
}
