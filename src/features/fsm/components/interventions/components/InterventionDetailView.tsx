import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fileDownloadPath } from '@/shared/api/files';
import { useLocale } from '@/shared/hooks/useLocale';
import { technicianDisplayName } from '@/entities/company/model/teamMembers';
import { formatDateTimeLocalized } from '@/shared/utils/date';
import type { InterventionDto } from '@/entities/fsm/model/types';

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
    <div className="space-y-4">
      {detail.estimateProjectId && (
        <Link
          to={`/company/lucrari/${detail.id}/fisa`}
          className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          {t('company.fsm.interventions.detail.executionSheetLink')}
        </Link>
      )}

      <div className="space-y-2.5 text-sm text-gray-700">
        <div>
          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
            {t('company.fsm.interventions.detail.fields.client')}
          </span>
          <span className="font-bold text-gray-900">{detail.customer?.fullName}</span>
          <span className="text-xs text-gray-500 block font-semibold mt-0.5">{detail.customer?.phone}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
            {t('company.fsm.interventions.detail.fields.address')}
          </span>
          <span className="font-bold text-gray-800">{detail.address}</span>
        </div>
        {!(detail.estimateProjectId && !isManagement) ? (
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
              {t('company.fsm.interventions.detail.fields.description')}
            </span>
            <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed font-medium">
              {detail.description}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
              {t('company.fsm.interventions.detail.fields.schedule')}
            </span>
            <span className="text-xs font-bold text-gray-800">
              {detail.scheduledAt
                ? formatDateTimeLocalized(detail.scheduledAt, locale, 'datetimeShort')
                : t('company.fsm.interventions.detail.fields.unscheduled')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
              {t('company.fsm.interventions.detail.fields.technician')}
            </span>
            {detail.assignments && detail.assignments.length > 1 ? (
              <div className="space-y-1">
                {detail.assignments.map((a) => (
                  <div key={a.memberId} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">
                      {a.member.fullName || '—'}
                    </span>
                    {a.isLead && (
                      <span className="text-[8px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded">
                        {t('company.fsm.interventions.detail.fields.lead', { defaultValue: 'Lead' })}
                      </span>
                    )}
                  </div>
                ))}
                {detail.crew && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: detail.crew.color || '#6366f1' }}
                    />
                    {detail.crew.name}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-800">
                {technicianDisplayName(detail.technician)}
              </span>
            )}
          </div>
        </div>
        {isManagement ? (
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3.5">
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                {t('company.fsm.interventions.detail.fields.estimatedPrice')}
              </span>
              <span className="font-black text-sm text-gray-900">
                {detail.estimatedPrice
                  ? `${detail.estimatedPrice} MDL`
                  : t('company.fsm.common.unspecified')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                {t('company.fsm.interventions.detail.fields.finalPrice')}
              </span>
              <span className="font-black text-sm text-emerald-600">
                {detail.finalPrice
                  ? `${detail.finalPrice} MDL`
                  : t('company.fsm.common.unspecified')}
              </span>
            </div>
          </div>
        ) : detail.estimateProjectId ? (
          <p className="text-xs text-gray-500 bg-violet-50/60 border border-violet-100 rounded-xl px-3 py-2.5 leading-relaxed">
            {t('company.fsm.interventions.detail.fields.executionSheetHint')}
          </p>
        ) : null}
      </div>

      {isManagement && detail.internalNotes && (
        <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
          <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider mb-1">
            {t('company.fsm.interventions.detail.fields.internalNotes')}
          </span>
          <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">{detail.internalNotes}</p>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
          {t('company.fsm.interventions.detail.photos.title')}
        </span>
        {detail.photos?.length ? (
          <div className="grid grid-cols-3 gap-2">
            {detail.photos.map((photo) => (
              <a
                key={photo.id}
                href={fileDownloadPath(photo.fileKey)}
                target="_blank"
                rel="noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img src={fileDownloadPath(photo.fileKey)} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">{t('company.fsm.interventions.detail.photos.empty')}</p>
        )}
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 cursor-pointer">
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
        <button
          onClick={handleStartEdit}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isManagement
            ? t('company.fsm.interventions.detail.edit.management')
            : t('company.fsm.interventions.detail.edit.technician')}
        </button>
      ) : null}
    </div>
  );
}
