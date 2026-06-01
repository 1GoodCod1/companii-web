import { useTranslation } from 'react-i18next';
import { EmptyState, Panel, PanelHeader } from '@/components/cabinet/cabinet-ui';
import type { CompanyRole } from '@/types/roles';
import type { CompanyMemberDto } from '@/types/fsm';
import { useInterventionDetail } from './hooks/useInterventionDetail';
import { InterventionDetailView } from './components/InterventionDetailView';
import { InterventionDetailEditForm } from './components/InterventionDetailEditForm';
import { InterventionStatusTransition } from './components/InterventionStatusTransition';
import { InterventionNotesSection } from './components/InterventionNotesSection';
import { interventionStatusLabel } from '@/utils/i18nStatusLabels';
import { getInterventionStatusStyle } from '@/utils/interventionStatus';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
  isManagement: boolean;
  role: CompanyRole | undefined;
  memberId: string | undefined;
  canEditAssignedInterventionFields: boolean;
  canDeleteAnyNote: boolean;
  canDeleteOwnNotes: boolean;
  assignableTechnicians: CompanyMemberDto[];
};

export function InterventionDetailPanel({
  selectedId,
  onClearSelection,
  isManagement,
  role,
  memberId,
  canEditAssignedInterventionFields,
  canDeleteAnyNote,
  canDeleteOwnNotes,
  assignableTechnicians,
}: Props) {
  const { t } = useTranslation();

  const {
    detail,
    isLoadingDetail,
    isEditingDetail,
    setIsEditingDetail,
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
    noteBody,
    setNoteBody,
    statusNote,
    setStatusNote,
    handleStartEdit,
    handleSaveEdit,
    canDeleteNote,
    handleStatusChange,
    handleDelete,
    handleAddNote,
    handleDeleteNote,
    handleGenerateInvoice,
    handlePhotoUpload,
    isStatusUpdating,
    confirmDialog,
  } = useInterventionDetail({
    selectedId,
    onClearSelection,
    isManagement,
    memberId,
    canDeleteAnyNote,
    canDeleteOwnNotes,
  });

  return (
    <Panel>
      <PanelHeader
        title={t('company.fsm.interventions.detail.title')}
        action={
          isManagement && selectedId && !isLoadingDetail && detail ? (
            <button
              type="button"
              onClick={() => handleDelete(selectedId)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            >
              {t('cabinet.common.delete')}
            </button>
          ) : undefined
        }
      />

      {selectedId ? (
        isLoadingDetail || !detail ? (
          <div className="text-center py-20 text-gray-400">{t('company.fsm.interventions.detail.loading')}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{detail.number}</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5 tracking-tight">{detail.type}</h3>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getInterventionStatusStyle(
                  detail.status,
                )}`}
              >
                {interventionStatusLabel(detail.status, t)}
              </span>
            </div>

            <InterventionStatusTransition
              detail={detail}
              role={role}
              statusNote={statusNote}
              setStatusNote={setStatusNote}
              handleStatusChange={handleStatusChange}
              isStatusUpdating={isStatusUpdating}
              isManagement={isManagement}
              handleGenerateInvoice={handleGenerateInvoice}
            />

            {!isEditingDetail ? (
              <InterventionDetailView
                detail={detail}
                canEditAssignedInterventionFields={canEditAssignedInterventionFields}
                isManagement={isManagement}
                handleStartEdit={handleStartEdit}
                handlePhotoUpload={handlePhotoUpload}
              />
            ) : (
              <InterventionDetailEditForm
                isManagement={isManagement}
                editType={editType}
                setEditType={setEditType}
                editDescription={editDescription}
                setEditDescription={setEditDescription}
                editAddress={editAddress}
                setEditAddress={setEditAddress}
                editTechnicianId={editTechnicianId}
                setEditTechnicianId={setEditTechnicianId}
                editScheduledAt={editScheduledAt}
                setEditScheduledAt={setEditScheduledAt}
                editEstimatedPrice={editEstimatedPrice}
                setEditEstimatedPrice={setEditEstimatedPrice}
                editFinalPrice={editFinalPrice}
                setEditFinalPrice={setEditFinalPrice}
                editInternalNotes={editInternalNotes}
                setEditInternalNotes={setEditInternalNotes}
                assignableTechnicians={assignableTechnicians}
                handleSaveEdit={handleSaveEdit}
                setIsEditingDetail={setIsEditingDetail}
              />
            )}

            <InterventionNotesSection
              notes={detail.notes}
              noteBody={noteBody}
              setNoteBody={setNoteBody}
              handleAddNote={handleAddNote}
              handleDeleteNote={handleDeleteNote}
              canDeleteNote={canDeleteNote}
            />
          </div>
        )
      ) : (
        <EmptyState message={t('company.fsm.interventions.detail.empty')} />
      )}
      {confirmDialog}
    </Panel>
  );
}
