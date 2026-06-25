import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fileDownloadPath } from '@/shared/api/files';
import { useLocale } from '@/shared/hooks/useLocale';
import { technicianDisplayName } from '@/entities/company/model/teamMembers';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import type { InterventionDto } from '@/entities/fsm/model/types';
import { InterventionDetailField } from './InterventionDetailField';
import {
  interventionOutlineButtonClass,
  interventionSectionTitleClass,
} from '../interventionPanelUi';

interface InterventionDetailViewProps {
  detail: InterventionDto;
  canEditAssignedInterventionFields: boolean;
  isManagement: boolean;
  handleStartEdit: () => void;
  handlePhotoUpload: (files: File[]) => Promise<void>;
}

export function InterventionDetailView({
  detail,
  canEditAssignedInterventionFields,
  isManagement,
  handleStartEdit,
  handlePhotoUpload,
}: InterventionDetailViewProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <div className="space-y-5">
      {detail.estimateProjectId ? (
        <Link
          to={`/company/lucrari/${detail.id}/fisa`}
          className="inline-flex items-center justify-center border border-[var(--dashboard-accent)]/25 bg-[var(--dashboard-accent-light)]/50 px-4 py-2.5 text-sm font-bold text-[var(--dashboard-accent)] transition-colors hover:bg-[var(--dashboard-accent-light)]"
        >
          {t('company.fsm.interventions.detail.executionSheetLink')}
        </Link>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.client')}>
          <p className="text-sm font-bold text-gray-900">{detail.customer?.fullName}</p>
          <p className="mt-0.5 text-xs text-gray-500">{detail.customer?.phone}</p>
        </InterventionDetailField>

        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.address')}>
          <p className="text-sm font-medium leading-relaxed text-gray-800">{detail.address}</p>
        </InterventionDetailField>

        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.schedule')}>
          <p className="text-sm font-semibold text-gray-900">
            {detail.scheduledAt
              ? formatDateTimeLocalized(detail.scheduledAt, locale, 'datetimeShort')
              : t('company.fsm.interventions.detail.fields.unscheduled')}
          </p>
        </InterventionDetailField>

        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.technician')}>
          {detail.assignments && detail.assignments.length > 1 ? (
            <div className="space-y-1.5">
              {detail.assignments.map((assignment) => (
                <div key={assignment.memberId} className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {assignment.member.fullName || '—'}
                  </span>
                  {assignment.isLead ? (
                    <span className="rounded border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent-light)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--dashboard-accent)]">
                      {t('company.fsm.interventions.detail.fields.lead', { defaultValue: 'Lead' })}
                    </span>
                  ) : null}
                </div>
              ))}
              {detail.crew ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: detail.crew.color || 'var(--dashboard-accent)' }}
                  />
                  {detail.crew.name}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-900">
              {technicianDisplayName(detail.technician)}
            </p>
          )}
        </InterventionDetailField>
      </div>

      {!(detail.estimateProjectId && !isManagement) ? (
        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.description')}>
          <p className="border-l-2 border-[var(--dashboard-accent)]/35 pl-3 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
            {detail.description}
          </p>
        </InterventionDetailField>
      ) : null}

      {isManagement ? (
        <div className="grid gap-5 border-t border-[var(--dashboard-divider)] pt-5 sm:grid-cols-2">
          <InterventionDetailField label={t('company.fsm.interventions.detail.fields.estimatedPrice')}>
            <p className="text-base font-black text-gray-900">
              {detail.estimatedPrice
                ? `${detail.estimatedPrice} MDL`
                : t('company.fsm.common.unspecified')}
            </p>
          </InterventionDetailField>
          <InterventionDetailField label={t('company.fsm.interventions.detail.fields.finalPrice')}>
            <p className="text-base font-black text-[var(--dashboard-success)]">
              {detail.finalPrice
                ? `${detail.finalPrice} MDL`
                : t('company.fsm.common.unspecified')}
            </p>
          </InterventionDetailField>
        </div>
      ) : detail.estimateProjectId ? (
        <p className="border-l-2 border-[var(--dashboard-accent)]/35 pl-3 text-xs leading-relaxed text-gray-600">
          {t('company.fsm.interventions.detail.fields.executionSheetHint')}
        </p>
      ) : null}

      {isManagement && detail.internalNotes ? (
        <InterventionDetailField label={t('company.fsm.interventions.detail.fields.internalNotes')}>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{detail.internalNotes}</p>
        </InterventionDetailField>
      ) : null}

      <div className="border-t border-[var(--dashboard-divider)] pt-5">
        <p className={interventionSectionTitleClass}>
          {t('company.fsm.interventions.detail.photos.title')}
        </p>
        {detail.photos?.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {detail.photos.map((photo) => (
              <a
                key={photo.id}
                href={fileDownloadPath(photo.fileKey)}
                target="_blank"
                rel="noreferrer"
                aria-label={t('company.fsm.interventions.detail.photos.viewPhoto', {
                  defaultValue: 'Vezi fotografia',
                })}
                className="aspect-square overflow-hidden border border-[var(--dashboard-divider)] bg-white"
              >
                <img src={fileDownloadPath(photo.fileKey)} alt="" className="size-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-400">
            {t('company.fsm.interventions.detail.photos.empty')}
          </p>
        )}
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--dashboard-accent)]">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              void handlePhotoUpload(files);
              e.target.value = '';
            }}
          />
          {t('company.fsm.interventions.detail.photos.add')}
        </label>
      </div>

      {isManagement || canEditAssignedInterventionFields ? (
        <button type="button" onClick={handleStartEdit} className={interventionOutlineButtonClass}>
          {isManagement
            ? t('company.fsm.interventions.detail.edit.management')
            : t('company.fsm.interventions.detail.edit.technician')}
        </button>
      ) : null}
    </div>
  );
}
