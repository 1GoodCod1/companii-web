import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { PUBLIC_ROUTE } from '@/shared/constants/routes.constants';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth';

export function LandingCta() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { isAuthed, signupCta } = usePublicAuthCta();
  const perks = t('landing.cta.perks', { returnObjects: true }) as string[];

  return (
    <section className="py-24 sm:py-28 border-y border-gray-100 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-none p-8 sm:p-12 bg-white shadow-sm text-center space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            {isAuthed ? t('landing.cta.eyebrowAuthed') : t('landing.cta.eyebrowGuest')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-balance">
            {isAuthed ? t('landing.cta.titleAuthed') : t('landing.cta.titleGuest')}
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
            {isAuthed ? t('landing.cta.descriptionAuthed') : t('landing.cta.descriptionGuest')}
          </p>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircleIcon className="size-4 text-violet-500 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Link
              to={signupCta.to}
              className="inline-flex justify-center items-center gap-2 border border-transparent bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3 transition-all w-full sm:w-auto"
            >
              {signupCta.label}
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to={lp(`/${PUBLIC_ROUTE.SUBSCRIPTIONS}`)}
              className="inline-flex justify-center items-center gap-2 border border-gray-200 bg-white text-gray-700 text-xs font-semibold uppercase tracking-wider px-6 py-3 hover:border-gray-300 transition-all w-full sm:w-auto"
            >
              {t('landing.cta.viewPlansLink')}
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
