import { motion } from 'framer-motion';
import { Building2, ClipboardCheck, FileSpreadsheet, Users, Wrench } from 'lucide-react';

const steps = [
  {
    icon: Building2,
    step: '01',
    title: 'Înregistrezi compania',
    description:
      'Profil juridic, categorie de servicii, pachete fixe — totul într-un onboarding de câteva minute. Fără Excel, fără hârtii.',
    tone: 'border-violet-200 bg-violet-50/50 text-violet-700',
  },
  {
    icon: Users,
    step: '02',
    title: 'Adaugi echipa & clienții',
    description:
      'Inviți tehnicienii și managerii. Clienții au istoric centralizat: telefon, adresă, note, toate lucrările anterioare.',
    tone: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
  },
  {
    icon: Wrench,
    step: '03',
    title: 'Planifici & execuți lucrări',
    description:
      'Comenzi, calendar, status live (programat → în lucru → finalizat). Tehnicianul vede tot ce are de făcut azi.',
    tone: 'border-amber-200 bg-amber-50/50 text-amber-700',
  },
  {
    icon: FileSpreadsheet,
    step: '04',
    title: 'Smete inteligente & Parametrizare',
    description:
      'Calculezi automat cantitățile de materiale și orele de manoperă prin configurarea dimensiunilor în editorul integrat sau prin chestionare de diagnostic.',
    tone: 'border-blue-200 bg-blue-50/50 text-blue-700',
  },
  {
    icon: ClipboardCheck,
    step: '05',
    title: 'Facturare automată',
    description:
      'Lucrarea finalizată → factură cu TVA calculat. Plăți, restanțe, rapoarte — fluxul financiar sub control.',
    tone: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LandingTimeline() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            Fluxul complet
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            De la primul apel la factura plătită —{' '}
            <span className="landing-shimmer-text">un singur sistem</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base leading-relaxed">
            Faber Companii înlocuiește haosul din WhatsApp, Excel și carnețele. Iată cum arată o zi
            normală cu CRM-ul tău FSM.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative"
        >
          <div className="absolute left-[1.65rem] top-4 bottom-4 w-px bg-gradient-to-b from-violet-300 via-indigo-200 to-emerald-300 hidden md:block" />

          <div className="space-y-6">
            {steps.map((step) => (
              <motion.article
                key={step.step}
                variants={item}
                className="relative md:pl-16"
              >
                <div
                  className={`hidden md:flex absolute left-0 top-5 h-14 w-14 items-center justify-center rounded-2xl border-2 ${step.tone} shadow-sm`}
                >
                  <step.icon className="h-6 w-6" />
                </div>

                <div className="rounded-3xl glass-panel p-6 sm:p-7 shadow-premium hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 md:hidden">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${step.tone}`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-300">{step.step}</span>
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-gray-300">{step.step}</span>
                    <h3 className="text-lg font-bold text-gray-900 w-full md:w-auto">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
