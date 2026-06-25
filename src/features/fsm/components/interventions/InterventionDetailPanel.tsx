import { useTranslation } from 'react-i18next';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { EmptyState, Panel, PanelHeader, SkeletonForm } from '@/widgets/cabinet/cabinet-ui';
import { cabinetSplitDetailPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';
import type { CompanyRole } from '@/entities/company/model/roles.types';
import type { CompanyMemberDto } from '@/entities/fsm/model/types';
import { useInterventionDetail } from './hooks/useInterventionDetail';
import { InterventionDetailView } from './components/InterventionDetailView';
import { InterventionDetailEditForm } from './components/InterventionDetailEditForm';
import { InterventionStatusTransition } from './components/InterventionStatusTransition';
import { InterventionNotesSection } from './components/InterventionNotesSection';
import { interventionStatusLabel } from '@/entities/fsm/model/i18nStatusLabels';
import { getInterventionStatusStyle } from '@/entities/fsm/model/interventionStatus';
import {
  interventionPanelHeaderClass,
  interventionPanelSectionClass,
  interventionPanelShellClass,
} from './interventionPanelUi';

type Props = {
  selectedId: string | null;
  onClearSelection: () => void;
  permissions: {
    isManagement: boolean;
    canEditAssignedInterventionFields: boolean;
    canDeleteAnyNote: boolean;
    canDeleteOwnNotes: boolean;
  };
  role: CompanyRole | undefined;
  memberId: string | undefined;
  assignableTechnicians: CompanyMemberDto[];
};

export function InterventionDetailPanel({
  selectedId,
  onClearSelection,
  permissions,
  role,
  memberId,
  assignableTechnicians,
}: Props) {
  const {
    isManagement,
    canEditAssignedInterventionFields,
    canDeleteAnyNote,
    canDeleteOwnNotes,
  } = permissions;
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
    <Panel className={cabinetSplitDetailPanelClass(interventionPanelShellClass)}>
      <div className={interventionPanelHeaderClass}>
        <PanelHeader
          className="mb-0"
          title={t('company.fsm.interventions.detail.title')}
          action={
            isManagement && selectedId && !isLoadingDetail && detail ? (
              <button
                type="button"
                onClick={() => handleDelete(selectedId)}
                className="cursor-pointer text-xs font-semibold text-red-500 transition-colors hover:text-red-700"
              >
                {t('cabinet.common.delete')}
              </button>
            ) : undefined
          }
        />
      </div>

      {selectedId ? (
        isLoadingDetail || !detail ? (
          <div className={interventionPanelSectionClass}>
            <LoadingStatus
              label={t('company.fsm.interventions.detail.loading')}
              className="flex-1"
            >
              <SkeletonForm fields={5} />
            </LoadingStatus>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-[var(--dashboard-divider)] px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {detail.number}
                </p>
                <h3 className="mt-0.5 truncate text-lg font-black tracking-tight text-gray-900">
                  {detail.type}
                </h3>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getInterventionStatusStyle(
                  detail.status,
                )}`}
              >
                {interventionStatusLabel(detail.status, t)}
              </span>
            </div>

            <div className={`space-y-5 ${interventionPanelSectionClass}`}>
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
          </>
        )
      ) : (
        <div className={interventionPanelSectionClass}>
          <EmptyState message={t('company.fsm.interventions.detail.empty')} />
        </div>
      )}
      {confirmDialog}
    </Panel>
  );
}
