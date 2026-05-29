import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit2, Save, X } from 'lucide-react';
import {
  SoftBadge,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/types/fsm';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import {
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_TONES,
} from '@/constants/leads.constants';
import { isOpenLeadStatus } from '@/utils/leadStatus';
import { leadStatusLabel } from '@/utils/i18nStatusLabels';
import { useLocale } from '@/hooks/useLocale';
import { formatDateLocalized, formatDateTimeLocalized } from '@/utils/date';
import { isEstimateExcludedCategorySlug } from '@/constants/estimateCategorySlugs.constants';

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

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(lead.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const leadSourceLabel = (source: CompanyLeadDto['source']) =>
    t(`company.fsm.leads.sources.${source}`, { defaultValue: source });

  const handleSaveNotes = async () => {
    if (!onNotesChange) return;
    setSavingNotes(true);
    try {
      await onNotesChange(lead, tempNotes.trim() || null);
      setIsEditingNotes(false);
    } catch {
    } finally {
      setSavingNotes(false);
    }
  };

  const isExcluded = lead.category?.slug ? isEstimateExcludedCategorySlug(lead.category.slug) : false;

  return (
    <article className="px-4 py-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{lead.contactName}</h3>
            <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>{leadStatusLabel(lead.status, t)}</SoftBadge>
            {lead.source === 'SERVICE_REQUEST' ? (
              <SoftBadge tone="violet">
                {t('company.fsm.leads.inbox.badges.service', {
                  title: lead.serviceTitle || t('company.fsm.common.unspecified'),
                })}
              </SoftBadge>
            ) : lead.source === 'PROJECT_REQUEST' ? (
              <SoftBadge tone="blue">{t('company.fsm.leads.inbox.badges.project')}</SoftBadge>
            ) : (
              <SoftBadge tone="gray">{leadSourceLabel(lead.source)}</SoftBadge>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            📞 {lead.contactPhone}
            {lead.contactEmail ? ` · ✉️ ${lead.contactEmail}` : ''}
          </p>

          {lead.message ? (
            <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
              {lead.message}
            </div>
          ) : null}

          {/* Notes & Booking Link Section with Inline Editor */}
          <div className="max-w-2xl pt-1">
            {isEditingNotes ? (
              <div className="rounded-xl bg-violet-50/40 border border-violet-100 p-3 space-y-2">
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder={t('company.fsm.leads.inbox.notesPlaceholder', 'Adăugați link rezervare / master / detalii...')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                  rows={2}
                  disabled={savingNotes}
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTempNotes(lead.notes || '');
                      setIsEditingNotes(false);
                    }}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-500 bg-white hover:bg-gray-50"
                  >
                    <X className="w-3.5 h-3.5" /> {t('cabinet.common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {t('cabinet.common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-violet-50/30 border border-violet-100/50 p-3.5 text-xs text-slate-700 leading-relaxed flex items-start justify-between gap-4 font-medium hover:border-violet-200/80 transition-all">
                <div className="min-w-0">
                  <span className="font-extrabold text-violet-900 block text-[10px] uppercase tracking-wider mb-1">
                    📌 {t('company.fsm.leads.inbox.notesLabel', 'Note / Link rezervare / Master')}
                  </span>
                  {lead.notes ? (
                    lead.notes.includes('http') ? (
                      <a
                        href={lead.notes}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-700 hover:underline font-bold break-all"
                      >
                        {lead.notes}
                      </a>
                    ) : (
                      <span className="text-slate-700">{lead.notes}</span>
                    )
                  ) : (
                    <span className="text-gray-400 italic">
                      {t('company.fsm.leads.inbox.noNotes', 'Nu sunt note. Adăugați link de rezervare sau master.')}
                    </span>
                  )}
                </div>
                {isOpenLeadStatus(lead.status) && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="rounded-lg bg-white border border-gray-200 p-1.5 text-violet-600 hover:bg-violet-50 transition-colors shadow-2xs cursor-pointer shrink-0"
                    title={t('company.fsm.leads.inbox.editNotes', 'Editează note')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                {t('company.fsm.leads.inbox.budget')}{' '}
                {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
              </span>
            ) : null}
            {lead.address ? (
              <span className="text-xs text-slate-500 font-semibold">📍 {lead.address}</span>
            ) : null}
          </div>

          {lead.estimateProject ? (
            <p className="text-xs pt-1">
              <Link
                to={`/company/smete/${lead.estimateProject.id}`}
                className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100/50 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors"
              >
                {t('company.fsm.leads.inbox.estimateLink', {
                  number: lead.estimateProject.number,
                  title: lead.estimateProject.title,
                })}
              </Link>
            </p>
          ) : null}

          <p className="text-[10px] text-slate-400 font-medium">
            {t('company.fsm.leads.inbox.addedAt')}{' '}
            {formatDateTimeLocalized(lead.createdAt, locale)}
          </p>
        </div>

        {isOpenLeadStatus(lead.status) ? (
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead, e.target.value as CompanyLeadStatus)}
            className={cabinetSelectClass}
          >
            {LEAD_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabel(status, t)}
              </option>
            ))}
          </select>
        ) : null}
      </div>

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
          <button
            type="button"
            onClick={() => onConvertIntervention(lead.id)}
            disabled={convertPending}
            className={cabinetBtnPrimary}
          >
            {t('company.fsm.leads.inbox.actions.convertIntervention')}
          </button>
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
          <button type="button" onClick={() => onStatusChange(lead, LEAD_STATUS.LOST)} className={cabinetBtnSecondary}>
            {t('company.fsm.leads.inbox.actions.markLost')}
          </button>
        </div>
      ) : lead.status === LEAD_STATUS.CONVERTED ? (
        <p className="text-xs text-emerald-600 font-semibold">
          {t('company.fsm.leads.inbox.converted.label')}
          {lead.convertedAt ? ` · ${formatDateLocalized(lead.convertedAt, locale)}` : ''}
          {lead.customerId ? (
            <>
              {' '}
              · <Link to="/company/clienti" className="underline">{t('company.fsm.leads.inbox.converted.viewCustomer')}</Link>
            </>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
