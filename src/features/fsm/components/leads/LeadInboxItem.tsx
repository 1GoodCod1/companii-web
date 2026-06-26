import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import {
  AppSelect,
  SoftBadge,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/entities/fsm/model/types';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import {
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_TONES,
} from '@/entities/fsm/model/leads.constants';
import { isOpenLeadStatus } from '@/entities/fsm/model/leadStatus';
import { leadStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { useLocale } from '@/shared/hooks/useLocale';
import { formatDateLocalized, formatDateTimeLocalized } from '@/shared/utils/date';
import { isEstimateExcludedCategorySlug } from '@/entities/estimate/model/estimateCategorySlugs.constants';
import { LeadNotesEditor } from './components/LeadNotesEditor';
import {
  leadActionsRowClass,
  leadCardBodyClass,
  leadCardClass,
  leadCardFooterClass,
  leadCardHeaderClass,
  leadContactRowClass,
  leadMessageClass,
  leadMetaLinkClass,
  leadMetaRowClass,
  leadSourceTagClass,
  leadTextActionClass,
} from './leadPanelUi';

export function LeadInboxItem({
  lead,
  convertPending,
  completePending,
  onStatusChange,
  onConvertCustomer,
  onConvertIntervention,
  onConvertEstimate,
  onComplete,
  onNotesChange,
}: {
  lead: CompanyLeadDto;
  convertPending: boolean;
  completePending: boolean;
  onStatusChange: (lead: CompanyLeadDto, status: CompanyLeadStatus) => void;
  onConvertCustomer: (leadId: string) => void;
  onConvertIntervention: (leadId: string) => void;
  onConvertEstimate: (lead: CompanyLeadDto) => void;
  onComplete: (leadId: string) => void;
  onNotesChange?: (lead: CompanyLeadDto, notes: string | null) => Promise<void>;
}) {
  const { t } = useTranslation();
  const locale = useLocale();

  const leadSourceLabel = (source: CompanyLeadDto['source']) =>
    t(`company.fsm.leads.sources.${source}`, { defaultValue: source });

  const isExcluded = lead.category?.slug ? isEstimateExcludedCategorySlug(lead.category.slug) : false;

  const leadStatusOptions = useMemo(
    () =>
      LEAD_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: leadStatusLabel(status, t),
      })),
    [t],
  );

  const sourceTag =
    lead.source === 'SERVICE_REQUEST'
      ? t('company.fsm.leads.inbox.badges.service', {
          title: lead.serviceTitle || t('company.fsm.common.unspecified'),
        })
      : lead.source === 'PROJECT_REQUEST'
        ? t('company.fsm.leads.inbox.badges.project')
        : leadSourceLabel(lead.source);

  const hasMeta =
    (lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0) ||
    !!lead.address ||
    !!lead.estimateProject ||
    (lead.interventions && lead.interventions.length > 0);

  return (
    <article className={leadCardClass}>
      <header className={leadCardHeaderClass}>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black tracking-tight text-gray-900">{lead.contactName}</h3>
            <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>
              {leadStatusLabel(lead.status, t)}
            </SoftBadge>
            <span className={leadSourceTagClass}>{sourceTag}</span>
          </div>

          <div className={leadContactRowClass}>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <PhoneIcon className="size-3.5 shrink-0 text-gray-400" weight="bold" />
              <a href={`tel:${lead.contactPhone}`} className="hover:text-gray-900 hover:underline">
                {lead.contactPhone}
              </a>
            </span>
            {lead.contactEmail ? (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <EnvelopeSimpleIcon className="size-3.5 shrink-0 text-gray-400" weight="bold" />
                <a
                  href={`mailto:${lead.contactEmail}`}
                  className="hover:text-gray-900 hover:underline"
                >
                  {lead.contactEmail}
                </a>
              </span>
            ) : null}
          </div>
        </div>

        {isOpenLeadStatus(lead.status) ? (
          <div className="shrink-0 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              {t('company.fsm.leads.inbox.status')}
            </p>
            <AppSelect
              value={lead.status}
              onChange={(value) => onStatusChange(lead, value as CompanyLeadStatus)}
              options={leadStatusOptions}
              aria-label={t('company.fsm.leads.inbox.status')}
              className="min-w-[168px]"
              maxVisibleItems={8}
            />
          </div>
        ) : null}
      </header>

      <div className={leadCardBodyClass}>
        {lead.message ? <p className={leadMessageClass}>{lead.message}</p> : null}

        <LeadNotesEditor lead={lead} onNotesChange={onNotesChange} />

        {hasMeta ? (
          <div className={leadMetaRowClass}>
            {lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0 ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                <CurrencyCircleDollarIcon className="size-3.5 shrink-0" weight="bold" />
                {t('company.fsm.leads.inbox.budget')}{' '}
                {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
              </span>
            ) : null}
            {lead.address ? (
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <MapPinIcon className="size-3.5 shrink-0 text-gray-400" weight="bold" />
                {lead.address}
              </span>
            ) : null}
            {lead.estimateProject ? (
              <Link to={`/company/smete/${lead.estimateProject.id}`} className={leadMetaLinkClass}>
                {t('company.fsm.leads.inbox.estimateLink', {
                  number: lead.estimateProject.number,
                  title: lead.estimateProject.title,
                })}
              </Link>
            ) : null}
            {lead.interventions?.map((intervention) => (
              <Link
                key={intervention.id}
                to={`/company/lucrari?selectedId=${intervention.id}`}
                className={leadMetaLinkClass}
              >
                <WrenchIcon className="size-3.5 shrink-0" weight="bold" />
                {t('company.fsm.leads.inbox.interventionLink', {
                  number: intervention.number,
                  type: intervention.type,
                })}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <footer className={leadCardFooterClass}>
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <CalendarBlankIcon className="size-3.5 shrink-0 text-gray-400" />
          <span>
            {t('company.fsm.leads.inbox.addedAt')}{' '}
            <time dateTime={lead.createdAt}>
              {formatDateTimeLocalized(lead.createdAt, locale)}
            </time>
          </span>
        </p>

        {isOpenLeadStatus(lead.status) ? (
          <div className={leadActionsRowClass}>
            {!lead.customerId ? (
              <button
                type="button"
                onClick={() => onConvertCustomer(lead.id)}
                disabled={convertPending}
                className={cabinetBtnSecondary}
              >
                {t('company.fsm.leads.inbox.actions.saveToCrm')}
              </button>
            ) : null}
            {!lead.interventions || lead.interventions.length === 0 ? (
              <button
                type="button"
                onClick={() => onConvertIntervention(lead.id)}
                disabled={convertPending}
                className={cabinetBtnPrimary}
              >
                {t('company.fsm.leads.inbox.actions.convertIntervention')}
              </button>
            ) : null}
            {!lead.estimateProjectId && !isExcluded ? (
              <button
                type="button"
                onClick={() => onConvertEstimate(lead)}
                disabled={convertPending}
                className={cabinetBtnSecondary}
              >
                {t('company.fsm.leads.inbox.actions.convertEstimate')}
              </button>
            ) : null}
            {lead.status === LEAD_STATUS.QUALIFIED || lead.status === LEAD_STATUS.IN_PROGRESS ? (
              <button
                type="button"
                onClick={() => onComplete(lead.id)}
                disabled={completePending}
                className={cabinetBtnSecondary}
              >
                {t('company.fsm.leads.inbox.actions.complete')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onStatusChange(lead, LEAD_STATUS.LOST)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50"
            >
              {t('company.fsm.leads.inbox.actions.markLost')}
            </button>
          </div>
        ) : lead.status === LEAD_STATUS.CONVERTED ? (
          <p className="text-xs font-semibold text-emerald-700">
            {t('company.fsm.leads.inbox.converted.label')}
            {lead.convertedAt ? (
              <>
                {' '}
                ·{' '}
                <time dateTime={lead.convertedAt}>
                  {formatDateLocalized(lead.convertedAt, locale)}
                </time>
              </>
            ) : null}
            {lead.customerId ? (
              <>
                {' '}
                ·{' '}
                <Link to="/company/clienti" className={leadTextActionClass}>
                  {t('company.fsm.leads.inbox.converted.viewCustomer')}
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </footer>
    </article>
  );
}
