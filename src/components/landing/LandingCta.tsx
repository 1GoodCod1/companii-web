import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth/usePublicAuthCta';

export function LandingCta() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { isAuthed, signupCta } = usePublicAuthCta();
  const perks = t('landing.cta.perks', { returnObjects: true }) as string[];

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-8 sm:p-12 lg:p-16 text-center shadow-[0_40px_80px_-20px_rgba(91,33,182,0.45)]"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200 mb-4">
              {isAuthed ? t('landing.cta.eyebrowAuthed') : t('landing.cta.eyebrowGuest')}
            </p>
            <h2 className="font-black text-white tracking-tight text-balance">
              {isAuthed ? t('landing.cta.titleAuthed') : t('landing.cta.titleGuest')}
            </h2>
            <p className="mt-4 text-violet-100/90 text-base leading-relaxed">
              {isAuthed ? t('landing.cta.descriptionAuthed') : t('landing.cta.descriptionGuest')}
            </p>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm text-violet-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to={signupCta.to}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-violet-700 shadow-lg hover:bg-violet-50 transition-colors"
              >
                {signupCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={lp('/subscriptions')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                {t('landing.cta.viewPlansLink')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
