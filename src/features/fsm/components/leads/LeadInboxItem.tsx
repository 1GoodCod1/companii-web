import { Link } from 'react-router-dom';
import {
  SoftBadge,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import type { CompanyLeadDto, CompanyLeadStatus } from '@/types/fsm';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_TONES,
} from '@/constants/leads.constants';
import { isOpenLeadStatus } from '@/utils/leadStatus';
import { formatDateRo, formatDateTimeRo } from '@/utils/date';

export function LeadInboxItem({
  lead,
  convertPending,
  completePending,
  onStatusChange,
  onConvertCustomer,
  onConvertIntervention,
  onConvertEstimate,
  onComplete,
}: {
  lead: CompanyLeadDto;
  convertPending: boolean;
  completePending: boolean;
  onStatusChange: (lead: CompanyLeadDto, status: CompanyLeadStatus) => void;
  onConvertCustomer: (leadId: string) => void;
  onConvertIntervention: (leadId: string) => void;
  onConvertEstimate: (lead: CompanyLeadDto) => void;
  onComplete: (leadId: string) => void;
}) {
  return (
    <article className="px-4 py-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{lead.contactName}</h3>
            <SoftBadge tone={LEAD_STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</SoftBadge>
            {lead.source === 'SERVICE_REQUEST' ? (
              <SoftBadge tone="violet">🔧 Serviciu: {lead.serviceTitle || 'Nespecificat'}</SoftBadge>
            ) : lead.source === 'PROJECT_REQUEST' ? (
              <SoftBadge tone="blue">🏗️ Proiect Complex</SoftBadge>
            ) : (
              <SoftBadge tone="gray">{LEAD_SOURCE_LABELS[lead.source] ?? lead.source}</SoftBadge>
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {lead.estimatedBudget != null && Number(lead.estimatedBudget) > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                💰 Buget: {Number(lead.estimatedBudget).toLocaleString('ro-MD')} MDL
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
                📝 Smetă {lead.estimateProject.number} — {lead.estimateProject.title}
              </Link>
            </p>
          ) : null}

          <p className="text-[10px] text-slate-400 font-medium">
            Adăugat la: {formatDateTimeRo(lead.createdAt)}
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
                {LEAD_STATUS_LABELS[status]}
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
              Salvează în CRM
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onConvertIntervention(lead.id)}
            disabled={convertPending}
            className={cabinetBtnPrimary}
          >
            Preia → Lucrare
          </button>
          {!lead.estimateProjectId ? (
            <button
              type="button"
              onClick={() => onConvertEstimate(lead)}
              disabled={convertPending}
              className={cabinetBtnSecondary}
            >
              → Smetă
            </button>
          ) : null}
          {lead.status === LEAD_STATUS.IN_PROGRESS ? (
            <button
              type="button"
              onClick={() => onComplete(lead.id)}
              disabled={completePending}
              className={cabinetBtnSecondary}
            >
              Finalizează cererea
            </button>
          ) : null}
          <button type="button" onClick={() => onStatusChange(lead, LEAD_STATUS.LOST)} className={cabinetBtnSecondary}>
            Marchează pierdut
          </button>
        </div>
      ) : lead.status === LEAD_STATUS.CONVERTED ? (
        <p className="text-xs text-emerald-600 font-semibold">
          Finalizată
          {lead.convertedAt ? ` · ${formatDateRo(lead.convertedAt)}` : ''}
          {lead.customerId ? (
            <>
              {' '}
              · <Link to="/company/clienti" className="underline">Vezi client</Link>
            </>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
