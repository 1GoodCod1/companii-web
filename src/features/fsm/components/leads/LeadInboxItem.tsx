import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeSimpleIcon, MapPinIcon, PhoneIcon } from '@phosphor-icons/react';
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
import { leadMetaLinkClass, leadPanelRowClass, leadSourceTagClass } from './leadPanelUi';

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

  return (
    <article className={leadPanelRowClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black tracking-tight text-gray-900">{lead.contactName}</h3>
            <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>{leadStatusLabel(lead.status, t)}</SoftBadge>
            <span className={leadSourceTagClass}>{sourceTag}</span>
          </div>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <PhoneIcon className="size-3.5 shrink-0 text-gray-400" />
              {lead.contactPhone}
            </span>
            {lead.contactEmail ? (
              <span className="inline-flex items-center gap-1.5">
                <EnvelopeSimpleIcon className="size-3.5 shrink-0 text-gray-400" />
                {lead.contactEmail}
              </span>
            ) : null}
          </p>
        </div>

        {isOpenLeadStatus(lead.status) ? (
          <AppSelect
            value={lead.status}
            onChange={(value) => onStatusChange(lead, value as CompanyLeadStatus)}
            options={leadStatusOptions}
            aria-label={t('company.fsm.leads.inbox.status')}
            className="min-w-[160px]"
            maxVisibleItems={8}
          />
        ) : null}
      </div>

      {lead.message ? (
        <p className="border-l-2 border-[var(--dashboard-accent)]/35 pl-3 text-sm leading-relaxed text-gray-600">
          {lead.message}
        </p>
      ) : null}

      <LeadNotesEditor lead={lead} onNotesChange={onNotesChange} />

      {(lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0) || lead.address ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-[var(--dashboard-success)]">
              {t('company.fsm.leads.inbox.budget')}{' '}
              {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
            </span>
          ) : null}
          {lead.address ? (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <MapPinIcon className="size-3.5 shrink-0 text-gray-400" />
              {lead.address}
            </span>
          ) : null}
        </div>
      ) : null}

      {lead.estimateProject ? (
        <Link to={`/company/smete/${lead.estimateProject.id}`} className={leadMetaLinkClass}>
          {t('company.fsm.leads.inbox.estimateLink', {
            number: lead.estimateProject.number,
            title: lead.estimateProject.title,
          })}
        </Link>
      ) : null}

      {lead.interventions && lead.interventions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {lead.interventions.map((intervention) => (
            <Link
              key={intervention.id}
              to={`/company/lucrari?selectedId=${intervention.id}`}
              className={leadMetaLinkClass}
            >
              {t('company.fsm.leads.inbox.interventionLink', {
                number: intervention.number,
                type: intervention.type,
              })}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="text-[10px] font-medium text-gray-400">
        {t('company.fsm.leads.inbox.addedAt')} {formatDateTimeLocalized(lead.createdAt, locale)}
      </p>

      {isOpenLeadStatus(lead.status) ? (
        <div className="flex flex-wrap gap-2">
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
          {(!lead.interventions || lead.interventions.length === 0) ? (
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
          {lead.status === LEAD_STATUS.IN_PROGRESS ? (
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
            className={cabinetBtnSecondary}
          >
            {t('company.fsm.leads.inbox.actions.markLost')}
          </button>
        </div>
      ) : lead.status === LEAD_STATUS.CONVERTED ? (
        <p className="text-xs font-semibold text-[var(--dashboard-success)]">
          {t('company.fsm.leads.inbox.converted.label')}
          {lead.convertedAt ? ` · ${formatDateLocalized(lead.convertedAt, locale)}` : ''}
          {lead.customerId ? (
            <>
              {' '}
              ·{' '}
              <Link to="/company/clienti" className="text-[var(--dashboard-accent)] hover:underline">
                {t('company.fsm.leads.inbox.converted.viewCustomer')}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
