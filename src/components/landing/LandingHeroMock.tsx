import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CalendarClock, MapPin, UserRound } from 'lucide-react';

const CARD_IDS = ['LUC-1045', 'LUC-1044', 'LUC-1042', 'LUC-1039'];
const TECH_NAMES = ['Vlad', 'Andrei', 'Andrei', 'Maria'];
const COLUMN_CARD_INDEX = [
  [0, 1],
  [2],
  [3],
];

export function LandingHeroMock() {
  const { t } = useTranslation();
  const columns = t('landingMocks.hero.columns', { returnObjects: true }) as Array<{ title: string }>;
  const cards = t('landingMocks.hero.cards', { returnObjects: true }) as Array<{
    type: string;
    client: string;
    time: string;
  }>;
  const team = t('landingMocks.hero.team', { returnObjects: true }) as Array<{
    name: string;
    status: string;
  }>;

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
          <span className="ml-2 text-[10px] font-medium text-gray-400">
            {t('landingMocks.hero.windowTitle')}
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4 bg-gradient-to-b from-white to-violet-50/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                {t('landingMocks.hero.boardEyebrow')}
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                {t('landingMocks.hero.boardTitle')}
              </p>
            </div>
            <div className="flex -space-x-2">
              {team.map((member) => (
                <span
                  key={member.name}
                  title={member.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white"
                >
                  {member.name.slice(0, 2).toUpperCase()}
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
                <span className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                  {col.title}
                </span>
                <div className="mt-2 space-y-2">
                  {COLUMN_CARD_INDEX[colIndex]?.map((cardIndex) => {
                    const card = cards[cardIndex];
                    if (!card) return null;
                    return (
                      <div
                        key={CARD_IDS[cardIndex]}
                        className="rounded-lg bg-white p-2.5 shadow-sm border border-gray-100/80"
                      >
                        <p className="text-[9px] font-medium text-gray-400">{CARD_IDS[cardIndex]}</p>
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
                            <span>{TECH_NAMES[cardIndex]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
        <p className="text-[10px] text-gray-400">{t('landingMocks.hero.statusUpdated')}</p>
        <p className="text-xs font-bold text-emerald-600">{t('landingMocks.hero.statusExample')}</p>
      </motion.div>
    </motion.div>
  );
}
