import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { memberDisplayName } from '@/entities/company/model/teamMembers';
import { AppSelect } from '@/widgets/cabinet/cabinet-ui';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';

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
    <div className="space-y-3.5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {isManagement
          ? t('company.fsm.interventions.detail.editForm.titleManagement')
          : t('company.fsm.interventions.detail.editForm.titleTechnician')}
      </h4>
      {isManagement ? (
        <div>
          <label htmlFor="ie-type" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {t('company.fsm.interventions.detail.editForm.type')}
          </label>
          <input
            id="ie-type"
            type="text"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="ie-address" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
          {t('company.fsm.interventions.detail.editForm.address')}
        </label>
        <input
          id="ie-address"
          type="text"
          value={editAddress}
          onChange={(e) => setEditAddress(e.target.value)}
          className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
        />
      </div>
      {isManagement ? (
        <div>
          <label htmlFor="ie-description" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {t('company.fsm.interventions.detail.editForm.description')}
          </label>
          <textarea
            id="ie-description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white resize-none font-medium"
          />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {isManagement ? (
          <>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
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
              <label htmlFor="ie-schedule" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {t('company.fsm.interventions.detail.editForm.schedule')}
              </label>
              <input
                id="ie-schedule"
                type="datetime-local"
                value={editScheduledAt}
                onChange={(e) => setEditScheduledAt(e.target.value)}
                className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-1.5 text-xs outline-none bg-white cursor-pointer font-medium"
              />
            </div>
          </>
        ) : null}
      </div>
      {isManagement ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="ie-estimated-price" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {t('company.fsm.interventions.detail.editForm.estimatedPrice')}
            </label>
            <input
              id="ie-estimated-price"
              type="number"
              value={editEstimatedPrice}
              onChange={(e) => setEditEstimatedPrice(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-bold"
            />
          </div>
          <div>
            <label htmlFor="ie-final-price" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {t('company.fsm.interventions.detail.editForm.finalPrice')}
            </label>
            <input
              id="ie-final-price"
              type="number"
              value={editFinalPrice}
              onChange={(e) => setEditFinalPrice(e.target.value)}
              className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-bold"
            />
          </div>
        </div>
      ) : null}
      {isManagement ? (
        <div>
          <label htmlFor="ie-internal-notes" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {t('company.fsm.interventions.detail.editForm.internalNotes')}
          </label>
          <input
            id="ie-internal-notes"
            type="text"
            value={editInternalNotes}
            onChange={(e) => setEditInternalNotes(e.target.value)}
            className="w-full border border-gray-200 focus:border-violet-500 rounded-lg p-2 text-xs outline-none bg-white font-medium"
          />
        </div>
      ) : null}
      <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setIsEditingDetail(false)}
          className="px-3.5 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer bg-white"
        >
          {t('cabinet.common.cancel')}
        </button>
        <button
          type="button"
          onClick={() => void handleSaveEdit()}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        >
          {t('cabinet.common.save')}
        </button>
      </div>
    </div>
  );
}
