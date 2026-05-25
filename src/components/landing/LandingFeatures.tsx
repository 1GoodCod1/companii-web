import { motion } from 'framer-motion';
import {
  CalendarRange,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const features = [
  {
    icon: UsersRound,
    title: 'CRM + FSM într-un loc',
    text: 'Clienți, echipă, lucrări, oferte și facturi — nu mai sari între 5 aplicații diferite.',
  },
  {
    icon: CalendarRange,
    title: 'Calendar inteligent',
    text: 'Programări pe tehnician, vizualizare zilnică, zero suprapuneri și uitări de vizite.',
  },
  {
    icon: CreditCard,
    title: 'Facturare cu TVA',
    text: 'Calcule automate pentru plătitori TVA. Status plăți, restanțe, rapoarte financiare clare.',
  },
  {
    icon: Smartphone,
    title: 'Portal pentru clienți',
    text: 'Clienții văd lucrările, ofertele și facturile lor — fără apeluri repetate „cât am de plată?".',
  },
  {
    icon: ShieldCheck,
    title: 'Made for Moldova',
    text: 'IDNO, adrese locale, MDL, regim fiscal moldovenesc — nu un CRM generic tradus.',
  },
  {
    icon: Sparkles,
    title: 'Plan Free → Pro → Business',
    text: 'Începi gratuit, scalezi când crești. Module deblocate progresiv, fără surprize.',
  },
];

export function LandingFeatures() {
  return (
    <section className="py-24 sm:py-28 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            De ce Faber
          </p>
          <h2 className="font-black text-gray-900 tracking-tight">
            Construit pentru companiile de servicii din Moldova
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Instalatori, electricieni, curățenie, IT field service — orice business cu tehnicieni pe
            teren și clienți care așteaptă răspuns rapid.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group rounded-3xl glass-panel p-6 shadow-premium hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
