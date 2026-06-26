import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@phosphor-icons/react';
import {
  PageHero,
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import { useLocale } from '@/shared/hooks/useLocale';
import type { PortalRequestSuccessState } from '@/features/portal/types/requestSuccess.types';

export function PortalRequestSuccessPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PortalRequestSuccessState | null;

  useEffect(() => {
    if (!state?.leadId) {
      navigate('/portal/cereri', { replace: true });
    }
  }, [navigate, state?.leadId]);

  if (!state?.leadId) {
    return null;
  }

  const requestLabel = state.serviceName || state.projectTitle || t('portal.requestSuccessPage.requestFallback');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('portal.common.eyebrow')}
        title={t(`portal.requestSuccessPage.title.${state.type}`)}
        description={t(`portal.requestSuccessPage.description.${state.type}`)}
      />

      <Panel className="overflow-hidden">
        <div className="flex flex-col items-center px-4 py-10 text-center sm:px-8">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircleIcon className="size-10" weight="fill" />
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-gray-600">
            {t('portal.requestSuccessPage.summary', {
              company: state.companyName,
              request: requestLabel,
            })}
          </p>

          {state.scheduledAt ? (
            <p className="mt-3 text-sm font-semibold text-violet-700">
              {t('portal.requestSuccessPage.scheduledAt', {
                date: formatDateTimeLocalized(state.scheduledAt, locale, 'datetime'),
              })}
            </p>
          ) : null}

          <p className="mt-4 max-w-md text-xs leading-relaxed text-gray-400">
            {t('portal.requestSuccessPage.nextSteps')}
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to={`/portal/cereri?highlight=${state.leadId}`}
              className={`${cabinetBtnPrimary} w-full sm:w-auto`}
            >
              {t('portal.requestSuccessPage.viewRequests')}
            </Link>
            {state.type === 'booking-confirmed' && state.interventionId ? (
              <Link
                to="/portal/lucrari"
                className={`${cabinetBtnSecondary} w-full sm:w-auto`}
              >
                {t('portal.requestSuccessPage.viewWorks')}
              </Link>
            ) : (
              <Link
                to={`/companies/${state.companySlug}`}
                className={`${cabinetBtnSecondary} w-full sm:w-auto`}
              >
                {t('portal.requestSuccessPage.backToCompany')}
              </Link>
            )}
          </div>

          <Link
            to="/companies"
            className="mt-4 text-xs font-semibold text-violet-600 hover:underline"
          >
            {t('portal.requestSuccessPage.searchMore')}
          </Link>
        </div>
      </Panel>
    </div>
  );
}
