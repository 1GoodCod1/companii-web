import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { memberDisplayName } from '@/entities/company/model/teamMembers';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';
import {
  interventionAccentButtonClass,
  interventionFieldInputClass,
  interventionHighlightCardClass,
  interventionSectionTitleClass,
} from '../interventionPanelUi';

const editLabelClass = `${interventionSectionTitleClass} mb-1.5 block`;
const editInputClass = `${interventionFieldInputClass} text-xs`;

interface InterventionDetailEditFormProps {
  isManagement: boolean;
  editType: string;
  setEditType: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  editTechnicianId: string;
  setEditTechnicianId: (v: string) => void;
  editScheduledAt: string;
  setEditScheduledAt: (v: string) => void;
  editEstimatedPrice: string;
  setEditEstimatedPrice: (v: string) => void;
  editFinalPrice: string;
  setEditFinalPrice: (v: string) => void;
  editInternalNotes: string;
  setEditInternalNotes: (v: string) => void;
  assignableTechnicians: CompanyMemberDto[];
  handleSaveEdit: () => Promise<void>;
  setIsEditingDetail: (v: boolean) => void;
}

export function InterventionDetailEditForm({
  isManagement,
  editType,
  setEditType,
  editDescription,
  setEditDescription,
  editAddress,
  setEditAddress,
  editTechnicianId,
  setEditTechnicianId,
  editScheduledAt,
  setEditScheduledAt,
  editEstimatedPrice,
  setEditEstimatedPrice,
  editFinalPrice,
  setEditFinalPrice,
  editInternalNotes,
  setEditInternalNotes,
  assignableTechnicians,
  handleSaveEdit,
  setIsEditingDetail,
}: InterventionDetailEditFormProps) {
  const { t } = useTranslation();

  const technicianOptions = useMemo(
    () => [
      { value: '', label: t('company.fsm.interventions.detail.editForm.unassigned') },
      ...assignableTechnicians.map((m) => ({
        value: m.id,
        label: memberDisplayName(m),
      })),
    ],
    [assignableTechnicians, t],
  );

  return (
    <div className={`space-y-4 ${interventionHighlightCardClass}`}>
      <h4 className={interventionSectionTitleClass}>
        {isManagement
          ? t('company.fsm.interventions.detail.editForm.titleManagement')
          : t('company.fsm.interventions.detail.editForm.titleTechnician')}
      </h4>
      {isManagement ? (
        <div>
          <label htmlFor="ie-type" className={editLabelClass}>
            {t('company.fsm.interventions.detail.editForm.type')}
          </label>
          <input
            id="ie-type"
            type="text"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            className={editInputClass}
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="ie-address" className={editLabelClass}>
          {t('company.fsm.interventions.detail.editForm.address')}
        </label>
        <input
          id="ie-address"
          type="text"
          value={editAddress}
          onChange={(e) => setEditAddress(e.target.value)}
          className={editInputClass}
        />
      </div>
      {isManagement ? (
        <div>
          <label htmlFor="ie-description" className={editLabelClass}>
            {t('company.fsm.interventions.detail.editForm.description')}
          </label>
          <textarea
            id="ie-description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className={`${editInputClass} resize-none`}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {isManagement ? (
          <>
            <div>
              <label className={editLabelClass}>
                {t('company.fsm.interventions.detail.editForm.technician')}
              </label>
              <AppSelect
                value={editTechnicianId}
                onChange={setEditTechnicianId}
                options={technicianOptions}
                aria-label={t('company.fsm.interventions.detail.editForm.technician')}
              />
            </div>
            <div>
              <label htmlFor="ie-schedule" className={editLabelClass}>
                {t('company.fsm.interventions.detail.editForm.schedule')}
              </label>
              <input
                id="ie-schedule"
                type="datetime-local"
                value={editScheduledAt}
                onChange={(e) => setEditScheduledAt(e.target.value)}
                className={`${editInputClass} cursor-pointer`}
              />
            </div>
          </>
        ) : null}
      </div>
      {isManagement ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="ie-estimated-price" className={editLabelClass}>
              {t('company.fsm.interventions.detail.editForm.estimatedPrice')}
            </label>
            <input
              id="ie-estimated-price"
              type="number"
              value={editEstimatedPrice}
              onChange={(e) => setEditEstimatedPrice(e.target.value)}
              className={`${editInputClass} font-bold`}
            />
          </div>
          <div>
            <label htmlFor="ie-final-price" className={editLabelClass}>
              {t('company.fsm.interventions.detail.editForm.finalPrice')}
            </label>
            <input
              id="ie-final-price"
              type="number"
              value={editFinalPrice}
              onChange={(e) => setEditFinalPrice(e.target.value)}
              className={`${editInputClass} font-bold`}
            />
          </div>
        </div>
      ) : null}
      {isManagement ? (
        <div>
          <label htmlFor="ie-internal-notes" className={editLabelClass}>
            {t('company.fsm.interventions.detail.editForm.internalNotes')}
          </label>
          <input
            id="ie-internal-notes"
            type="text"
            value={editInternalNotes}
            onChange={(e) => setEditInternalNotes(e.target.value)}
            className={editInputClass}
          />
        </div>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-[var(--dashboard-divider)] pt-4">
        <button
          type="button"
          onClick={() => setIsEditingDetail(false)}
          className="cursor-pointer border border-gray-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-colors hover:border-gray-300"
        >
          {t('cabinet.common.cancel')}
        </button>
        <button
          type="button"
          onClick={() => void handleSaveEdit()}
          className={interventionAccentButtonClass}
        >
          {t('cabinet.common.save')}
        </button>
      </div>
    </div>
  );
}
