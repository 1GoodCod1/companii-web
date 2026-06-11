import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { PUBLIC_ROUTE } from '@/shared/constants/routes.constants';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { usePublicAuthCta } from '@/features/auth';
import { FaberLogo } from '@/shared/ui/brand/FaberLogo';

export function LandingCta() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const { isAuthed, signupCta } = usePublicAuthCta();
  const perks = t('landing.cta.perks', { returnObjects: true }) as string[];

  return (
    <section className="bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              {isAuthed ? t('landing.cta.eyebrowAuthed') : t('landing.cta.eyebrowGuest')}
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black text-white tracking-tight text-balance">
              {isAuthed ? t('landing.cta.titleAuthed') : t('landing.cta.titleGuest')}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-400 font-medium leading-relaxed max-w-xl">
              {isAuthed ? t('landing.cta.descriptionAuthed') : t('landing.cta.descriptionGuest')}
            </p>

            <ul className="mt-8 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircleIcon className="size-4 text-violet-400 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 sm:p-10">
            <FaberLogo size="sm" />
            <div className="mt-7 border-t border-gray-100 pt-7 flex flex-col gap-3">
              <Link
                to={signupCta.to}
                className="inline-flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 transition-colors"
              >
                {signupCta.label}
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                to={lp(`/${PUBLIC_ROUTE.SUBSCRIPTIONS}`)}
                className="inline-flex justify-center items-center gap-2 border border-gray-200 bg-white text-gray-700 text-xs font-semibold uppercase tracking-wider px-6 py-3.5 hover:border-gray-400 transition-colors"
              >
                {t('landing.cta.viewPlansLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
