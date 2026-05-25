import { motion } from 'framer-motion';
import { CalendarClock, MapPin, UserRound } from 'lucide-react';

const columns = [
  {
    title: 'Programate',
    tone: 'bg-indigo-50 text-indigo-700',
    cards: [
      { id: 'LUC-1045', type: 'Instalare boiler', client: 'Elena Ciobanu', time: '14:00', tech: 'Vlad' },
      { id: 'LUC-1044', type: 'Revizie electrică', client: 'Ap. 12, Botanica', time: '16:30', tech: 'Andrei' },
    ],
  },
  {
    title: 'În lucru',
    tone: 'bg-amber-50 text-amber-700',
    cards: [
      { id: 'LUC-1042', type: 'Reparație urgentă', client: 'Ion Popescu', time: 'Acum', tech: 'Andrei' },
    ],
  },
  {
    title: 'Finalizate',
    tone: 'bg-emerald-50 text-emerald-700',
    cards: [
      { id: 'LUC-1039', type: 'Montaj AC', client: 'SC Voltex SRL', time: '09:15', tech: 'Maria' },
    ],
  },
];

const teamOnline = [
  { initials: 'AM', name: 'Andrei M.', status: 'Pe teren' },
  { initials: 'VC', name: 'Vlad C.', status: 'Disponibil' },
  { initials: 'MR', name: 'Maria R.', status: 'În lucru' },
];

export function LandingHeroMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[640px] mx-auto"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-violet-400/15 via-transparent to-indigo-400/10 blur-2xl -z-10" />

      <div className="rounded-2xl border border-gray-100/80 bg-white shadow-[0_24px_60px_-12px_rgba(99,102,241,0.2)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-slate-50/90">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[10px] font-medium text-gray-400">Lucrări · Azi, 25 mai</span>
        </div>

        <div className="p-4 sm:p-5 space-y-4 bg-gradient-to-b from-white to-violet-50/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                Board operațional
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5">3 tehnicieni · 6 lucrări azi</p>
            </div>
            <div className="flex -space-x-2">
              {teamOnline.map((member) => (
                <span
                  key={member.initials}
                  title={member.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white"
                >
                  {member.initials}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {columns.map((col, colIndex) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + colIndex * 0.1, duration: 0.5 }}
                className="rounded-xl bg-slate-50/80 p-2.5 min-h-[180px]"
              >
                <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${col.tone}`}>
                  {col.title}
                </span>
                <div className="mt-2 space-y-2">
                  {col.cards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-lg bg-white p-2.5 shadow-sm border border-gray-100/80"
                    >
                      <p className="text-[9px] font-medium text-gray-400">{card.id}</p>
                      <p className="text-xs font-semibold text-gray-900 mt-0.5 leading-snug">{card.type}</p>
                      <div className="mt-2 space-y-1 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <UserRound className="h-3 w-3 shrink-0" />
                          <span className="truncate">{card.client}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3 shrink-0" />
                          <span>{card.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{card.tech}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 hidden md:block rounded-xl bg-white px-3 py-2.5 shadow-premium border border-emerald-100/80"
      >
        <p className="text-[10px] text-gray-400">Status actualizat</p>
        <p className="text-xs font-bold text-emerald-600">LUC-1042 → În lucru</p>
      </motion.div>
    </motion.div>
  );
}
